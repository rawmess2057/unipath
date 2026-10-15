export type IconName =
  | 'home' | 'file' | 'upload' | 'check' | 'route' | 'brief' | 'bars' | 'mic' | 'history' | 'star' | 'share'
  | 'sliders' | 'compass' | 'flame' | 'lock' | 'search' | 'sun' | 'moon' | 'x' | 'arrow' | 'pin' | 'bookmark'
  | 'spark' | 'trophy' | 'copy' | 'refresh' | 'menu' | 'timer' | 'clock' | 'pound' | 'grid' | 'dim' | 'book';

export function Icon({ name, sm = false, className = '' }: { name: IconName; sm?: boolean; className?: string }) {
  return (
    <svg className={`i${sm ? ' i-sm' : ''}${className ? ' ' + className : ''}`} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}
