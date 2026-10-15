import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dial } from '../../ui/Dial';
import { Icon } from '../../ui/Icon';
import { Btn } from '../../ui/Btn';
import { Chip } from '../../ui/Chip';
import { CountUp } from '../../ui/CountUp';
import { band } from '../../lib/score';
import { burst } from '../../lib/fx';

const DEMO_STEPS: [string, number, string][] = [
  ['Quantify 3 achievements on your CV', 4, 'Your CV’s top fix'],
  ['Rewrite your LinkedIn headline for UK recruiters', 3, 'Get found in recruiter searches'],
  ['Trim your personal statement to 80 words', 2, 'Quick CV win'],
  ['Shortlist 10 employers that suit your visa route', 3, 'Apply where you can be hired'],
  ['Practise one STAR interview answer', 4, 'Interview-ready'],
];

/** The interactive "try it" score card on the landing page. */
export function DemoDial() {
  const nav = useNavigate();
  const [s, setS] = useState(62);
  const [prev, setPrev] = useState<number | null>(null);
  const [i, setI] = useState(0);
  const [pops, setPops] = useState<{ id: number; x: number; y: number; n: number }[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const st = DEMO_STEPS[i];

  const step = (el: HTMLButtonElement) => {
    if (!st) return;
    const next = Math.min(100, s + st[1]);
    setPrev(s); setS(next); setI(i + 1);
    const r = el.getBoundingClientRect(), b = box.current!.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 60);
    const id = Date.now();
    setPops((p) => [...p, { id, x: r.left - b.left + r.width + 12, y: r.top - b.top - 6, n: st[1] }]);
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1300);
  };

  return (
    <div className="hero lp-demo" ref={box} aria-label="Interactive score demo">
      <div className="lp-demo-top"><p className="eyebrow" style={{ margin: 0 }}>Employability Score</p><Chip><i />Try it</Chip></div>
      <div className="lp-demo-grid">
        <Dial value={s} animateFrom={prev} />
        <div style={{ minWidth: 0 }}>
          <div className="big-score"><CountUp to={s} from={prev} dur={900} className="" /><small>/100</small></div>
          <div className="band-pill"><i />{band(s)}</div>
          <p style={{ margin: '12px 0 0', color: 'var(--hero-muted)', fontSize: 14 }}>Tap the step below and watch the needle move.</p>
        </div>
      </div>
      {st ? (
        <div className="lp-step" key={i}>
          <div className="lp-step-top"><p className="eyebrow" style={{ margin: 0 }}>Today’s bearing · {st[2]}</p><Chip tone="teal">+{st[1]} pts</Chip></div>
          <h3>{st[0]}</h3>
          <Btn variant="primary" onClick={(e) => step(e.currentTarget)}><Icon name="check" />Mark as done</Btn>
        </div>
      ) : (
        <div className="lp-step">
          <p className="eyebrow" style={{ margin: 0 }}>That’s the idea</p>
          <h3>Small steps, a needle that keeps moving. Your real roadmap is waiting.</h3>
          <Btn variant="primary" onClick={() => nav('/onboarding')}>Get my score <Icon name="arrow" /></Btn>
        </div>
      )}
      {pops.map((p) => <div key={p.id} className="lp-pop" style={{ left: p.x, top: p.y }}>+{p.n}</div>)}
    </div>
  );
}
