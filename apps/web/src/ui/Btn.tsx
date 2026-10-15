import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode, Ref } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'default' | 'primary' | 'indigo' | 'ghost';
type Size = 'md' | 'sm' | 'lg';

interface Common { variant?: Variant; size?: Size; className?: string; children?: ReactNode }
type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined; ref?: Ref<HTMLButtonElement> };
type LinkProps = Common & { to: string; href?: undefined } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;
type AnchorProps = Common & { href: string; to?: undefined } & AnchorHTMLAttributes<HTMLAnchorElement>;

const cls = (variant: Variant, size: Size, extra: string) =>
  ['btn', variant !== 'default' && `btn-${variant}`, size !== 'md' && `btn-${size}`, extra].filter(Boolean).join(' ');

export function Btn(props: ButtonProps | LinkProps | AnchorProps) {
  const { variant = 'default', size = 'md', className = '', children } = props;
  const c = cls(variant, size, className);
  if (props.to !== undefined) {
    const { variant: _v, size: _s, className: _c, children: _k, to, ...a } = props;
    return <Link to={to} className={c} {...a}>{children}</Link>;
  }
  if (props.href !== undefined) {
    const { variant: _v, size: _s, className: _c, children: _k, ...a } = props;
    return <a className={c} {...a}>{children}</a>;
  }
  const { variant: _v, size: _s, className: _c, children: _k, type, ...b } = props;
  return <button type={type ?? 'button'} className={c} {...b}>{children}</button>;
}
