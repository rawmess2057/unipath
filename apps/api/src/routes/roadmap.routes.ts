import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { roadmapQueue } from '../queues/roadmap.queue.js';
import { prisma } from '../lib/prisma.js';
import { getProfile } from '../services/profile.service.js';

const router = Router();

router.post('/roadmap/generate', requireAuth, async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { clerkId: req.user!.clerkId } });
    if (!student) {
      res.status(404).json({ success: false, error: 'Student not found' });
      return;
    }

    const profile = await getProfile(req.user!.clerkId);
    const lastRoadmap = await prisma.roadmap.findFirst({
      where: { studentId: student.id, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (lastRoadmap) {
      await prisma.roadmap.update({
        where: { id: lastRoadmap.id },
        data: { isActive: false },
      });
    }

    const completedTasks = lastRoadmap
      ? await prisma.roadmapTask.findMany({
          where: { roadmapId: lastRoadmap.id, completed: true },
        })
      : [];

    const latestCv = await prisma.cvAnalysis.findFirst({
      where: { studentId: student.id, cvQualityScore: { not: null } },
      orderBy: { createdAt: 'desc' },
    });

    await roadmapQueue.add({
      profile: {
        fieldOfStudy: profile?.fieldOfStudy ?? '',
        university: profile?.university ?? '',
        graduationDate: profile?.graduationDate?.toISOString() ?? '',
        targetIndustry: (profile?.targetIndustry as string) ?? 'tech',
        visaStatus: (profile?.visaStatus as string) ?? 'student_visa',
        skills: (profile?.skills as string[]) ?? [],
        workExperiences: (profile?.workExperiences as any[]) ?? [],
        certifications: (profile?.certifications as any[]) ?? [],
      },
      completedTaskIds: completedTasks.map((t) => t.id),
      cvAnalysisId: latestCv?.id,
      studentId: student.id,
    });

    res.json({ success: true, data: { status: 'queued' } });
  } catch (err) {
    next(err);
  }
});

router.get('/roadmap', requireAuth, async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { clerkId: req.user!.clerkId } });
    if (!student) {
      res.status(404).json({ success: false, error: 'Student not found' });
      return;
    }

    const roadmap = await prisma.roadmap.findFirst({
      where: { studentId: student.id, isActive: true },
      include: { tasks: { orderBy: [{ phase: 'asc' }, { order: 'asc' }] } },
      orderBy: { createdAt: 'desc' },
    });

    if (!roadmap) {
      res.json({ success: true, data: null });
      return;
    }

    const visaContent = await prisma.visaContent.findMany({
      where: { isActive: true },
    });

    const tasksWithVisa = roadmap.tasks.map((task) => {
      if (!task.isVisaRelated) return task;
      const snippet = visaContent.find((v) => v.stage === task.phase);
      if (!snippet) return task;
      return {
        ...task,
        description: `${task.description}\n\n---\n${snippet.snippet}\n\n${snippet.disclaimer}`,
      };
    });

    res.json({
      success: true,
      data: {
        ...roadmap,
        tasks: tasksWithVisa,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/roadmap/tasks/:id/complete', requireAuth, async (req, res, next) => {
  try {
    const task = await prisma.roadmapTask.findFirst({
      where: {
        id: req.params.id as string,
        roadmap: { student: { clerkId: req.user!.clerkId } },
      },
    });

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    const updated = await prisma.roadmapTask.update({
      where: { id: task.id },
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
