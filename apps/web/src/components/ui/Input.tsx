import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-brand-100">{label}</label>
      )}
      <input
        className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-brand-200/60 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-brand-200/40 ${
          error ? 'border-danger-400 ring-danger-400/30' : 'border-white/10'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger-400">{error}</p>}
    </div>
  );
}
