'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import clsx from 'clsx';
import { Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth-provider';

const tabs = [['/account', 'Overview'], ['/account/orders', 'Orders'], ['/account/profile', 'Profile']];
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => { if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(path)}`); }, [loading, user, router, path]);
  if (loading || !user) return <div className="mx-auto max-w-5xl px-4 py-8"><Skeleton className="h-48" /></div>;
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav aria-label="Account" className="mb-6 grid grid-cols-3 border-b border-line sm:flex sm:gap-2">
        {tabs.map(([href, label]) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined} className={clsx('-mb-px border-b-2 px-2 py-3 text-center text-sm font-medium sm:px-3', path === href ? 'border-gold text-brand' : 'border-transparent text-muted hover:text-brand')}>{label}</Link>)}
      </nav>
      {children}
    </div>
  );
}
