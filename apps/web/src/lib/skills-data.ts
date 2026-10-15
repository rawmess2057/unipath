export const INDUSTRY_SKILLS: Record<string, string[]> = {
  Technology: [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'AWS',
    'Git', 'Docker', 'REST APIs', 'Agile', 'Machine Learning', 'Data Structures',
    'Problem Solving', 'Testing', 'Cloud Computing',
  ],
  Finance: [
    'Financial Analysis', 'Excel', 'Bloomberg', 'Valuation', 'Accounting',
    'Risk Management', 'SQL', 'Tableau', 'Python', 'Treasury', 'Compliance',
    'Financial Modelling', 'Attention to Detail', 'Data Analysis', 'Communication',
  ],
  Consulting: [
    'Data Analysis', 'Excel', 'PowerPoint', 'Stakeholder Management', 'Market Research',
    'Strategy', 'Project Management', 'Problem Solving', 'Communication',
    'Presentation Skills', 'Financial Modelling', 'Critical Thinking', 'Teamwork',
    'Client Management',
  ],
  Healthcare: [
    'Clinical Research', 'Data Analysis', 'Regulatory Affairs', 'Medical Terminology',
    'Patient Care', 'Healthcare IT', 'NHS Systems', 'Quality Assurance', 'Public Health',
    'Communication', 'Project Management', 'Clinical Trials', 'Research Methodology',
  ],
  Engineering: [
    'MATLAB', 'AutoCAD', 'SolidWorks', 'Python', 'Project Management', 'CFD',
    'Finite Element Analysis', 'CAD', 'Simulation', 'Problem Solving', 'Technical Drawing',
    'Testing & Validation', 'Data Analysis', 'Teamwork',
  ],
  Marketing: [
    'SEO', 'Google Analytics', 'Content Strategy', 'Social Media', 'SEM',
    'Marketing Automation', 'Data Analysis', 'Excel', 'Copywriting', 'Email Marketing',
    'Brand Management', 'Campaign Management', 'Creative Thinking', 'Communication',
  ],
  Law: [
    'Legal Research', 'Contract Law', 'Commercial Awareness', 'Negotiation', 'Drafting',
    'Compliance', 'Dispute Resolution', 'Regulatory Knowledge', 'Legal Writing',
    'Attention to Detail', 'Critical Thinking', 'Client Communication', 'Ethics',
  ],
  Education: [
    'Curriculum Design', 'Classroom Management', 'Assessment', 'Educational Technology',
    'Data Analysis', 'Safeguarding', 'Lesson Planning', 'Special Educational Needs',
    'Communication', 'Leadership', 'Evaluation & Reporting', 'Collaboration',
  ],
  Other: [
    'Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Time Management',
    'Data Analysis', 'Excel', 'Project Management', 'Adaptability', 'Critical Thinking',
    'Attention to Detail', 'Written Communication', 'Presentation Skills', 'Initiative',
  ],
};

export function skillsForIndustry(industry: string): string[] {
  return INDUSTRY_SKILLS[industry] ?? INDUSTRY_SKILLS.Other;
}
/* Skills gap view (from the prototype): [skill, level you have (0-4), level roles ask for (0-4)] */
export const SKILLSETS: Record<string, [string, number, number][]> = {
  'Business Analyst': [['SQL', 2, 3], ['Excel', 3, 3], ['Power BI', 1, 3], ['Stakeholder communication', 2, 4], ['Requirements & process mapping', 2, 3], ['Agile / Scrum', 2, 3]],
  'Data Analyst': [['SQL', 2, 4], ['Python', 1, 3], ['Excel', 3, 3], ['Power BI / Tableau', 1, 3], ['Statistics', 2, 3], ['Data storytelling', 2, 3]],
  'Marketing Executive': [['Content writing', 3, 4], ['Google Analytics', 1, 3], ['Social media ads', 2, 3], ['CRM tools', 1, 2], ['Copy for UK audiences', 2, 3], ['Canva / Figma', 3, 3]],
  'Project Coordinator': [['Planning & scheduling', 2, 3], ['Agile / Scrum', 2, 3], ['Risk logs', 1, 3], ['Stakeholder communication', 2, 4], ['MS Project / Jira', 1, 3], ['Reporting', 2, 3]],
};
export const LEVELS = ['None', 'Aware', 'Working', 'Confident', 'Strong'];

/**
 * Levels for the skills gap: a skill the student has listed on their profile
 * counts as "Working" at least; otherwise the prototype's example level is used.
 */
export function skillsetFor(role: string, profileSkills: string[]): [string, number, number][] {
  const set = SKILLSETS[role] || SKILLSETS['Business Analyst'];
  const mine = profileSkills.map((s) => s.toLowerCase());
  return set.map(([n, h, t]) => {
    const key = n.toLowerCase().split(' / ')[0];
    const has = mine.some((s) => s.includes(key) || key.includes(s));
    return [n, has ? Math.max(h, 2) : h, t];
  });
}
