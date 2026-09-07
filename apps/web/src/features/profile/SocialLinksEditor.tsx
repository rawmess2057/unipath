import { AtSign, Briefcase, GitBranch, Globe, Link2, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ExtraLinkDraft } from './profile-types';

interface SocialLinksEditorProps {
  draft: {
    portfolioUrl: string;
    githubUrl: string;
    linkedinUrl: string;
    websiteUrl: string;
    extraLinks: ExtraLinkDraft[];
  };
  onChange: (patch: Partial<SocialLinksEditorProps['draft']>) => void;
  editing: boolean;
}

const linkInput =
  'rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pl-9 text-sm text-white placeholder-brand-200/60 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:text-brand-200/40';

const linkPill =
  'inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-3 py-1.5 text-sm font-medium text-brand-200 transition-colors hover:bg-brand-500/30 hover:text-brand-100';

interface SavedLink {
  label: string;
  url: string;
  icon: ReactNode;
}

export function SocialLinksEditor({ draft, onChange, editing }: SocialLinksEditorProps) {
  const updateExtra = (index: number, patch: Partial<ExtraLinkDraft>) => {
    const next = draft.extraLinks.map((link, i) => (i === index ? { ...link, ...patch } : link));
    onChange({ extraLinks: next });
  };

  const removeExtra = (index: number) => {
    onChange({ extraLinks: draft.extraLinks.filter((_, i) => i !== index) });
  };

  if (!editing) {
    const savedLinks: SavedLink[] = [
      { label: 'Portfolio', url: draft.portfolioUrl, icon: <Briefcase className="h-4 w-4" /> },
      { label: 'GitHub', url: draft.githubUrl, icon: <GitBranch className="h-4 w-4" /> },
      { label: 'LinkedIn', url: draft.linkedinUrl, icon: <AtSign className="h-4 w-4" /> },
      { label: 'Website', url: draft.websiteUrl, icon: <Globe className="h-4 w-4" /> },
      ...draft.extraLinks
        .filter((link) => link.label.trim() && link.url.trim())
        .map((link) => ({ label: link.label, url: link.url, icon: <Link2 className="h-4 w-4" /> })),
    ].filter((link) => link.url.trim());

    if (savedLinks.length === 0) {
      return (
        <p className="text-sm text-brand-200/60">
          No links added yet. Hit &quot;Edit Profile&quot; to add portfolio, GitHub, LinkedIn, or other links.
        </p>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {savedLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className={linkPill}
            title={link.url}
          >
            {link.icon}
            {link.label}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-brand-200/50">
            <Briefcase className="h-4 w-4" />
          </span>
          <input
            disabled={!editing}
            placeholder="Portfolio URL"
            className={linkInput}
            value={draft.portfolioUrl}
            onChange={(e) => onChange({ portfolioUrl: e.target.value })}
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-brand-200/50">
            <GitBranch className="h-4 w-4" />
          </span>
          <input
            disabled={!editing}
            placeholder="GitHub URL"
            className={linkInput}
            value={draft.githubUrl}
            onChange={(e) => onChange({ githubUrl: e.target.value })}
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-brand-200/50">
            <AtSign className="h-4 w-4" />
          </span>
          <input
            disabled={!editing}
            placeholder="LinkedIn URL"
            className={linkInput}
            value={draft.linkedinUrl}
            onChange={(e) => onChange({ linkedinUrl: e.target.value })}
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-brand-200/50">
            <Globe className="h-4 w-4" />
          </span>
          <input
            disabled={!editing}
            placeholder="Personal website"
            className={linkInput}
            value={draft.websiteUrl}
            onChange={(e) => onChange({ websiteUrl: e.target.value })}
          />
        </div>
      </div>

      {draft.extraLinks.length > 0 && (
        <div className="space-y-2">
          {draft.extraLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Link2 className="h-4 w-4 flex-shrink-0 text-brand-200/50" />
              <input
                disabled={!editing}
                placeholder="Label (e.g. Behance)"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-brand-200/60 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:text-brand-200/40"
                value={link.label}
                onChange={(e) => updateExtra(idx, { label: e.target.value })}
              />
              <input
                disabled={!editing}
                placeholder="https://..."
                className="flex-[2] rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-brand-200/60 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:text-brand-200/40"
                value={link.url}
                onChange={(e) => updateExtra(idx, { url: e.target.value })}
              />
              <button type="button" onClick={() => removeExtra(idx)} className="text-brand-200/60 hover:text-danger-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {draft.extraLinks.length < 10 && (
        <button
          type="button"
          onClick={() => onChange({ extraLinks: [...draft.extraLinks, { label: '', url: '' }] })}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-white/20 px-3 py-1.5 text-sm text-brand-200 hover:border-brand-400 hover:text-brand-300"
        >
          <Plus className="h-4 w-4" /> Add custom link
        </button>
      )}
    </div>
  );
}