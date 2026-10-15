import { useLocation, useNavigate } from 'react-router-dom';
import { BOTTOM_NAV } from './routes';
import { Icon } from '../ui/Icon';
import { useUi } from '../stores/ui';

export function BottomNav() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const drawerOpen = useUi((s) => s.drawerOpen);
  const setDrawer = useUi((s) => s.setDrawer);
  const inMain = BOTTOM_NAV.some((b) => b.path === pathname);
  return (
    <nav className="bottom" id="bottom" aria-label="Quick navigation">
      {BOTTOM_NAV.map((b) => (
        <button key={b.path} aria-current={pathname === b.path ? 'page' : undefined} onClick={() => nav(b.path)}>
          <Icon name={b.icon} />{b.label}
        </button>
      ))}
      <button aria-current={inMain ? undefined : 'page'} aria-expanded={drawerOpen} onClick={() => setDrawer(!drawerOpen)}><Icon name="grid" />More</button>
    </nav>
  );
}
