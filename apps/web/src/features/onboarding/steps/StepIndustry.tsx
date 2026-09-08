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
        <h2 className="text-xl font-bold text-white">Your goals</h2>
        <p className="mt-1 text-sm text-brand-200">We use this to build your personalised roadmap.</p>
      </div>

      <div className="relative">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-lg border bg-white/10 px-4 py-2.5 text-sm ${
            value ? 'text-white' : 'text-brand-300/60'
          } ${error ? 'border-danger-500' : 'border-white/20'}`}
          onClick={() => setOpen(!open)}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setOpen(!open); }}
        >
          <span>{value || 'Select an industry...'}</span>
          <ChevronDown className={`h-4 w-4 text-brand-300 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>

        {open && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-white/20 bg-brand-900/95 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
              <Search className="h-4 w-4 text-brand-300" />
              <input
                className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-brand-300/60"
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
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-white/10 ${
                    value === industry
                      ? 'bg-brand-500/20 font-medium text-brand-200'
                      : 'text-brand-100'
                  }`}
                  onClick={() => { onChange(industry); setOpen(false); setSearch(''); }}
                >
                  {industry}
                  {value === industry && <Check className="h-4 w-4 text-brand-400" />}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-4 py-3 text-sm text-brand-300">No industries found.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}