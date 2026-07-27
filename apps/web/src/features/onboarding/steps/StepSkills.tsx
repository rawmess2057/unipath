import { useState } from 'react';
import { X, Plus } from 'lucide-react';

const skillSuggestions: Record<string, string[]> = {
  Technology: ['Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'AWS', 'Git', 'Docker', 'REST APIs', 'Agile', 'Machine Learning'],
  Finance: ['Financial Analysis', 'Excel', 'Bloomberg', 'Valuation', 'Accounting', 'Risk Management', 'SQL', 'Tableau', 'Python'],
  Consulting: ['Data Analysis', 'Excel', 'PowerPoint', 'Stakeholder Management', 'Market Research', 'Strategy', 'Project Management'],
  Healthcare: ['Clinical Research', 'Data Analysis', 'Regulatory Affairs', 'Medical Terminology', 'Patient Care', 'Healthcare IT'],
  Engineering: ['MATLAB', 'AutoCAD', 'SolidWorks', 'Python', 'Project Management', 'CFD', 'Finite Element Analysis'],
  Marketing: ['SEO', 'Google Analytics', 'Content Strategy', 'Social Media', 'SEM', 'Marketing Automation', 'Data Analysis', 'Excel'],
  Law: ['Legal Research', 'Contract Law', 'Commercial Awareness', 'Negotiation', 'Drafting', 'Compliance'],
  Education: ['Curriculum Design', 'Classroom Management', 'Assessment', 'Educational Technology', 'Data Analysis'],
  Other: ['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Time Management', 'Data Analysis', 'Excel', 'Project Management'],
};

interface StepSkillsProps {
  industry: string;
  values: string[];
  onChange: (skills: string[]) => void;
}

export function StepSkills({ industry, values, onChange }: StepSkillsProps) {
  const [input, setInput] = useState('');
  const skills = values ?? [];

  const addSkill = (s: string) => {
    const trimmed = s.trim();
    if (!trimmed || skills.includes(trimmed) || skills.length >= 10) return;
    onChange([...skills, trimmed]);
  };

  const removeSkill = (s: string) => {
    onChange(skills.filter((x) => x !== s));
  };

  const suggestions = skillSuggestions[industry] ?? skillSuggestions.Other;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Your top skills</h2>
        <p className="mt-1 text-sm text-slate-500">Select at least 3 — you can add more later.</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Common skills for {industry}</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => {
            const selected = skills.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => selected ? removeSkill(s) : addSkill(s)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selected
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
                {selected && <X className="ml-1 inline h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Add custom skills</p>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(input); setInput(''); } }}
            placeholder="Type a skill and press Enter"
            disabled={skills.length >= 10}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => { addSkill(input); setInput(''); }}
            disabled={!input.trim() || skills.length >= 10}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {skills.length > 0 && (
        <div>
          <p className={`mb-2 text-sm ${skills.length < 3 ? 'text-warning-600' : 'text-slate-500'}`}>
            {skills.length}/10 {skills.length < 3 ? '(minimum 3)' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-sm text-brand-700">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-brand-900" aria-label={`Remove ${s}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {skills.length >= 10 && <p className="text-xs text-warning-600">Maximum 10 skills reached for this step.</p>}
    </div>
  );
}
