/* Confetti burst, ported from the prototype. ConfettiCanvas attaches the <canvas id="fx">. */

interface Particle {
  x: number; y: number; vx: number; vy: number; w: number; h: number; r: number; vr: number;
  c: string; life: number; max: number;
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let parts: Particle[] = [];
let raf: number | null = null;

export const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function attachFx(el: HTMLCanvasElement | null) {
  canvas = el;
  ctx = el ? el.getContext('2d') : null;
}

export function sizeFx() {
  if (!canvas || !ctx) return;
  const d = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * d;
  canvas.height = window.innerHeight * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
}

export function burst(x: number, y: number, n = 90) {
  if (reducedMotion() || !canvas || !ctx) return;
  sizeFx();
  const cs = getComputedStyle(document.documentElement);
  const cols = ['--needle', '--indigo', '--amber', '--teal'].map((v) => cs.getPropertyValue(v).trim() || '#0A8A7E');
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 9;
    parts.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6,
      w: 4 + Math.random() * 5, h: 7 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35,
      c: cols[i % cols.length], life: 0, max: 90 + Math.random() * 40,
    });
  }
  if (!raf) raf = requestAnimationFrame(loop);
}

/** Burst from the centre of an element (or the viewport centre when absent). */
export function burstAt(el: Element | null | undefined, n?: number) {
  const r = el ? el.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
  burst(r.left + r.width / 2, r.top + r.height / 2, n);
}

function loop() {
  if (!ctx) { raf = null; return; }
  const W = window.innerWidth, H = window.innerHeight;
  ctx.clearRect(0, 0, W, H);
  parts.forEach((p) => {
    p.vy += 0.32; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
    ctx!.save();
    ctx!.globalAlpha = Math.max(0, 1 - p.life / p.max);
    ctx!.translate(p.x, p.y); ctx!.rotate(p.r); ctx!.fillStyle = p.c;
    ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
    ctx!.restore();
  });
  parts = parts.filter((p) => p.life < p.max && p.y < H + 40);
  if (parts.length) raf = requestAnimationFrame(loop);
  else { ctx.clearRect(0, 0, W, H); raf = null; }
}

export const fxActive = () => raf !== null;
