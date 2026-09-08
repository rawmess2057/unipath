import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { startOfWeek } from '../lib/week.js';
import { WeeklyCheckinInputSchema, type WeeklyCheckinData } from '@unipath/shared';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

function pointsFor(data: WeeklyCheckinData): number {
  return (data.networkingEvents ?? 0) * 3 + (data.interviews ?? 0) * 5 + (data.skillsPracticed ?? 0);
}

function jsonFor(data: WeeklyCheckinData): {
  networkingEvents: number;
  interviews: number;
  skillsPracticed: number;
  reflection?: string;
} {
  return {
    networkingEvents: data.networkingEvents,
    interviews: data.interviews,
    skillsPracticed: data.skillsPracticed,
    ...(data.reflection ? { reflection: data.reflection } : {}),
  };
}

interface CheckinRow {
  id: string;
  weekStart: Date;
  data: unknown;
  pointsEarned: number;
  updatedAt: Date;
}

function serialize(row: CheckinRow) {
  return {
    id: row.id,
    weekStart: row.weekStart.toISOString(),
    data: row.data,
    pointsEarned: row.pointsEarned,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function summaryFor(studentId: string, current: CheckinRow | null) {
  const weekStarts = await prisma.weeklyCheckin.findMany({
    where: { studentId },
    orderBy: { weekStart: 'desc' },
    select: { weekStart: true },
  });

  let streak = 0;
  const weekly = new Set(weekStarts.map((w) => w.weekStart.toISOString().slice(0, 10)));
  let cursor = current?.weekStart ?? startOfWeek(new Date());
  while (weekly.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return { current: current ? serialize(current) : null, streak };
}

router.get('/checkin', requireAuth, async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { clerkId: req.user!.clerkId },
      select: { id: true },
    });

    if (!student) {
      next(new AppError(401, 'Student not found'));
      return;
    }

    const current = await prisma.weeklyCheckin.findUnique({
      where: {
        studentId_weekStart: {
          studentId: student.id,
          weekStart: startOfWeek(new Date()),
        },
      },
    });

    const summary = await summaryFor(student.id, current);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

router.post('/checkin', requireAuth, async (req, res, next) => {
  try {
    const input = WeeklyCheckinInputSchema.parse(req.body);

    const student = await prisma.student.findUnique({
      where: { clerkId: req.user!.clerkId },
      select: { id: true },
    });

    if (!student) {
      next(new AppError(401, 'Student not found'));
      return;
    }

    const weekStart = startOfWeek(new Date());
    const data = jsonFor(input);
    const pointsEarned = pointsFor(input);

    const current = await prisma.weeklyCheckin.upsert({
      where: {
        studentId_weekStart: { studentId: student.id, weekStart },
      },
      create: {
        studentId: student.id,
        weekStart,
        data,
        pointsEarned,
      },
      update: { data, pointsEarned },
    });

    const summary = await summaryFor(student.id, current);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

export default router;