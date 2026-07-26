import Bull from 'bull';
import { env } from '../config/env.js';

export interface CvAnalysisJob {
  cvText: string;
  targetIndustry: string;
  fieldOfStudy: string;
  studentId: string;
  fileHash: string;
  cvAnalysisId: string;
}

export const cvAnalysisQueue = new Bull<CvAnalysisJob>('cv-analysis', {
  redis: env.REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 10,
    removeOnFail: 20,
  },
});
