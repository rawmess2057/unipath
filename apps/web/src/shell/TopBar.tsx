import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { routeFor } from './routes';
import { Icon } from '../ui/Icon';
import { MiniNeedle } from '../ui/MiniNeedle';
import { CountUp } from '../ui/CountUp';
import { useScore } from '../hooks/useScore';
import { useStreak } from '../hooks/useStreak';
import { useUserName } from '../hooks/useUserName';
import { useUi } from '../stores/ui';
import { useTheme, THEME_ICON, THEME_NAME } from './ThemeProvider';

export function TopBar() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { data: score } = useScore();
  const { streak } = useStreak();
  const { initials } = useUserName();
  const prev = useUi((s) => s.prevScore);
  const setLayer = useUi((s) => s.setLayer);
  const drawerOpen = useUi((s) => s.drawerOpen);
  const setDrawer = useUi((s) => s.setDrawer);
  const { eff, next, cycleTheme } = useTheme();
  const total = score?.totalScore ?? 0;
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', on, { passive: true });
    on();
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    if (prev != null && prev !== total) setPulse((p) => p + 1);
  }, [total, prev]);

  const title = routeFor(pathname)?.title ?? 'Dashboard';

  return (
    <header className={`top${scrolled ? ' scrolled' : ''}`} id="top">
      <button className="icon-btn menu-btn" aria-label="Open menu" aria-expanded={drawerOpen} onClick={() => setDrawer(!drawerOpen)}><Icon name="menu" /></button>
      <div className="crumb" id="crumb">{title}</div>
      <button className="search" aria-label="Search and jump (Ctrl K)" onClick={() => setLayer({ kind: 'palette' })}>
        <Icon name="search" /><span>Jump to anything</span><kbd>Ctrl K</kbd>
      </button>
      <div className="streak-chip" title="Day streak"><Icon name="flame" /><b className="num" id="streakTop">{streak}</b><span>days</span></div>
      <button key={pulse} className={`score-chip${pulse ? ' pulse' : ''}`} id="scoreChip" aria-label={`Employability Score ${total}. Open dashboard`} onClick={() => nav('/dashboard')}>
        <MiniNeedle value={total} id="chipNeedle" />
        <b className="num" id="scoreTop"><CountUp to={total} from={prev} dur={900} className="" /></b>
        <span className="lbl" style={{ opacity: 0.7, fontWeight: 500 }}>score</span>
      </button>
      <button className="icon-btn" id="themeBtn" aria-label={`Theme: ${THEME_NAME[eff]}. Switch to ${THEME_NAME[next]}`} title={`${THEME_NAME[eff]} theme · click for ${THEME_NAME[next]}`} onClick={cycleTheme}>
        <Icon name={THEME_ICON[eff]} />
      </button>
      <button className="avatar" id="avatar" aria-label="Profile and settings" onClick={() => nav('/settings')}>{initials}</button>
    </header>
  );
}
