import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { skillsForIndustry } from '../skills-data';

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

  const suggestions = skillsForIndustry(industry);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Your top skills</h2>
        <p className="mt-1 text-sm text-brand-200">Select at least 3 — you can add more later.</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-brand-100">Common skills for {industry}</p>
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
                    ? 'bg-brand-500/40 text-white'
                    : 'bg-white/10 text-brand-100 hover:bg-white/20'
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
        <p className="mb-2 text-sm font-medium text-brand-100">Add custom skills</p>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(input); setInput(''); } }}
            placeholder="Type a skill and press Enter"
            disabled={skills.length >= 10}
            className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-brand-300/60 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50"
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
          <p className={`mb-2 text-sm ${skills.length < 3 ? 'text-amber-300' : 'text-brand-200'}`}>
            {skills.length}/10 {skills.length < 3 ? '(minimum 3)' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-brand-500/30 px-3 py-1 text-sm text-brand-100">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-white" aria-label={`Remove ${s}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {skills.length >= 10 && <p className="text-xs text-amber-300">Maximum 10 skills reached for this step.</p>}
    </div>
  );
}