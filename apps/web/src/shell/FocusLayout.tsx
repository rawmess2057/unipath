import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LayerHost } from './LayerHost';
import { ToastHost } from './ToastHost';
import { ConfettiCanvas } from './ConfettiCanvas';
import { useBodyClass } from '../hooks/useBodyClass';
import { useGlobalHotkeys } from '../hooks/useGlobalHotkeys';
import { useUi } from '../stores/ui';

/** Shell-less layout for the landing page and onboarding (the prototype's body.focus). */
export function FocusLayout({ landing = false }: { landing?: boolean }) {
  const { pathname } = useLocation();
  const setLayer = useUi((s) => s.setLayer);
  useBodyClass('focus', true);
  useBodyClass('landing', landing);
  useGlobalHotkeys();
  useEffect(() => {
    setLayer(null);
    window.scrollTo(0, 0);
    document.title = landing ? 'Uni Compass AI' : 'Welcome · Uni Compass AI';
  }, [pathname, landing, setLayer]);
  return (
    <>
      <div className="app">
        <div className="main">
          <main id="view" key={pathname} className="enter" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
      <LayerHost />
      <ToastHost />
      <ConfettiCanvas />
    </>
  );
}
