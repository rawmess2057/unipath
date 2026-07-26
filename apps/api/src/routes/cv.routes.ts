import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { cvAnalysisQueue } from '../queues/cv-analysis.queue.js';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const upload = multer({
  dest: env.UPLOAD_DIR,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are allowed'));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

async function extractText(filePath: string): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  const buffer = await readFile(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

function computeHash(text: string, industry: string): string {
  return createHash('sha256').update(text + industry).digest('hex');
}

router.post('/cv/analyze', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const filePath = resolve(req.file.path);
    const cvText = await extractText(filePath);

    if (!cvText || cvText.trim().length < 50) {
      res.status(400).json({ success: false, error: 'CV text is too short or unreadable' });
      return;
    }

    const targetIndustry = (req.body.targetIndustry as string) ?? '';
    const fieldOfStudy = (req.body.fieldOfStudy as string) ?? '';
    const fileHash = computeHash(cvText, targetIndustry);

    const existing = await prisma.cvAnalysis.findFirst({
      where: { fileHash, student: { clerkId: req.user!.clerkId } },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      res.json({ success: true, data: { id: existing.id, cached: true } });
      return;
    }

    const student = await prisma.student.findUnique({ where: { clerkId: req.user!.clerkId } });
    if (!student) {
      res.status(404).json({ success: false, error: 'Student not found' });
      return;
    }

    const analysis = await prisma.cvAnalysis.create({
      data: {
        studentId: student.id,
        fileHash,
        originalFileName: req.file.originalname,
      },
    });

    await cvAnalysisQueue.add({
      cvText,
      targetIndustry,
      fieldOfStudy,
      studentId: student.id,
      fileHash,
      cvAnalysisId: analysis.id,
    });

    res.json({ success: true, data: { id: analysis.id, status: 'queued' } });
  } catch (err) {
    next(err);
  }
});

router.get('/cv/analysis/:id', requireAuth, async (req, res, next) => {
  try {
    const analysis = await prisma.cvAnalysis.findFirst({
      where: {
        id: req.params.id as string,
        student: { clerkId: req.user!.clerkId },
      },
    });

    if (!analysis) {
      res.status(404).json({ success: false, error: 'Analysis not found' });
      return;
    }

    const { cvQualityScore: _hidden, ...userFacing } = analysis;

    res.json({
      success: true,
      data: {
        ...userFacing,
        status: analysis.cvQualityScore !== null ? 'completed' : 'processing',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
