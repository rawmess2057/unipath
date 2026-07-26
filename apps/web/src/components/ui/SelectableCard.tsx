import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

interface SelectableCardProps {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  description: string;
}

export function SelectableCard({ selected, onClick, icon, label, description }: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
        selected
          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex-shrink-0 text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-slate-800">{label}</div>
        <div className="text-sm text-slate-500">{description}</div>
      </div>
      {selected && (
        <div className="flex-shrink-0 rounded-full bg-brand-500 p-1">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}
    </button>
  );
}
