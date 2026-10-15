import { createElement, useEffect, useState } from 'react';
import { useUcai, type Theme } from '../stores/ucai';
import type { IconName } from '../ui/Icon';
import { Icon } from '../ui/Icon';
import { toast } from '../lib/toast';

export const THEME_NEXT: Record<Theme, Theme> = { light: 'dim', dim: 'dark', dark: 'light' };
export const THEME_ICON: Record<Theme, IconName> = { light: 'sun', dim: 'dim', dark: 'moon' };
export const THEME_NAME: Record<Theme, string> = { light: 'Light', dim: 'Dim', dark: 'Dark' };

const systemDark = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;

/** The theme in effect (System resolves to light/dark). */
export const effTheme = (): Theme => useUcai.getState().theme ?? (systemDark() ? 'dark' : 'light');

export function setTheme(t: Theme | null) {
  useUcai.getState().patch({ theme: t });
}

export function cycleTheme() {
  const next = THEME_NEXT[effTheme()];
  setTheme(next);
  toast(createElement('span', null, createElement(Icon, { name: THEME_ICON[next], sm: true }), `${THEME_NAME[next]} theme`), { key: 'theme-' + next });
}

/** Reactive theme values for components. */
export function useTheme() {
  const theme = useUcai((s) => s.theme);
  const [sys, setSys] = useState(systemDark);
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const on = () => setSys(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const eff: Theme = theme ?? (sys ? 'dark' : 'light');
  return { theme, eff, next: THEME_NEXT[eff], setTheme, cycleTheme };
}

/** Applies <html data-theme> whenever the stored theme changes. */
export function ThemeProvider() {
  const theme = useUcai((s) => s.theme);
  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme);
    else document.documentElement.removeAttribute('data-theme');
  }, [theme]);
  return null;
}
