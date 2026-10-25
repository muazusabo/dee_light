import Link from 'next/link';
import clsx from 'clsx';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { formatNaira } from '@/lib/format';

type Variant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger';
const btn = (variant: Variant = 'primary', size: 'sm' | 'md' | 'lg' = 'md') => clsx(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  size === 'sm' && 'min-h-9 px-3 text-sm', size === 'md' && 'min-h-11 px-4 text-sm', size === 'lg' && 'min-h-12 px-6 text-base',
  variant === 'primary' && 'bg-brand text-white hover:bg-brand-600',
  variant === 'secondary' && 'border border-brand bg-white text-brand hover:bg-brand-50',
  variant === 'gold' && 'bg-gold text-brand hover:bg-gold-600 hover:text-white',
  variant === 'ghost' && 'text-brand hover:bg-brand-50',
  variant === 'danger' && 'bg-red-700 text-white hover:bg-red-800',
);
export function Button({ variant, size, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  return <button type="button" className={clsx(btn(variant, size), className)} {...p} />;
}
export function ButtonLink({ href, variant, size, className, children }: { href: string; variant?: Variant; size?: 'sm' | 'md' | 'lg'; className?: string; children: ReactNode }) {
  return <Link href={href} className={clsx(btn(variant, size), className)}>{children}</Link>;
}

export function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: ReactNode; htmlFor: string }) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
const control = 'w-full rounded-md border border-line bg-white px-3 min-h-11 text-sm placeholder:text-muted/70 disabled:bg-paper';
export function Input({ className, error, ...p }: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input className={clsx(control, error && 'border-red-600', className)} aria-invalid={!!error} aria-describedby={error && p.id ? `${p.id}-error` : undefined} {...p} />;
}
export function Textarea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={clsx(control, 'py-2', className)} {...p} />; }
export function Select({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={clsx(control, 'pr-8', className)} {...p}>{children}</select>; }

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'gold'; children: ReactNode }) {
  return <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    tone === 'neutral' && 'bg-line text-ink', tone === 'success' && 'bg-green-100 text-green-900', tone === 'warning' && 'bg-amber-100 text-amber-900',
    tone === 'danger' && 'bg-red-100 text-red-900', tone === 'gold' && 'bg-gold text-brand')}>{children}</span>;
}
export function Alert({ tone = 'info', children, className }: { tone?: 'info' | 'error' | 'success'; children: ReactNode; className?: string }) {
  return <div role={tone === 'error' ? 'alert' : 'status'} className={clsx('rounded-md border px-4 py-3 text-sm', tone === 'info' && 'border-line bg-white', tone === 'error' && 'border-red-300 bg-red-50 text-red-900', tone === 'success' && 'border-green-300 bg-green-50 text-green-900', className)}>{children}</div>;
}
export function Skeleton({ className }: { className?: string }) { return <div aria-hidden className={clsx('animate-pulse rounded-md bg-line', className)} />; }
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (<div key={i} className="space-y-3"><Skeleton className="aspect-square w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/3" /></div>))}
    </div>
  );
}
export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-line bg-white px-6 py-14 text-center"><h2 className="text-xl font-semibold">{title}</h2>{message && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{message}</p>}{action && <div className="mt-5 flex justify-center">{action}</div>}</div>;
}
export function PageHeading({ title, description, children }: { title: string; description?: string | null; children?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-semibold text-brand md:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}</div>{children}</div>;
}
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {it.href ? <Link href={it.href} className="underline-offset-2 hover:underline">{it.label}</Link> : <span aria-current="page" className="text-ink">{it.label}</span>}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function Price({ amount, compare, from, className }: { amount: string | number; compare?: string | null; from?: boolean; className?: string }) {
  return (
    <p className={clsx('flex flex-wrap items-baseline gap-x-2', className)}>
      {from && <span className="text-xs text-muted">From</span>}
      <span className="font-semibold text-brand">{formatNaira(amount)}</span>
      {compare && Number(compare) > Number(amount) && <s className="text-sm text-muted"><span className="sr-only">Was </span>{formatNaira(compare)}</s>}
    </p>
  );
}
export function Pagination({ basePath, params, page, totalPages }: { basePath: string; params: Record<string, string | undefined>; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (p: number) => { const u = new URLSearchParams(); for (const [k, v] of Object.entries(params)) if (v && k !== 'page') u.set(k, v); if (p > 1) u.set('page', String(p)); const s = u.toString(); return s ? `${basePath}?${s}` : basePath; };
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && <Link className={btn('secondary', 'sm')} href={href(page - 1)} rel="prev">Previous</Link>}
      {pages.map((p, i) => (<span key={p} className="flex items-center gap-2">{i > 0 && pages[i - 1] !== p - 1 && <span aria-hidden>…</span>}
        <Link href={href(p)} aria-current={p === page ? 'page' : undefined} className={clsx(btn(p === page ? 'primary' : 'secondary', 'sm'), 'min-w-9')}>{p}</Link></span>))}
      {page < totalPages && <Link className={btn('secondary', 'sm')} href={href(page + 1)} rel="next">Next</Link>}
    </nav>
  );
}
