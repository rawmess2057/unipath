import { useState, useRef, useEffect } from 'react';
import { useController } from 'react-hook-form';
import { Check, ChevronDown, Search } from 'lucide-react';
import { ModernDatePicker } from '../../../components/ui/ModernDatePicker';
import { UK_UNIVERSITIES } from '../../../lib/uk-universities';

interface StepBasicsProps {
  errors: Record<string, any>;
  register: any;
  setValue: any;
  control: any;
}

export function StepBasics({ errors, register, setValue, control }: StepBasicsProps) {
  const [uniOpen, setUniOpen] = useState(false);
  const [uniSearch, setUniSearch] = useState('');
  const [uniSelected, setUniSelected] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const { field: graduationDateField } = useController({ control, name: 'graduationDate' });

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
        <h2 className="text-xl font-bold text-white">Let's get started</h2>
        <p className="mt-1 text-sm text-brand-200">
          A few details to personalise your experience
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-100">Field of Study</label>
        <input
          placeholder="e.g., Computer Science"
          {...register('fieldOfStudy')}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-brand-300/60 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        {errors.fieldOfStudy && <p className="text-xs text-red-400">{errors.fieldOfStudy.message}</p>}
      </div>

      <div className="space-y-1.5" ref={ref}>
        <label className="text-sm font-medium text-brand-100">University</label>
        <div className="relative">
          <div
            className={`flex cursor-pointer items-center justify-between rounded-lg border bg-white/10 px-4 py-2.5 text-sm ${
              uniSelected ? 'text-white' : 'text-brand-300/60'
            } ${errors.university ? 'border-danger-500' : 'border-white/20'}`}
            onClick={() => setUniOpen(!uniOpen)}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setUniOpen(!uniOpen); }}
          >
            <span>{uniSelected || 'Select your university...'}</span>
            <ChevronDown className={`h-4 w-4 text-brand-300 transition-transform ${uniOpen ? 'rotate-180' : ''}`} />
          </div>

          {uniOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-white/20 bg-brand-900/95 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                <Search className="h-4 w-4 text-brand-300" />
                <input
                  className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-brand-300/60"
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
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-white/10 ${
                      uniSelected === uni
                        ? 'bg-brand-500/20 font-medium text-brand-200'
                        : 'text-brand-100'
                    }`}
                    onClick={() => {
                      setUniSelected(uni);
                      setValue('university', uni);
                      setUniOpen(false);
                      setUniSearch('');
                    }}
                  >
                    {uni}
                    {uniSelected === uni && <Check className="h-4 w-4 text-brand-400" />}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="px-4 py-3 text-sm text-brand-300">No universities found.</p>
                )}
              </div>
            </div>
          )}
        </div>
        {errors.university && <p className="text-xs text-red-400">{errors.university.message}</p>}
      </div>

      <div>
        <ModernDatePicker
          label="Graduation Date"
          value={graduationDateField.value ?? ''}
          onChange={(v) => graduationDateField.onChange(v)}
          error={errors.graduationDate?.message}
        />
      </div>
    </div>
  );
}