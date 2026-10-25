import type { Metadata } from 'next';
import { Breadcrumbs, PageHeading } from '@/components/ui';
import { serverApi } from '@/lib/api';
import type { Settings } from '@/types';

export const metadata: Metadata = { title: 'About', description: 'About DEE-LIGHT, a multi-category shop and restaurant in Bauchi, Nigeria.' };

export default async function About() {
  const s = await serverApi<Settings>('/settings').catch(() => null);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
      <PageHeading title={`About ${s?.storeName ?? 'DEE-LIGHT'}`} />
      <div className="space-y-4 text-lg leading-relaxed">
        <p>{s?.storeDescription ?? 'Dee-Light is a multi-category online shopping platform serving customers in Bauchi, Nigeria. It brings restaurant ordering together with shopping for snacks, drinks, clothing materials, shoes, perfumes and jewelry.'}</p>
        <p className="text-muted">Browse our categories, create an account, add items to your cart and place your order online.</p>
      </div>
      {(s?.contactPhone || s?.contactEmail || s?.businessAddress) && (
        <section className="mt-8 rounded-lg border border-line bg-white p-6"><h2 className="mb-3 text-xl font-semibold text-brand">Contact</h2>
          <ul className="space-y-1 text-sm">{s.contactPhone && <li>Phone: {s.contactPhone}</li>}{s.contactEmail && <li>Email: {s.contactEmail}</li>}{s.businessAddress && <li>Location: {s.businessAddress}</li>}</ul></section>
      )}
    </div>
  );
}
