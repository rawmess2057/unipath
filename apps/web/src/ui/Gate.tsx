import type { ReactNode } from 'react';
import { useUcai } from '../stores/ucai';
import { Icon } from './Icon';
import { Btn } from './Btn';
import { setPremium } from '../lib/premium';

/** Blurs `children` behind a Premium gate unless Premium preview is on. */
export function Gate({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  const premium = useUcai((s) => s.premium);
  if (premium) return <>{children}</>;
  return (
    <div className="gate-wrap">
      <div className="gated" aria-hidden="true" inert>{children}</div>
      <div className="gate">
        <div className="gate-card">
          <div className="gate-ico"><Icon name="lock" /></div>
          <h2 className="h2">{title}</h2>
          <p className="muted" style={{ margin: 0 }}>{body}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Btn variant="indigo" onClick={() => setPremium(true)}><Icon name="spark" />Preview Premium</Btn>
            <Btn to="/plans">Compare plans</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
