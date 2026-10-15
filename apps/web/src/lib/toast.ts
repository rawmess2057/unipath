import type { ReactNode } from 'react';
import { useUi } from '../stores/ui';

/**
 * Show a toast in the prototype's style. `pts` renders the teal "+N" badge.
 * The dedupe key defaults to the text when the content is a string.
 */
export function toast(content: ReactNode, opts: { pts?: number; key?: string } = {}) {
  const key = opts.key ?? (typeof content === 'string' ? content : String(Math.random()));
  useUi.getState().pushToast({ key, content, pts: opts.pts });
}
