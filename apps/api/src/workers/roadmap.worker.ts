import { roadmapQueue } from '../queues/roadmap.queue.js';
import { RoadmapSchema } from '@unipath/shared';
import { getAiProvider } from '../lib/ai-provider.js';
import { loadPrompt, interpolate } from '../lib/prompt-loader.js';
import { callWithRetry } from '../lib/retry.js';
import { prisma } from '../lib/prisma.js';

roadmapQueue.process(async (job) => {
  const { profile, completedTaskIds, studentId } = job.data;

  const { system, user: userTemplate } = loadPrompt('roadmap', 'v1.0');
  const userPrompt = interpolate(userTemplate, {
    fieldOfStudy: profile.fieldOfStudy,
    university: profile.university,
    graduationDate: profile.graduationDate,
    targetIndustry: profile.targetIndustry,
    visaStatus: profile.visaStatus,
    skills: profile.skills.join(', '),
    workExperiencesCount: String(profile.workExperiences?.length ?? 0),
    totalRelevantMonths: String(
      profile.workExperiences?.filter((w: any) => w.isRelevant).length ?? 0,
    ),
    certifications: profile.certifications?.map((c: any) => c.name).join(', ') ?? 'None',
    cvQualityLine: '',
    completedTasks: completedTaskIds.length > 0 ? completedTaskIds.join(', ') : 'None',
    gapsAnalysis: 'Review profile for gaps',
  });

  const provider = getAiProvider();

  let result;
  try {
    result = await callWithRetry(
      () => provider.generateRoadmap(`${system}\n\n${userPrompt}`, RoadmapSchema),
      RoadmapSchema,
    );
  } catch {
    const { defaultRoadmaps } = await import('../lib/default-roadmaps.js');
    const industry = profile.targetIndustry ?? 'other';
    const tasks = defaultRoadmaps[industry] ?? defaultRoadmaps.other;
    result = {
      tasks,
      generation_metadata: {
        model_version: 'fallback',
        generated_at: new Date().toISOString(),
        profile_hash: '',
        is_fallback: true,
      },
    };
  }

  const roadmap = await prisma.roadmap.create({
    data: {
      studentId,
      generationMetadata: result.generation_metadata,
      isActive: true,
      tasks: {
        create: result.tasks.map((task) => ({
          id: task.id,
          phase: task.phase,
          order: task.order,
          title: task.title,
          description: task.description,
          category: task.category,
          estimatedEffort: task.estimated_effort,
          pointsValue: task.points_value,
          isVisaRelated: task.is_visa_related,
          prerequisites: task.prerequisites ?? [],
          resources: task.resources ?? [],
        })),
      },
    },
    include: { tasks: true },
  });

  return roadmap;
});

console.log('Roadmap worker registered');
