import { useMemo } from 'react';
import { useOpportunities, type OpportunityFilters } from './useOpportunities';
import { useProfile } from './useProfile';
import { useUcai, type JobFilter, type JobSort } from '../stores/ucai';
import { scoreJob, type Job } from '../lib/match';

function apiFilters(f: JobFilter): OpportunityFilters {
  switch (f) {
    case 'Graduate scheme': return { employmentType: 'graduate' };
    case 'Internship': return { employmentType: 'internship' };
    case 'Placement': return { employmentType: 'placement' };
    case 'Saved': case 'Applied': return { saved: true };
    case 'Sponsor': return { visaSuitable: true };
    default: return {};
  }
}

const SORTS: Record<JobSort, (a: Job, b: Job) => number> = {
  match: (a, b) => b.match - a.match,
  close: (a, b) => (a.closeIso ?? '9999').localeCompare(b.closeIso ?? '9999'),
  pay: (a, b) => b.payNum - a.payNum,
};

/** All opportunities, scored against the profile (unfiltered). */
export function useAllJobs() {
  const { data, isLoading } = useOpportunities({});
  const { data: profile } = useProfile();
  const jobs = useMemo(() => (data ?? []).map((o) => scoreJob(o, profile)).sort(SORTS.match), [data, profile]);
  return { jobs, isLoading };
}

/** The job list as the Jobs page shows it: API filter + client search/sort. */
export function useJobsView() {
  const filter = useUcai((s) => s.jobFilter);
  const q = useUcai((s) => s.jobQ);
  const sort = useUcai((s) => s.jobSort);
  const premium = useUcai((s) => s.premium);
  const effective: JobFilter = filter === 'Sponsor' && !premium ? 'All' : filter;
  const { data, isLoading } = useOpportunities(apiFilters(effective));
  const { data: all } = useOpportunities({});
  const { data: profile } = useProfile();

  const list = useMemo(() => {
    let jobs = (data ?? []).map((o) => scoreJob(o, profile));
    if (effective === 'Applied') jobs = jobs.filter((j) => j.applied);
    const needle = q.trim().toLowerCase();
    if (needle) jobs = jobs.filter((j) => [j.title, j.co, j.loc, ...j.have, ...j.gap].join(' ').toLowerCase().includes(needle));
    return jobs.sort(SORTS[sort] ?? SORTS.match);
  }, [data, profile, effective, q, sort]);

  const allJobs = useMemo(() => (all ?? []).map((o) => scoreJob(o, profile)), [all, profile]);
  return {
    list, isLoading,
    total: all?.length ?? 0,
    savedCount: allJobs.filter((j) => j.saved).length,
    appliedCount: allJobs.filter((j) => j.applied).length,
    filtered: effective !== 'All' || !!q.trim(),
  };
}
