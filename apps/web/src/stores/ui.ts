import { create } from 'zustand';
import type { ReactNode } from 'react';

export interface ToastItem {
  id: number;
  /** Dedupe key: identical consecutive toasts refresh in place instead of stacking. */
  key: string;
  content: ReactNode;
  pts?: number;
  out?: boolean;
}

export type Layer =
  | { kind: 'palette' }
  | { kind: 'milestone'; id: string }
  | { kind: 'checkin' }
  | null;

interface UiState {
  toasts: ToastItem[];
  layer: Layer;
  drawerOpen: boolean;
  /** Score before the last completion, so the dial/chip can animate from it. */
  prevScore: number | null;
  regenPending: boolean;
  setLayer: (l: Layer) => void;
  setDrawer: (open: boolean) => void;
  setPrevScore: (s: number | null) => void;
  setRegenPending: (v: boolean) => void;
  pushToast: (t: Omit<ToastItem, 'id'>) => void;
  markToastOut: (id: number) => void;
  removeToast: (id: number) => void;
}

let toastSeq = 0;

export const useUi = create<UiState>((set) => ({
  toasts: [],
  layer: null,
  drawerOpen: false,
  prevScore: null,
  regenPending: false,
  setLayer: (layer) => set({ layer }),
  setDrawer: (drawerOpen) => set({ drawerOpen }),
  setPrevScore: (prevScore) => set({ prevScore }),
  setRegenPending: (regenPending) => set({ regenPending }),
  pushToast: (t) =>
    set((s) => {
      const last = s.toasts[s.toasts.length - 1];
      if (last && last.key === t.key && !last.out) {
        // refresh in place: bump the id so the timer restarts
        return { toasts: [...s.toasts.slice(0, -1), { ...last, id: ++toastSeq }] };
      }
      const next = [...s.toasts, { ...t, id: ++toastSeq }];
      while (next.length > 2) next.shift();
      return { toasts: next };
    }),
  markToastOut: (id) => set((s) => ({ toasts: s.toasts.map((t) => (t.id === id ? { ...t, out: true } : t)) })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
