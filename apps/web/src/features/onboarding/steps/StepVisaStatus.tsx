import { SelectableCard } from '../../../components/ui/SelectableCard';

const visaOptions = [
  { value: 'student_visa', icon: '🎓', label: 'Student Visa', description: 'Currently studying in the UK' },
  { value: 'graduate_route', icon: '🛂', label: 'Graduate Route', description: 'Post-study work visa (2 years)' },
  { value: 'skilled_worker', icon: '💼', label: 'Skilled Worker Visa', description: 'Sponsored employment visa' },
  { value: 'other', icon: '❓', label: 'Other / Not sure', description: "We'll help you figure it out" },
];

interface StepVisaStatusProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export function StepVisaStatus({ value, onChange, error }: StepVisaStatusProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">What's your visa status?</h2>
        <p className="mt-1 text-sm text-slate-500">This helps us tailor timing and guidance.</p>
      </div>

      <div className="space-y-3">
        {visaOptions.map((opt) => (
          <SelectableCard
            key={opt.value}
            selected={value === opt.value}
            onClick={() => onChange(opt.value)}
            icon={<span>{opt.icon}</span>}
            label={opt.label}
            description={opt.description}
          />
        ))}
      </div>

      {error && <p className="text-xs text-danger-600">{error}</p>}
    </div>
  );
}
