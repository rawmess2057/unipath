import { useNavigate } from 'react-router-dom';
import { BrandMark } from '../ui/MiniNeedle';

export function Brand({ tagline = true, link = true }: { tagline?: boolean; link?: boolean }) {
  const nav = useNavigate();
  const go = () => nav('/');
  return (
    <div
      className={`brand${link ? ' brand-link' : ''}`}
      role={link ? 'link' : undefined}
      tabIndex={link ? 0 : undefined}
      title={link ? 'Go to the home page' : undefined}
      onClick={link ? go : undefined}
      onKeyDown={link ? (e) => { if (e.key === 'Enter') go(); } : undefined}
    >
      <div className="brand-mark"><BrandMark /></div>
      <div className="brand-name">Uni Compass AI{tagline && <small>Find your heading</small>}</div>
    </div>
  );
}
