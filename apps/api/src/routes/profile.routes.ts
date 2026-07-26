import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, upsertProfile } from '../services/profile.service.js';

const router = Router();

router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const profile = await getProfile(req.user!.clerkId);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

router.post('/profile', requireAuth, async (req, res, next) => {
  try {
    const profile = await upsertProfile(req.user!.clerkId, req.headers['x-clerk-email'] as string ?? '', req.body);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

export default router;
