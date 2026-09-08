import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import {
  OpportunityFiltersSchema,
  OpportunityStatusSchema,
  type Opportunity,
} from '@unipath/shared';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

router.get('/opportunities', requireAuth, async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { clerkId: req.user!.clerkId },
      select: { id: true },
    });

    if (!student) {
      res.json({ success: true, data: [] });
      return;
    }

    const filters = OpportunityFiltersSchema.parse(req.query ?? {});
    const savedOnly = filters.saved === '1' || filters.saved === 'true';

    const where: Record<string, unknown> = { isActive: true };
    if (filters.industry) where.industry = filters.industry;
    if (filters.employmentType) where.employmentType = filters.employmentType;
    if (filters.visaSuitable === '1' || filters.visaSuitable === 'true') {
      where.visaSuitable = true;
    }

    if (savedOnly) {
      where.studentOpportunities = {
        some: { studentId: student.id, status: { not: 'removed' } },
      };
    }

    const rows = await prisma.opportunity.findMany({
      where,
      include: {
        studentOpportunities: {
          where: { studentId: student.id },
          select: { status: true },
        },
      },
      orderBy: [{ deadline: 'asc' }, { title: 'asc' }],
    });

    const data = rows.map((row) => ({
      id: row.id,
      title: row.title,
      company: row.company,
      location: row.location,
      employmentType: row.employmentType,
      industry: row.industry,
      salaryRange: row.salaryRange,
      description: row.description,
      requirements: (row.requirements as string[] | null) ?? [],
      applicationUrl: row.applicationUrl,
      deadline: row.deadline ? row.deadline.toISOString() : null,
      visaSuitable: row.visaSuitable,
      sponsorshipNote: row.sponsorshipNote,
      status: (row.studentOpportunities[0]?.status as Opportunity['status']) ?? null,
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.patch('/opportunities/:id/status', requireAuth, async (req, res, next) => {
  try {
    const status = OpportunityStatusSchema.parse(req.body?.status);
    const id = String(req.params.id ?? '');

    const student = await prisma.student.findUnique({
      where: { clerkId: req.user!.clerkId },
      select: { id: true },
    });

    if (!student) {
      next(new AppError(401, 'Student not found'));
      return;
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });

    if (!opportunity || !opportunity.isActive) {
      next(new AppError(404, 'Opportunity not found'));
      return;
    }

    const appliedAt = status === 'applied' ? new Date() : null;

    const join = await prisma.studentOpportunity.upsert({
      where: {
        studentId_opportunityId: {
          studentId: student.id,
          opportunityId: opportunity.id,
        },
      },
      create: { studentId: student.id, opportunityId: opportunity.id, status, appliedAt },
      update: { status, appliedAt },
    });

    res.json({ success: true, data: { id: opportunity.id, status: join.status } });
  } catch (err) {
    next(err);
  }
});

router.delete('/opportunities/:id/saved', requireAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '');
    const student = await prisma.student.findUnique({
      where: { clerkId: req.user!.clerkId },
      select: { id: true },
    });

    if (!student) {
      next(new AppError(401, 'Student not found'));
      return;
    }

    await prisma.studentOpportunity.updateMany({
      where: { studentId: student.id, opportunityId: id },
      data: { status: 'removed' },
    });

    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
});

export default router;