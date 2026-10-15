import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from './routes';
import { Icon, type IconName } from '../ui/Icon';
import { useUi } from '../stores/ui';
import { useUcai } from '../stores/ucai';
import { useRoadmapView } from '../hooks/useRoadmapView';
import { useCompleteTask } from '../hooks/useCompleteTask';
import { useTheme, THEME_ICON, THEME_NAME } from './ThemeProvider';
import { setPremium } from '../lib/premium';

interface Item { sec: string; label: string; hint?: string; icon: IconName; run: () => void }

export function CommandPalette() {
  const nav = useNavigate();
  const setLayer = useUi((s) => s.setLayer);
  const premium = useUcai((s) => s.premium);
  const { today } = useRoadmapView();
  const { complete } = useCompleteTask();
  const { next, cycleTheme } = useTheme();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const close = () => setLayer(null);

  const items = useMemo<Item[]>(() => {
    const goTo: Item[] = ROUTES.filter((r) => !r.hidden).map((r) => ({ sec: 'Go to', label: r.title, icon: r.icon, run: () => nav(r.path) }));
    const acts: Item[] = [
      ...(today ? [{ sec: 'Actions', label: 'Complete today’s step', hint: today.name, icon: 'check' as IconName, run: () => { void complete(today); } }] : []),
      { sec: 'Actions', label: `Switch to ${THEME_NAME[next]} theme`, icon: THEME_ICON[next], run: cycleTheme },
      { sec: 'Actions', label: premium ? 'Turn off Premium preview' : 'Preview Premium', icon: 'spark', run: () => setPremium(!premium) },
      { sec: 'Actions', label: 'Upload a new CV', icon: 'upload', run: () => nav('/upload') },
      { sec: 'Actions', label: 'Log weekly activity', hint: 'Networking, interviews, practice', icon: 'flame', run: () => setLayer({ kind: 'checkin' }) },
      { sec: 'Actions', label: 'Replay onboarding', icon: 'compass', run: () => nav('/onboarding?replay=1') },
    ];
    const all = goTo.concat(acts);
    const n = q.trim().toLowerCase();
    return n ? all.filter((x) => (x.label + ' ' + (x.hint || '')).toLowerCase().includes(n)) : all;
  }, [q, today, premium, next, nav, complete, cycleTheme, setLayer]);

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { list.current?.querySelector('.pal-item.sel')?.scrollIntoView({ block: 'nearest' }); }, [sel]);

  const run = (it: Item) => { close(); it.run(); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(items.length - 1, s + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    if (e.key === 'Enter' && items[sel]) { e.preventDefault(); run(items[sel]); }
  };

  let sec = '';
  return (
    <div className="palette" role="dialog" aria-modal="true" aria-label="Jump to">
      <div className="pal-in">
        <Icon name="search" />
        <input ref={input} id="palIn" placeholder="Jump to a screen or run an action…" autoComplete="off" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} />
        <kbd>Esc</kbd>
      </div>
      <div className="pal-list" id="palList" role="listbox" ref={list}>
        {items.length === 0 && <p className="muted" style={{ padding: 16 }}>No matches. Try “cv”, “jobs” or “theme”.</p>}
        {items.map((it, i) => {
          const head = it.sec !== sec ? (sec = it.sec) : null;
          return (
            <div key={it.sec + it.label}>
              {head && <div className="pal-sec">{head}</div>}
              <button className={`pal-item${i === sel ? ' sel' : ''}`} role="option" aria-selected={i === sel} onMouseEnter={() => setSel(i)} onClick={() => run(it)}>
                <Icon name={it.icon} />{it.label}{it.hint && <small>{it.hint}</small>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
