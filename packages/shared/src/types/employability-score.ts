export interface EmployabilityScore {
  totalScore: number;
  components: {
    cvQuality: number;
    skillsMatch: number;
    workExperience: number;
    certifications: number;
    platformActivity: number;
  };
  weights: {
    cvQuality: number;
    skillsMatch: number;
    workExperience: number;
    certifications: number;
    platformActivity: number;
  };
}

export interface ScoreInput {
  cvQualityScore: number | null;
  skillsMatch: {
    skills: string[];
    targetIndustry: string;
  };
  workExperience: {
    totalRelevantMonths: number;
    totalTransferableMonths: number;
  };
  certifications: {
    points: number;
  }[];
  platformActivity: {
    applications: number;
    networkingEvents: number;
    interviews: number;
    skillPractice: number;
  };
}
