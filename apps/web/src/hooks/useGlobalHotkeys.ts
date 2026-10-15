import { useEffect } from 'react';
import { useUi } from '../stores/ui';

/** Ctrl/Cmd+K and "/" open the palette; Esc closes the layer, then the drawer. */
export function useGlobalHotkeys() {
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const ui = useUi.getState();
      const inField = /INPUT|TEXTAREA|SELECT/.test((document.activeElement as HTMLElement | null)?.tagName ?? '');
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        ui.setLayer(ui.layer ? null : { kind: 'palette' });
      } else if (e.key === 'Escape') {
        if (ui.layer) ui.setLayer(null);
        else if (ui.drawerOpen) ui.setDrawer(false);
      } else if (e.key === '/' && !inField && !ui.layer) {
        e.preventDefault();
        ui.setLayer({ kind: 'palette' });
      }
    };
    document.addEventListener('keydown', on);
    return () => document.removeEventListener('keydown', on);
  }, []);
}
