import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { UK_UNIVERSITIES } from '../../../lib/uk-universities';

interface StepBasicsProps {
  values: Record<string, any>;
  errors: Record<string, any>;
  register: any;
  setValue: any;
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function StepBasics({ errors, register, setValue }: StepBasicsProps) {
  const [uniOpen, setUniOpen] = useState(false);
  const [uniSearch, setUniSearch] = useState('');
  const [uniSelected, setUniSelected] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = UK_UNIVERSITIES.filter((u) =>
    u.toLowerCase().includes(uniSearch.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setUniOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Let's get started</h2>
        <p className="mt-1 text-sm text-slate-500">
          A few details to personalise your experience
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Field of Study</label>
        <input
          placeholder="e.g., Computer Science"
          {...register('fieldOfStudy')}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {errors.fieldOfStudy && <p className="text-xs text-danger-600">{errors.fieldOfStudy.message}</p>}
      </div>

      <div className="space-y-1.5" ref={ref}>
        <label className="text-sm font-medium text-slate-700">University</label>
        <div className="relative">
          <div
            className={`flex cursor-pointer items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-sm ${
              uniSelected ? 'text-slate-800' : 'text-slate-400'
            } ${errors.university ? 'border-danger-400' : 'border-slate-200'}`}
            onClick={() => setUniOpen(!uniOpen)}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setUniOpen(!uniOpen); }}
          >
            <span>{uniSelected || 'Select your university...'}</span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${uniOpen ? 'rotate-180' : ''}`} />
          </div>

          {uniOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full border-none text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search universities..."
                  value={uniSearch}
                  onChange={(e) => setUniSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                {filtered.map((uni) => (
                  <button
                    key={uni}
                    type="button"
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                      uniSelected === uni
                        ? 'bg-brand-50 font-medium text-brand-700'
                        : 'text-slate-700'
                    }`}
                    onClick={() => {
                      setUniSelected(uni);
                      setValue('university', uni);
                      setUniOpen(false);
                      setUniSearch('');
                    }}
                  >
                    {uni}
                    {uniSelected === uni && <Check className="h-4 w-4 text-brand-500" />}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="px-4 py-3 text-sm text-slate-400">No universities found.</p>
                )}
              </div>
            </div>
          )}
        </div>
        {errors.university && <p className="text-xs text-danger-600">{errors.university.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Graduation Date</label>
        <input
          type="date"
          min={getTomorrow()}
          {...register('graduationDate')}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {errors.graduationDate && <p className="text-xs text-danger-600">{errors.graduationDate.message}</p>}
      </div>
    </div>
  );
}
