import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { calculateScore } from '../services/score-engine.js';
import type { ScoreInput } from '@unipath/shared';

const router = Router();

router.get('/score', requireAuth, async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { clerkId: req.user!.clerkId },
      include: { profile: true },
    });

    if (!student) {
      res.json({ success: true, data: null });
      return;
    }

    const latestCv = await prisma.cvAnalysis.findFirst({
      where: { studentId: student.id, cvQualityScore: { not: null } },
      orderBy: { createdAt: 'desc' },
    });

    const activeRoadmap = await prisma.roadmap.findFirst({
      where: { studentId: student.id, isActive: true },
      include: { tasks: { where: { completed: true } } },
    });

    const certPoints = ((student.profile?.certifications as any[]) ?? []).length * 5;

    const completedTaskCount = activeRoadmap?.tasks.length ?? 0;

    const input: ScoreInput = {
      cvQualityScore: latestCv?.cvQualityScore ?? null,
      skillsMatch: {
        skills: (student.profile?.skills as string[]) ?? [],
        targetIndustry: student.profile?.targetIndustry ?? '',
      },
      workExperience: {
        totalRelevantMonths: 0,
        totalTransferableMonths: 0,
      },
      certifications: Array.from({ length: Math.min(certPoints, 100) }, (_, i) => ({
        points: i + 1,
      })),
      platformActivity: {
        applications: 0,
        networkingEvents: 0,
        interviews: 0,
        skillPractice: completedTaskCount,
      },
    };

    if (input.certifications.length === 0 && certPoints > 0) {
      input.certifications = [{ points: certPoints }];
    }

    const result = calculateScore(input);

    await prisma.scoreSnapshot.create({
      data: {
        studentId: student.id,
        totalScore: result.totalScore,
        cvQuality: result.components.cvQuality,
        skillsMatch: result.components.skillsMatch,
        workExperience: result.components.workExperience,
        certifications: result.components.certifications,
        platformActivity: result.components.platformActivity,
      },
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
