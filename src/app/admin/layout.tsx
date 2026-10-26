'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import clsx from 'clsx';
import { Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth-provider';
import { useApi } from '@/hooks/use-api';

const links = [['/admin', 'Dashboard'], ['/admin/products', 'Products'], ['/admin/categories', 'Categories'], ['/admin/orders', 'Orders'], ['/admin/customers', 'Customers'], ['/admin/settings', 'Settings']];
type AdminSummary = { pendingOrders: number };
/** Client-side convenience only. Every /admin/* API call is re-authorised by the server. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const { data: summary, error: summaryError, reload } = useApi<AdminSummary>(user?.role === 'ADMIN' ? '/admin/summary' : null);
  useEffect(() => { if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(path)}`); else if (!loading && user && user.role !== 'ADMIN') router.replace('/'); }, [loading, user, router, path]);
  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    const timer = window.setInterval(() => { void reload(); }, 30_000);
    const refreshOnFocus = () => { void reload(); };
    window.addEventListener('focus', refreshOnFocus);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refreshOnFocus); };
  }, [user?.role, path, reload]);
  if (loading || !user || user.role !== 'ADMIN') return <div className="mx-auto max-w-7xl px-4 py-8"><Skeleton className="h-64" /></div>;
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      {summaryError && <p role="alert" className="mb-3 text-xs text-red-700">Order count could not be refreshed.</p>}
      <div className="grid min-w-0 gap-5 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="Admin" className="-mx-4 min-w-0 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex w-max min-w-full gap-1 sm:grid sm:w-auto sm:grid-cols-3 lg:flex lg:flex-col">
            {links.map(([href, label]) => { const on = href === '/admin' ? path === href : path.startsWith(href); return <Link key={href} href={href} aria-current={on ? 'page' : undefined} className={clsx('flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium', on ? 'bg-brand text-white' : 'text-ink hover:bg-brand-50')}><span>{label}</span>{href === '/admin/orders' && !!summary?.pendingOrders && <span aria-label={`${summary.pendingOrders} pending orders`} className={clsx('rounded-full px-2 py-0.5 text-xs', on ? 'bg-white text-brand' : 'bg-brand-100 text-brand')}>{summary.pendingOrders}</span>}</Link>; })}
          </div>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
