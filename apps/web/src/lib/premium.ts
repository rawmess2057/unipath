import { createElement } from 'react';
import { useUcai } from '../stores/ucai';
import { toast } from './toast';
import { burst } from './fx';
import { Icon } from '../ui/Icon';

export function setPremium(on: boolean) {
  const s = useUcai.getState();
  s.patch({ premium: on, jobFilter: !on && s.jobFilter === 'Sponsor' ? 'All' : s.jobFilter });
  toast(on
    ? createElement('span', null, createElement(Icon, { name: 'spark', sm: true }), 'Premium preview on. Everything unlocked.')
    : 'Back on the Free plan', { key: on ? 'premium-on' : 'premium-off' });
  if (on) burst(window.innerWidth / 2, 120, 70);
}
