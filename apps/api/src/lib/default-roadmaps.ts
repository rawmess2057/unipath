import type { RoadmapTask } from '@unipath/shared';

function uid() {
  return crypto.randomUUID();
}

const baseFoundation = (): RoadmapTask[] => [
  { id: uid(), phase: 'foundation', order: 0, title: 'Complete your profile with education and skills', description: 'Fill in your field of study, university, and current skills to personalize your journey.', category: 'platform_activity', estimated_effort: '1_hour', points_value: 3, is_visa_related: false },
  { id: uid(), phase: 'foundation', order: 1, title: 'Create a UK-format CV', description: 'Remove photo, age, and marital status. Use UK date format (dd/mm/yyyy) and keep to 1-2 pages.', category: 'cv_quality', estimated_effort: '1_day', points_value: 5, is_visa_related: false },
  { id: uid(), phase: 'foundation', order: 2, title: 'Upload your CV for AI analysis', description: 'Get structured feedback on structure, keywords, clarity, and UK conventions.', category: 'cv_quality', estimated_effort: '1_hour', points_value: 3, is_visa_related: false, prerequisites: [] },
  { id: uid(), phase: 'foundation', order: 3, title: 'Optimise your LinkedIn profile', description: 'Add a UK-style headline, summary, and experience. Connect with classmates and lecturers.', category: 'skills_match', estimated_effort: 'half_day', points_value: 3, is_visa_related: false },
];

const techPreparation = (): RoadmapTask[] => [
  { id: uid(), phase: 'preparation', order: 0, title: 'Research 10 target tech companies in the UK', description: 'Look at graduate schemes at companies like Google, Deliveroo, Monzo, and fintech startups.', category: 'platform_activity', estimated_effort: 'half_day', points_value: 4, is_visa_related: false },
  { id: uid(), phase: 'preparation', order: 1, title: 'Complete a UK-recognised certification', description: 'AWS Cloud Practitioner, Azure Fundamentals, or Google Cloud Digital Leader.', category: 'certifications', estimated_effort: '1_week', points_value: 7, is_visa_related: false },
  { id: uid(), phase: 'preparation', order: 2, title: 'Practise coding challenges (LeetCode/HackerRank)', description: 'Focus on arrays, strings, and hash maps — common in UK tech grad interviews.', category: 'skills_match', estimated_effort: 'ongoing', points_value: 4, is_visa_related: false },
  { id: uid(), phase: 'preparation', order: 3, title: 'Attend a UK tech networking event', description: 'Join meetups, hackathons, or virtual careers fairs to build connections.', category: 'platform_activity', estimated_effort: 'half_day', points_value: 3, is_visa_related: false },
];

const financePreparation = (): RoadmapTask[] => [
  { id: uid(), phase: 'preparation', order: 0, title: 'Research 10 target finance firms in the UK', description: 'Focus on banks (Barclays, HSBC), fintechs (Revolut, Wise), and Big 4 (PwC, Deloitte).', category: 'platform_activity', estimated_effort: 'half_day', points_value: 4, is_visa_related: false },
  { id: uid(), phase: 'preparation', order: 1, title: 'Complete a finance certification', description: 'CFI FMVA, Bloomberg Market Concepts, or CFA Level 1 (if eligible).', category: 'certifications', estimated_effort: '1_week', points_value: 6, is_visa_related: false },
  { id: uid(), phase: 'preparation', order: 2, title: 'Prepare for numerical reasoning tests', description: 'Practice SHL-style tests used by most UK banks and consulting firms.', category: 'skills_match', estimated_effort: 'ongoing', points_value: 4, is_visa_related: false },
  { id: uid(), phase: 'preparation', order: 3, title: 'Attend a university careers fair', description: 'Most UK universities host autumn and spring careers fairs with recruiters from top firms.', category: 'platform_activity', estimated_effort: 'half_day', points_value: 3, is_visa_related: false },
];

const baseApplication = (): RoadmapTask[] => [
  { id: uid(), phase: 'application', order: 0, title: 'Submit your first job application', description: 'Apply to a role that matches your profile. Track it in a spreadsheet.', category: 'platform_activity', estimated_effort: '1_day', points_value: 5, is_visa_related: true },
  { id: uid(), phase: 'application', order: 1, title: 'Practice STAR format interview answers', description: 'Prepare 5 stories using Situation, Task, Action, Result format.', category: 'skills_match', estimated_effort: 'half_day', points_value: 4, is_visa_related: false },
  { id: uid(), phase: 'application', order: 2, title: 'Complete a mock interview', description: 'Use your university careers service or a platform like Shortlist.', category: 'platform_activity', estimated_effort: '1_hour', points_value: 3, is_visa_related: false },
  { id: uid(), phase: 'application', order: 3, title: 'Follow up after interviews', description: 'Send a thank-you email within 24 hours. Reflect on what went well.', category: 'platform_activity', estimated_effort: '1_hour', points_value: 2, is_visa_related: false },
];

export const defaultRoadmaps: Record<string, RoadmapTask[]> = {
  tech: [...baseFoundation(), ...techPreparation(), ...baseApplication()],
  finance: [...baseFoundation(), ...financePreparation(), ...baseApplication()],
  consulting: [...baseFoundation(), ...financePreparation(), ...baseApplication()],
  healthcare: [...baseFoundation(), ...techPreparation(), ...baseApplication()],
  engineering: [...baseFoundation(), ...techPreparation(), ...baseApplication()],
  marketing: [...baseFoundation(), ...techPreparation(), ...baseApplication()],
  other: [...baseFoundation(), ...techPreparation(), ...baseApplication()],
};
