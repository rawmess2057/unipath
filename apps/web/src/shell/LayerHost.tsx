import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUi } from '../stores/ui';
import { CommandPalette } from './CommandPalette';
import { MILESTONES } from '../lib/milestones';
import { Medal } from '../ui/Medal';
import { Icon } from '../ui/Icon';
import { Btn } from '../ui/Btn';
import { Input } from '../ui/Field';
import { useCheckin, useSubmitCheckin } from '../hooks/useCheckin';
import { toast } from '../lib/toast';
import { burst } from '../lib/fx';

function MilestoneModal({ id }: { id: string }) {
  const m = MILESTONES.find((x) => x.id === id) ?? MILESTONES[0];
  const setLayer = useUi((s) => s.setLayer);
  const nav = useNavigate();
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="mt">
      <Medal id={m.id} className="big-medal" />
      <p className="eyebrow" style={{ margin: '6px 0 0' }}>Milestone unlocked</p>
      <h2 className="h1" id="mt" style={{ fontSize: 28 }}>{m.name}</h2>
      <p className="muted" style={{ margin: 0 }}>{m.desc}. Your badge just got a little shinier.</p>
      <div className="modal-actions">
        <Btn variant="primary" onClick={() => { setLayer(null); nav('/badge'); }}><Icon name="share" />Share this win</Btn>
        <Btn onClick={() => setLayer(null)}>Keep going</Btn>
      </div>
    </div>
  );
}

function CheckinModal() {
  const setLayer = useUi((s) => s.setLayer);
  const { data } = useCheckin();
  const submit = useSubmitCheckin();
  const cur = data?.current?.data;
  const [v, setV] = useState({ networkingEvents: cur?.networkingEvents ?? 0, interviews: cur?.interviews ?? 0, skillsPracticed: cur?.skillsPracticed ?? 0, reflection: cur?.reflection ?? '' });
  const num = (k: 'networkingEvents' | 'interviews' | 'skillsPracticed') => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: Math.max(0, Number(e.target.value) || 0) });
  const pts = v.networkingEvents * 3 + v.interviews * 5 + v.skillsPracticed;
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await submit.mutateAsync({ ...v, reflection: v.reflection || undefined });
      setLayer(null);
      burst(window.innerWidth / 2, window.innerHeight / 2, 60);
      toast('Week logged. Your Activity score will update.', { pts, key: 'checkin' });
    } catch { toast('That didn’t save. Try again.'); }
  };
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ck" style={{ textAlign: 'left', justifyItems: 'stretch' }}>
      <p className="eyebrow" style={{ margin: 0 }}>This week</p>
      <h2 className="h2" id="ck">Log your activity</h2>
      <p className="muted small" style={{ margin: 0 }}>Networking, interviews and practice feed your Activity score. Streak: {data?.streak ?? 0} week{(data?.streak ?? 0) === 1 ? '' : 's'}.</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 6 }}>
        <div className="form-grid">
          <Input id="ck-net" label="Networking events" type="number" min={0} max={20} value={v.networkingEvents} onChange={num('networkingEvents')} />
          <Input id="ck-int" label="Interviews" type="number" min={0} max={20} value={v.interviews} onChange={num('interviews')} />
        </div>
        <Input id="ck-sk" label="Skills practice sessions" type="number" min={0} max={50} value={v.skillsPracticed} onChange={num('skillsPracticed')} />
        <div className="field"><label htmlFor="ck-ref">Reflection <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label><textarea id="ck-ref" rows={3} maxLength={500} value={v.reflection} onChange={(e) => setV({ ...v, reflection: e.target.value })} placeholder="What went well? What will you do differently?" /></div>
        <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
          <Btn variant="primary" type="submit" disabled={submit.isPending}><Icon name="check" />Save week{pts ? ` · +${pts}` : ''}</Btn>
          <Btn variant="ghost" onClick={() => setLayer(null)}>Cancel</Btn>
        </div>
      </form>
    </div>
  );
}

/** Renders the prototype's #layer overlays and restores focus when they close. */
export function LayerHost() {
  const layer = useUi((s) => s.layer);
  const setLayer = useUi((s) => s.setLayer);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (layer) lastFocus.current = document.activeElement as HTMLElement | null;
    else if (lastFocus.current?.isConnected) { lastFocus.current.focus(); lastFocus.current = null; }
  }, [layer]);

  if (!layer) return <div id="layer" />;
  const modal = layer.kind !== 'palette';
  return (
    <div id="layer">
      <div className={`overlay${modal ? ' modal-ov' : ''}`} onMouseDown={(e) => { if (e.target === e.currentTarget) setLayer(null); }}>
        {layer.kind === 'palette' && <CommandPalette />}
        {layer.kind === 'milestone' && <MilestoneModal id={layer.id} />}
        {layer.kind === 'checkin' && <CheckinModal />}
      </div>
    </div>
  );
}
