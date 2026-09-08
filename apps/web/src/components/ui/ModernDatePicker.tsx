import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { CalendarDays } from 'lucide-react';

const CALENDAR_THEME = `
.rdp-unipath .rdp-month_caption { color: #f1f5f9; font-weight: 600; font-size: 0.875rem; }
.rdp-unipath .rdp-weekday { color: rgba(191, 219, 254, 0.55); font-weight: 500; font-size: 0.75rem; }
.rdp-unipath .rdp-day_button { color: rgba(241, 245, 249, 0.92); }
.rdp-unipath .rdp-day_button:hover:not(:disabled) { background: rgba(255, 255, 255, 0.12); color: #fff; }
.rdp-unipath .rdp-selected .rdp-day_button { color: #fff; }
.rdp-unipath .rdp-disabled { color: rgba(148, 163, 184, 0.4); }
.rdp-unipath .rdp-nav_button { border-radius: 0.5rem; }
.rdp-unipath .rdp-nav_button:hover:not(:disabled) { background: rgba(255, 255, 255, 0.12); }
`;

function parseISODate(value: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d, 12);
}

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

interface ModernDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
}

export function ModernDatePicker({
  value,
  onChange,
  label,
  error,
  placeholder = 'Select a date',
}: ModernDatePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = parseISODate(value);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-brand-100">{label}</label>}

      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={`flex w-full items-center justify-between rounded-lg border bg-white/10 px-4 py-2.5 text-sm transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
            error ? 'border-danger-500 ring-danger-500/30' : 'border-white/20'
          }`}
        >
          <span className={selected ? 'text-white' : 'text-brand-300/60'}>
            {selected
              ? selected.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : placeholder}
          </span>
          <CalendarDays className="h-4 w-4 text-brand-300" />
        </button>

        {open && (
          <div className="rdp-unipath absolute left-0 right-0 z-30 mt-2 rounded-xl border border-white/20 bg-brand-900/95 p-3 shadow-2xl backdrop-blur">
            <style>{CALENDAR_THEME}</style>
            <div
              style={{
                ['--rdp-accent-color' as string]: '#60a5fa',
                ['--rdp-accent-background-color' as string]: 'rgba(37, 99, 235, 0.35)',
                ['--rdp-today-color' as string]: '#93c5fd',
              }}
            >
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={(day) => {
                  if (day) onChange(toISODate(day));
                  setOpen(false);
                }}
                disabled={{ before: startOfToday() }}
                weekStartsOn={1}
              />
            </div>
            {selected && (
              <div className="mt-1 flex justify-between gap-2 border-t border-white/10 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-200 hover:bg-white/10"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => { onChange(''); setOpen(false); }}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-200 hover:bg-white/10"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}