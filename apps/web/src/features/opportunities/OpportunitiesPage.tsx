import { useState } from 'react';
import { Bookmark, BookmarkCheck, Briefcase, Clock, MapPin, Upload, Building2, ShieldCheck, CalendarDays, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Opportunity, OpportunityEmploymentType } from '@unipath/shared';
import { useOpportunities, useOpportunityStatus } from '../../hooks/useOpportunities';
import { useProfile } from '../../hooks/useProfile';
import { PageTransition } from '../../components/animations/PageTransition';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const INDUSTRIES = ['technology', 'finance', 'consulting', 'engineering', 'marketing', 'healthcare', 'other'] as const;
const EMPLOYMENT_TYPES: OpportunityEmploymentType[] = ['internship', 'graduate', 'placement'];

const typeLabel: Record<OpportunityEmploymentType, string> = {
  internship: 'Internship',
  graduate: 'Graduate',
  placement: 'Placement',
};

function formatDeadline(iso: string | null): string {
  if (!iso) return 'Rolling deadline';
  const date = new Date(iso);
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return `Closed ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
  if (days <= 14) return `Closes in ${days}d`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface ApplyModalState {
  opp: Opportunity;
}

export function OpportunitiesPage() {
  const { data: profile } = useProfile();
  const profileIndustry = (profile as any)?.targetIndustry?.toLowerCase() as string | undefined;

  const [savedOnly, setSavedOnly] = useState(false);
  const [industry, setIndustry] = useState<string>(profileIndustry && (INDUSTRIES as readonly string[]).includes(profileIndustry) ? profileIndustry : '');
  const [employmentType, setEmploymentType] = useState<OpportunityEmploymentType | ''>('');
  const [visaSuitableOnly, setVisaSuitableOnly] = useState(false);
  const [applyTarget, setApplyTarget] = useState<ApplyModalState | null>(null);

  const { data: opportunities, isLoading } = useOpportunities({
    industry: industry || undefined,
    employmentType: employmentType || undefined,
    visaSuitable: visaSuitableOnly || undefined,
    saved: savedOnly || undefined,
  });

  const statusMutation = useOpportunityStatus();

  const markApplied = (opp: Opportunity) => {
    setApplyTarget(null);
    statusMutation.mutate(
      { id: opp.id, status: 'applied' },
      { onSuccess: () => toast.success(`Marked as applied — +points added to Activity score`) },
    );
  };

  const toggleSaved = (opp: Opportunity) => {
    const isSavedNow = opp.status === 'saved';
    statusMutation.mutate(
      { id: opp.id, status: isSavedNow ? 'removed' : 'saved' },
      {
        onSuccess: () =>
          toast.success(isSavedNow ? 'Removed from saved' : 'Saved to your shortlist'),
      },
    );
  };

  const isSaving = (opp: Opportunity) => opp.status === 'saved';
  const isApplied = (opp: Opportunity) => opp.status === 'applied';

  return (
    <PageTransition><div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Opportunities</h1>
        <p className="mt-1 text-sm text-brand-200">
          Visa-aware internships, placements and graduate schemes open to international students in the UK.
        </p>
      </div>

      <Card variant="glass" className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSavedOnly(false)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!savedOnly ? 'bg-white text-brand-800' : 'bg-white/10 text-brand-200 hover:bg-white/20'}`}
          >
            All
          </button>
          <button
            onClick={() => setSavedOnly(true)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${savedOnly ? 'bg-white text-brand-800' : 'bg-white/10 text-brand-200 hover:bg-white/20'}`}
          >
            <Bookmark className="h-3.5 w-3.5" /> Saved
          </button>
          <button
            onClick={() => setVisaSuitableOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${visaSuitableOnly ? 'bg-visa-500 text-white' : 'bg-white/10 text-brand-200 hover:bg-white/20'}`}
            title="Show only opportunities open to international students on a Student or Graduate visa"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Visa suitable
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="rounded-lg border border-white/10 bg-brand-800 px-3 py-2 text-sm text-brand-100 focus:border-brand-400 focus:outline-none"
          >
            <option value="">All industries</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i[0].toUpperCase() + i.slice(1)}</option>
            ))}
          </select>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as OpportunityEmploymentType | '')}
            className="rounded-lg border border-white/10 bg-brand-800 px-3 py-2 text-sm text-brand-100 focus:border-brand-400 focus:outline-none"
          >
            <option value="">All types</option>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>{typeLabel[t]}</option>
            ))}
          </select>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      ) : !opportunities || opportunities.length === 0 ? (
        <Card variant="glass" className="py-14 text-center">
          <Briefcase className="mx-auto h-10 w-10 text-brand-200/50" />
          <p className="mt-3 font-medium text-white">No opportunities found</p>
          <p className="mt-1 text-sm text-brand-200">
            {savedOnly
              ? 'You haven’t saved any opportunities yet. Tap the bookmark on a listing to build your shortlist.'
              : 'Try clearing filters or checking back soon.'}
          </p>
          {savedOnly && (
            <button
              onClick={() => setSavedOnly(false)}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50"
            >
              Browse all opportunities
            </button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {opportunities.map((opp) => (
            <Card key={opp.id} variant="glass" className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-brand-200">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="font-medium">{opp.company}</span>
                    <span className="text-brand-200/50">&middot;</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{opp.location}</span>
                  </div>
                  <h3 className="mt-1 font-semibold text-white">{opp.title}</h3>
                </div>
                <button
                  onClick={() => toggleSaved(opp)}
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${isSaving(opp) ? 'bg-brand-500/30 text-brand-300' : 'bg-white/5 text-brand-200 hover:bg-white/10'}`}
                  aria-label={isSaving(opp) ? 'Unsave opportunity' : 'Save opportunity'}
                  title={isSaving(opp) ? 'Remove from saved' : 'Save'}
                >
                  {isSaving(opp) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="slate">{typeLabel[opp.employmentType]}</Badge>
                <Badge variant="default">{opp.industry[0].toUpperCase() + opp.industry.slice(1)}</Badge>
                {opp.visaSuitable ? (
                  <Badge variant="default"><ShieldCheck className="mr-1 h-3 w-3" />Visa suitable</Badge>
                ) : (
                  <Badge variant="warning"><ShieldCheck className="mr-1 h-3 w-3" />Right-to-work needed</Badge>
                )}
                {opp.status && (
                  <Badge variant={isApplied(opp) ? 'success' : 'slate'}>{opp.status[0].toUpperCase() + opp.status.slice(1)}</Badge>
                )}
              </div>

              <p className="line-clamp-3 text-sm text-brand-100/80">{opp.description}</p>

              {opp.requirements && opp.requirements.length > 0 && (
                <ul className="space-y-1 text-xs text-brand-200">
                  {opp.requirements.slice(0, 3).map((r) => (
                    <li key={r} className="flex gap-1.5">
                      <span className="text-brand-400">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <div className="text-xs text-brand-200">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className={formatDeadline(opp.deadline)?.startsWith('Closes in') ? 'font-semibold text-warning-300' : ''}>
                      {formatDeadline(opp.deadline)}
                    </span>
                  </div>
                  {opp.salaryRange && (
                    <div className="mt-0.5 flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {opp.salaryRange}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isApplied(opp) && (
                    <button
                      onClick={() => setApplyTarget({ opp })}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-brand-800 hover:bg-brand-50"
                    >
                      <Upload className="h-3.5 w-3.5" /> Mark Applied
                    </button>
                  )}
                  {opp.applicationUrl && (
                    <a
                      href={opp.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-brand-100 hover:bg-white/10"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Apply
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!applyTarget}
        onClose={() => setApplyTarget(null)}
        header="Mark as applied?"
        body={
          applyTarget && (
            <div>
              <p className="text-sm text-brand-100">
                Confirm you have applied for{' '}
                <span className="font-semibold text-white">{applyTarget.opp.title}</span> at{' '}
                <span className="font-semibold text-white">{applyTarget.opp.company}</span>.
              </p>
              <p className="mt-2 text-xs text-brand-200">
                Job applications count toward your Platform Activity score.
              </p>
            </div>
          )
        }
        footer={
          <>
            <button
              onClick={() => setApplyTarget(null)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-brand-200 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={() => applyTarget && markApplied(applyTarget.opp)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50"
            >
              <Upload className="h-4 w-4" /> Yes, I applied
            </button>
          </>
        }
      />
    </div></PageTransition>
  );
}