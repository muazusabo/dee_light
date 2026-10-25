import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs, PageHeading } from '@/components/ui';
import { serverApi } from '@/lib/api';
import { formatNaira } from '@/lib/format';
import type { Settings } from '@/types';

const TITLES: Record<string, string> = { 'delivery-and-payment': 'Delivery & payment', privacy: 'Privacy' };
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; return { title: TITLES[slug] ?? 'Policy' }; }

export default async function Policy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!TITLES[slug]) notFound();
  const s = await serverApi<Settings>('/settings').catch(() => null);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: TITLES[slug] }]} />
      <PageHeading title={TITLES[slug]} />
      {slug === 'delivery-and-payment' ? (
        <div className="space-y-4">
          <section><h2 className="text-xl font-semibold">Delivery and collection</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
              <li>Delivery: {s?.deliveryEnabled ? `available (delivery fee ${formatNaira(s.deliveryFee)})` : 'not currently available'}.</li>
              <li>Collection from the store: {s?.collectionEnabled ? 'available' : 'not currently available'}.</li></ul></section>
          <section><h2 className="text-xl font-semibold">Payment</h2>
            <p className="mt-2 whitespace-pre-line text-muted">{s?.paymentInstructions ?? 'Payment instructions are shown at checkout.'}</p></section>
        </div>
      ) : (
        <div className="space-y-4 text-muted">
          <p>To process your orders we store the details you give us: your name, email address, phone number, delivery addresses and order history.</p>
          <p>Passwords are stored only as secure one-way hashes. Proof-of-payment images are stored privately and are visible only to you and store staff.</p>
          <p>To ask about your data, use the contact details in the page footer.</p>
          <p className="text-xs">Store owners: have this text reviewed against your legal obligations before launch.</p>
        </div>
      )}
    </div>
  );
}
