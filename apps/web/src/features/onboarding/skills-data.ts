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