import { cvAnalysisQueue } from '../queues/cv-analysis.queue.js';
import { CvAnalysisSchema } from '@unipath/shared';
import { getAiProvider } from '../lib/ai-provider.js';
import { loadPrompt, interpolate } from '../lib/prompt-loader.js';
import { callWithRetry } from '../lib/retry.js';
import { prisma } from '../lib/prisma.js';

cvAnalysisQueue.process(async (job) => {
  const { cvText, targetIndustry, fieldOfStudy, cvAnalysisId } = job.data;

  const { system, user: userTemplate } = loadPrompt('cv-analysis', 'v1.0');
  const userPrompt = interpolate(userTemplate, {
    cvText,
    targetIndustry,
    fieldOfStudy,
  });

  const provider = getAiProvider();

  const result = await callWithRetry(
    () => provider.analyzeCv(`${system}\n\n${userPrompt}`, CvAnalysisSchema),
    CvAnalysisSchema,
  );

  const {
    overall_assessment,
    structure,
    keywords,
    clarity,
    uk_conventions,
    cv_quality_score,
    confidence,
  } = result;

  await prisma.cvAnalysis.update({
    where: { id: cvAnalysisId },
    data: {
      overallSummary: overall_assessment.summary,
      strengths: overall_assessment.strengths,
      priorityImprovements: overall_assessment.priority_improvements,
      structureScore: structure.score,
      keywordsScore: keywords.score,
      clarityScore: clarity.score,
      ukConventionsScore: uk_conventions.score,
      cvQualityScore: cv_quality_score,
      confidence,
      complianceChecklist: uk_conventions.compliance_checklist,
      rawResponse: result,
    },
  });

  return result;
});

console.log('CV analysis worker registered');
