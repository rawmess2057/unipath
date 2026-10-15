import { useEffect, useRef } from 'react';
import { attachFx, fxActive, sizeFx } from '../lib/fx';

export function ConfettiCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    attachFx(ref.current);
    const on = () => { if (fxActive()) sizeFx(); };
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('resize', on); attachFx(null); };
  }, []);
  return <canvas id="fx" ref={ref} />;
}
