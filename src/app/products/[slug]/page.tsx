import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Gallery } from '@/components/gallery';
import { ProductGrid } from '@/components/product-card';
import { PurchasePanel } from '@/components/purchase-panel';
import { Breadcrumbs } from '@/components/ui';
import { ApiError, serverApi } from '@/lib/api';
import type { ProductDetail } from '@/types';

type Props = { params: Promise<{ slug: string }> };
const load = async (slug: string) => {
  try { return await serverApi<ProductDetail>(`/products/${encodeURIComponent(slug)}`, 30); }
  catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; }
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await load((await params).slug).catch(() => null);
  if (!p) return { title: 'Product not found' };
  return { title: p.name, description: (p.description ?? `Buy ${p.name} at DEE-LIGHT`).slice(0, 160), alternates: { canonical: `/products/${p.slug}` }, openGraph: { images: p.images[0] ? [p.images[0].url] : undefined } };
}
const human = (k: string) => k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export default async function ProductPage({ params }: Props) {
  const p = await load((await params).slug);
  if (!p) notFound();
  const details: [string, string][] = [
    ...(p.brand ? [['Brand', p.brand] as [string, string]] : []), ...(p.productType ? [['Type', p.productType] as [string, string]] : []),
    ...Object.entries(p.attributes ?? {}).filter(([, v]) => ['string', 'number'].includes(typeof v) && String(v).trim()).map(([k, v]) => [human(k), String(v)] as [string, string]),
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: p.category.name, href: `/${p.category.slug}` }, { label: p.name }]} />
      <div className="grid gap-8 lg:grid-cols-2">
        <Gallery images={p.images} name={p.name} />
        <div className="space-y-6">
          <div><p className="text-sm text-muted">{p.category.name}</p><h1 className="text-3xl font-semibold text-brand md:text-4xl">{p.name}</h1></div>
          <PurchasePanel product={p} />
          {p.description && <section><h2 className="mb-2 text-xl font-semibold">Description</h2><p className="whitespace-pre-line text-muted">{p.description}</p></section>}
          {details.length > 0 && (<section><h2 className="mb-2 text-xl font-semibold">Details</h2><dl className="divide-y divide-line rounded-lg border border-line bg-white">{details.map(([k, v]) => (<div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>))}</dl></section>)}
        </div>
      </div>
      {p.related.length > 0 && <section className="mt-14"><h2 className="mb-5 text-2xl font-semibold text-brand">Related products</h2><ProductGrid items={p.related} /></section>}
    </div>
  );
}
