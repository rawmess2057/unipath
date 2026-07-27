import { useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

const industries = [
  'Technology', 'Finance', 'Consulting', 'Healthcare',
  'Engineering', 'Marketing', 'Law', 'Education', 'Other',
];

interface StepIndustryProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export function StepIndustry({ value, onChange, error }: StepIndustryProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = industries.filter((i) => i.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Your goals</h2>
        <p className="mt-1 text-sm text-slate-500">We use this to build your personalised roadmap.</p>
      </div>

      <div className="relative">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-sm ${
            value ? 'text-slate-800' : 'text-slate-400'
          } ${error ? 'border-danger-400' : 'border-slate-200'}`}
          onClick={() => setOpen(!open)}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setOpen(!open); }}
        >
          <span>{value || 'Select an industry...'}</span>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>

        {open && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="w-full border-none text-sm outline-none placeholder:text-slate-400"
                placeholder="Search industries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {filtered.map((industry) => (
                <button
                  key={industry}
                  type="button"
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    value === industry ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-700'
                  }`}
                  onClick={() => { onChange(industry); setOpen(false); setSearch(''); }}
                >
                  {industry}
                  {value === industry && <Check className="h-4 w-4 text-brand-500" />}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-4 py-3 text-sm text-slate-400">No industries found.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-danger-600">{error}</p>}
    </div>
  );
}
