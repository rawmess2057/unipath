import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { LayerHost } from './LayerHost';
import { ToastHost } from './ToastHost';
import { ConfettiCanvas } from './ConfettiCanvas';
import { MilestoneWatcher } from './MilestoneWatcher';
import { routeFor } from './routes';
import { useUi } from '../stores/ui';
import { useBodyClass } from '../hooks/useBodyClass';
import { useGlobalHotkeys } from '../hooks/useGlobalHotkeys';

export function AppShell() {
  const { pathname } = useLocation();
  const drawerOpen = useUi((s) => s.drawerOpen);
  const setDrawer = useUi((s) => s.setDrawer);
  const setLayer = useUi((s) => s.setLayer);
  const view = useRef<HTMLElement>(null);
  const first = useRef(true);
  useBodyClass('drawer', drawerOpen);
  useGlobalHotkeys();

  useEffect(() => {
    setDrawer(false);
    setLayer(null);
    window.scrollTo(0, 0);
    if (!first.current) view.current?.focus({ preventScroll: true });
    first.current = false;
    const r = routeFor(pathname);
    document.title = r ? `${r.title} · Uni Compass AI` : 'Uni Compass AI';
  }, [pathname, setDrawer, setLayer]);

  return (
    <>
      <a className="skip" href="#view">Skip to content</a>
      <div className="app">
        <Sidebar />
        <div className="drawer-scrim" onClick={() => setDrawer(false)} />
        <div className="main">
          <TopBar />
          <main id="view" key={pathname} className="enter" tabIndex={-1} ref={view}>
            <Outlet />
          </main>
        </div>
        <BottomNav />
      </div>
      <LayerHost />
      <ToastHost />
      <ConfettiCanvas />
      <MilestoneWatcher />
    </>
  );
}
