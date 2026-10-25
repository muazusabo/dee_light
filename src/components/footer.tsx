import Link from 'next/link';
import { Logo } from '@/components/logo';
import type { Settings } from '@/types';

export function Footer({ items, settings }: { items: { href: string; label: string }[]; settings: Settings | null }) {
  const name = settings?.storeName ?? 'DEE-LIGHT';
  const social = Object.entries(settings?.socialLinks ?? {}).filter(([, v]) => /^https?:\/\//.test(v));
  return (
    <footer className="on-dark mt-16 bg-brand text-white/90">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3 md:col-span-1">
          <Logo name={name} dark />
          {settings?.storeDescription && <p className="text-sm text-white/75">{settings.storeDescription}</p>}
        </div>
        <nav aria-label="Shop" className="text-sm"><h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wide text-gold">Shop</h2>
          <ul className="space-y-2">{items.map((i) => <li key={i.href}><Link className="hover:underline" href={i.href}>{i.label}</Link></li>)}</ul></nav>
        <nav aria-label="Company" className="text-sm"><h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wide text-gold">Company</h2>
          <ul className="space-y-2"><li><Link className="hover:underline" href="/about">About</Link></li><li><Link className="hover:underline" href="/account/orders">My orders</Link></li><li><Link className="hover:underline" href="/policies/delivery-and-payment">Delivery &amp; payment</Link></li><li><Link className="hover:underline" href="/policies/privacy">Privacy</Link></li></ul></nav>
        <div className="text-sm"><h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wide text-gold">Contact</h2>
          <ul className="space-y-2">
            {settings?.contactPhone && <li>{settings.contactPhone}</li>}
            {settings?.contactEmail && <li><a className="hover:underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></li>}
            {settings?.businessAddress && <li>{settings.businessAddress}</li>}
            {social.map(([k, v]) => <li key={k}><a className="capitalize hover:underline" href={v} rel="noopener noreferrer" target="_blank">{k}</a></li>)}
            {!settings?.contactPhone && !settings?.contactEmail && !settings?.businessAddress && <li className="text-white/60">Contact details coming soon.</li>}
          </ul></div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs text-white/70">© {new Date().getFullYear()} {name}. All rights reserved.</div>
    </footer>
  );
}
