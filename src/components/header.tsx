'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useAuth } from '@/features/auth-provider';
import { useCart } from '@/features/cart-provider';

export function Header({ items, storeName }: { items: { href: string; label: string }[]; storeName: string }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const nav = [...items, { href: '/about', label: 'About' }];
  const active = (href: string) => pathname === href || pathname.startsWith(href + '/');

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const cart = (
    <Link href="/cart" className="relative inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-brand hover:bg-brand-50" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
      <ShoppingCart size={20} aria-hidden /><span className="hidden xl:inline">Cart</span>
      <span className="min-w-5 rounded-full bg-gold px-1.5 text-center text-xs font-bold text-brand" aria-hidden>{count}</span>
    </Link>
  );
  const account = loading ? null : user ? (
    <>
      {user.role === 'ADMIN' && <Link href="/admin" className="min-h-11 content-center px-2 text-sm font-medium text-brand hover:underline">Admin</Link>}
      <Link href="/account" className="min-h-11 content-center px-2 text-sm font-medium text-brand hover:underline">Account</Link>
      <button type="button" onClick={() => logout()} className="min-h-11 rounded-md px-2 text-sm font-medium text-brand hover:bg-brand-50">Log out</button>
    </>
  ) : (
    <>
      <Link href="/login" className="min-h-11 content-center rounded-md px-2 text-sm font-medium text-brand hover:bg-brand-50">Log in</Link>
      <Link href="/register" className="inline-flex min-h-11 items-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-600">Sign up</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-4">
        <div className="min-w-0 flex-1"><Logo name={storeName} /></div>
        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.href}><Link href={n.href} aria-current={active(n.href) ? 'page' : undefined}
                className={clsx('relative block rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-brand-50 hover:text-brand', active(n.href) && 'text-brand after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-gold')}>{n.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-1">
          {cart}
          <div className="hidden items-center gap-1 xl:flex">{account}</div>
          <button ref={btnRef} type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-md text-brand hover:bg-brand-50 xl:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-line bg-white xl:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-7xl px-4 py-3">
            <ul className="grid gap-1">
              {nav.map((n) => (<li key={n.href}><Link href={n.href} aria-current={active(n.href) ? 'page' : undefined} className={clsx('block min-h-11 rounded-md px-3 py-3 text-base font-medium hover:bg-brand-50', active(n.href) ? 'bg-brand-50 text-brand' : 'text-ink')}>{n.label}</Link></li>))}
            </ul>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">{account}</div>
          </nav>
        </div>
      )}
    </header>
  );
}
