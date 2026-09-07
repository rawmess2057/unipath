import { Router } from 'express';
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';

mkdirSync(env.UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME: Record<string, string[]> = {
  avatar: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  certificate: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
};

const upload = multer({
  dest: env.UPLOAD_DIR,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!Object.values(ALLOWED_MIME).some((mimes) => mimes.includes(file.mimetype))) {
      cb(new Error('Unsupported file type. Use an image or PDF.'));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.post('/profile/upload', requireAuth, upload.single('file'), (req, res, next) => {
  try {
    const type = (req.body.type as string) ?? (req.query.type as string) ?? 'avatar';
    if (!ALLOWED_MIME[type]) {
      res.status(400).json({ success: false, error: 'Unknown upload type' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    if (!ALLOWED_MIME[type].includes(req.file.mimetype)) {
      res.status(400).json({ success: false, error: `Invalid file type for ${type}` });
      return;
    }

    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: { url: publicUrl, fileName: req.file.originalname, mimetype: req.file.mimetype },
    });
  } catch (err) {
    next(err);
  }
});

export default router;