import { NavLink } from 'react-router-dom';
import { ROUTES, NAV_GROUPS } from './routes';
import { Brand } from './Brand';
import { Icon } from '../ui/Icon';
import { Btn } from '../ui/Btn';
import { useUcai } from '../stores/ucai';
import { useUi } from '../stores/ui';

export function Sidebar() {
  const premium = useUcai((s) => s.premium);
  const setDrawer = useUi((s) => s.setDrawer);
  return (
    <aside className="side" id="side" aria-label="Main navigation">
      <Brand />
      <nav id="nav">
        {NAV_GROUPS.map((g) => (
          <div className="nav-group" key={g}>
            <div className="nav-label">{g}</div>
            {ROUTES.filter((r) => r.group === g && !r.hidden).map((r) => (
              <NavLink key={r.path} to={r.path} className="nav-item" end onClick={() => setDrawer(false)}>
                <Icon name={r.icon} />{r.title}{r.pro && !premium && <span className="pro">PRO</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="side-foot" id="sideFoot">
        {premium ? (
          <div className="plan-card"><b><Icon name="spark" sm /> Premium preview</b><p>All features unlocked in this preview.</p><Btn size="sm" to="/plans">Manage</Btn></div>
        ) : (
          <div className="plan-card"><b>Free plan</b><p>Mock interviews, CV history and visa-aware matching come with Premium.</p><Btn size="sm" variant="indigo" to="/plans">See Premium</Btn></div>
        )}
      </div>
    </aside>
  );
}
