import Bull from 'bull';
import { env } from '../config/env.js';

export interface RoadmapJobProfile {
  fieldOfStudy: string;
  university: string;
  graduationDate: string;
  targetIndustry: string;
  visaStatus: string;
  skills: string[];
  workExperiences: unknown[];
  certifications: unknown[];
}

export interface RoadmapJob {
  profile: RoadmapJobProfile;
  completedTaskIds: string[];
  cvAnalysisId?: string;
  studentId: string;
}

export const roadmapQueue = new Bull<RoadmapJob>('roadmap-generation', {
  redis: env.REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 10,
    removeOnFail: 20,
  },
});
