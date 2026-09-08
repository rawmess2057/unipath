import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { calculateScore } from '../services/score-engine.js';
import type { ScoreInput } from '@unipath/shared';

const MONTH_MS = 1000 * 60 * 60 * 24 * 30.44;

interface ExperienceEntry {
  startDate?: string;
  endDate?: string;
  current?: boolean;
  isRelevant?: boolean;
}

function computeExperienceMonths(experiences: unknown): {
  totalRelevantMonths: number;
  totalTransferableMonths: number;
} {
  const entries = Array.isArray(experiences) ? (experiences as ExperienceEntry[]) : [];
  let totalRelevantMonths = 0;
  let totalTransferableMonths = 0;

  for (const entry of entries) {
    const start = new Date(entry.startDate ?? '');
    if (Number.isNaN(start.getTime())) continue;

    const end = entry.current || !entry.endDate ? new Date() : new Date(entry.endDate);
    if (Number.isNaN(end.getTime())) continue;
    if (end.getTime() <= start.getTime()) continue;

    const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / MONTH_MS));
    if (entry.isRelevant) totalRelevantMonths += months;
    else totalTransferableMonths += months;
  }

  return { totalRelevantMonths, totalTransferableMonths };
}

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

    const completedTaskCount = activeRoadmap?.tasks.length ?? 0;

    const appliedCount = await prisma.studentOpportunity.count({
      where: { studentId: student.id, status: 'applied' },
    });

    const { totalRelevantMonths, totalTransferableMonths } = computeExperienceMonths(
      student.profile?.workExperiences,
    );

    const certifications = ((student.profile?.certifications as unknown[] | null) ?? []).map(
      () => ({ points: 5 }),
    );

    const input: ScoreInput = {
      cvQualityScore: latestCv?.cvQualityScore ?? null,
      skillsMatch: {
        skills: (student.profile?.skills as string[]) ?? [],
        targetIndustry: student.profile?.targetIndustry ?? '',
      },
      workExperience: {
        totalRelevantMonths,
        totalTransferableMonths,
      },
      certifications,
      platformActivity: {
        applications: appliedCount,
        networkingEvents: 0,
        interviews: 0,
        skillPractice: completedTaskCount,
      },
    };

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
