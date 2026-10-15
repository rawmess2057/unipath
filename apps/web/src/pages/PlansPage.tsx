import { PageHead } from '../ui/PageHead';
import { Icon } from '../ui/Icon';
import { Chip } from '../ui/Chip';
import { Toggle } from '../ui/Toggle';
import { useUcai } from '../stores/ucai';
import { FREE_FEATURES, PREM_FEATURES } from '../lib/plans';
import { setPremium } from '../lib/premium';

export function PlansPage() {
  const premium = useUcai((s) => s.premium);
  return (
    <>
      <PageHead eyebrow="Plans" title="Free does the heavy lifting" lede="The core platform is free for every student. Premium adds deeper coaching when you’re ready to apply." />
      <div className="plans">
        <section className="card plan">
          <div><p className="eyebrow">Free</p><div className="price">£0</div><p className="muted small" style={{ margin: '6px 0 0' }}>For every student, for as long as you study</p></div>
          <ul>{FREE_FEATURES.map((x) => <li key={x}><Icon name="check" />{x}</li>)}</ul>
          {!premium && <Chip tone="teal" style={{ alignSelf: 'flex-start' }}>Your plan</Chip>}
        </section>
        <section className="card plan premium">
          <div><p className="eyebrow" style={{ color: 'var(--hero-muted)' }}>Premium</p><div className="price">Coming soon</div><p className="muted small" style={{ margin: '6px 0 0' }}>Pricing announced at launch</p></div>
          <p style={{ margin: 0, fontWeight: 600 }}>Everything in Free, plus</p>
          <ul>{PREM_FEATURES.map((x) => <li key={x}><Icon name="spark" />{x}</li>)}</ul>
          <div className="preview-row" style={{ marginTop: 'auto' }}>
            <div><b>Preview Premium</b><div className="small muted">Unlock Premium screens while we build it</div></div>
            <Toggle on={premium} onChange={setPremium} label="Preview Premium" />
          </div>
        </section>
      </div>
    </>
  );
}
