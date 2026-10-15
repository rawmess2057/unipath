import { band } from './score';
import { monthShortYear } from './dates';
import type { BadgeStyle } from '../stores/ucai';

export interface BadgeInput { style: BadgeStyle; score: number; name: string; course: string; role: string }

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/** Draws the 1200×1000 share badge (ported from the prototype). */
export function drawBadge({ style: v, score: sc, name, course, role }: BadgeInput) {
  const W = 1200, H = 1000, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;
  const fg = v === 'paper' ? '#0C1A1D' : v === 'teal' ? '#F2FFFD' : '#F2F4FF';
  const sub = v === 'paper' ? '#56686C' : 'rgba(255,255,255,0.72)';
  const needle = v === 'paper' ? '#077468' : '#45EBD5';
  rr(ctx, 0, 0, W, H, 72); ctx.save(); ctx.clip();
  if (v === 'paper') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); }
  else if (v === 'teal') { const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0A8A7E'); g.addColorStop(0.7, '#0B5E6B'); g.addColorStop(1, '#16195A'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  else { ctx.fillStyle = '#16195A'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W, 0, 0, W, 0, 900); g.addColorStop(0, 'rgba(69,235,213,0.32)'); g.addColorStop(1, 'rgba(69,235,213,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  ctx.strokeStyle = v === 'paper' ? 'rgba(12,26,29,0.10)' : 'rgba(255,255,255,0.13)'; ctx.lineWidth = 2;
  [380, 260, 140].forEach((r) => { ctx.beginPath(); ctx.arc(W - 80, H - 80, r, 0, Math.PI * 2); ctx.stroke(); });
  ctx.restore();
  if (v === 'paper') { ctx.strokeStyle = '#D9E3E3'; ctx.lineWidth = 3; rr(ctx, 1.5, 1.5, W - 3, H - 3, 72); ctx.stroke(); }
  const X = 84;
  ctx.save(); ctx.translate(X + 30, 114);
  ctx.strokeStyle = fg; ctx.globalAlpha = 0.45; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.rotate((sc * 3.6 * Math.PI) / 180); ctx.fillStyle = needle; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(7, 0); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(X + 30, 114, 5, 0, Math.PI * 2); ctx.fill();
  ctx.textBaseline = 'alphabetic'; ctx.fillStyle = fg; ctx.font = "700 38px Sora, 'Segoe UI', sans-serif"; ctx.fillText('Uni Compass AI', X + 82, 128);
  ctx.font = "600 24px 'JetBrains Mono', monospace"; ctx.fillStyle = sub; ctx.textAlign = 'right';
  ctx.fillText(('SELF-REPORTED · ' + monthShortYear()).toUpperCase(), W - X, 124); ctx.textAlign = 'left';
  ctx.font = "600 26px 'JetBrains Mono', monospace"; ctx.fillText('EMPLOYABILITY SCORE', X, 360);
  ctx.fillStyle = fg; ctx.font = "800 300px Sora, 'Segoe UI', sans-serif"; ctx.fillText(String(sc), X - 10, 620);
  ctx.font = "600 56px Sora, 'Segoe UI', sans-serif"; ctx.fillText(band(sc), X, 712);
  const fit = (t: string, max: number) => { let s2 = t; while (ctx.measureText(s2).width > max && s2.length > 4) s2 = s2.slice(0, -2); return s2 === t ? t : s2.trimEnd() + '…'; };
  ctx.font = "700 40px 'DM Sans', 'Segoe UI', sans-serif"; ctx.fillText(fit(name || 'Your name', W - 2 * X), X, 812);
  ctx.fillStyle = sub; ctx.font = "500 30px 'DM Sans', 'Segoe UI', sans-serif"; ctx.fillText(fit(course, W - 2 * X), X, 860);
  ctx.fillStyle = fg; ctx.font = "600 30px 'DM Sans', 'Segoe UI', sans-serif"; ctx.fillText(fit('Heading: ' + role, W - 2 * X), X, 912);
  return cv;
}

export async function downloadBadge(input: BadgeInput) {
  if (document.fonts?.ready) await document.fonts.ready;
  const blob = await new Promise<Blob>((res, rej) => drawBadge(input).toBlob((b) => (b ? res(b) : rej(new Error('no image'))), 'image/png'));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `Uni-Compass-badge-${input.score}.png`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
