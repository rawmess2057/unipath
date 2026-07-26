interface StepBasicsProps {
  values: Record<string, any>;
  errors: Record<string, any>;
  register: any;
}

export function StepBasics({ errors, register }: StepBasicsProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Let's start with the basics</h2>
        <p className="mt-1 text-sm text-slate-500">This helps us understand your background.</p>
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

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">University</label>
        <input
          placeholder="e.g., University of Manchester"
          {...register('university')}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {errors.university && <p className="text-xs text-danger-600">{errors.university.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Graduation Date</label>
        <input
          type="date"
          {...register('graduationDate')}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {errors.graduationDate && <p className="text-xs text-danger-600">{errors.graduationDate.message}</p>}
      </div>
    </div>
  );
}
