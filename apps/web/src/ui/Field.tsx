import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

export function Field({ id, label, children }: { id: string; label: ReactNode; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

export function Input({ id, label, className = '', ...rest }: { id: string; label: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field id={id} label={label}>
      <input id={id} className={['input', className].filter(Boolean).join(' ')} {...rest} />
    </Field>
  );
}

export function Select({ id, label, children, ...rest }: { id: string; label: ReactNode; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field id={id} label={label}>
      <select id={id} {...rest}>{children}</select>
    </Field>
  );
}
