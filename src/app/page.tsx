import Link from 'next/link';
import { ButtonLink, EmptyState, Alert } from '@/components/ui';
import { CategoryCard } from '@/components/category-card';
import { ProductGrid } from '@/components/product-card';
import { serverApi } from '@/lib/api';
import type { Category, Paged, ProductSummary, Settings } from '@/types';

const safe = <T,>(p: Promise<T>) => p.then((v) => ({ ok: true as const, v })).catch(() => ({ ok: false as const, v: null }));

export default async function Home() {
  const [cats, featured, food, fashion, settings] = await Promise.all([
    safe(serverApi<Category[]>('/categories')),
    safe(serverApi<ProductSummary[]>('/products/featured?limit=8')),
    safe(serverApi<Paged<ProductSummary>>('/products?category=menu,snacks&pageSize=4&sort=featured')),
    safe(serverApi<Paged<ProductSummary>>('/products?category=materials,shoes,perfumes,jewelry&pageSize=4&sort=featured')),
    safe(serverApi<Settings>('/settings')),
  ]);
  const s = settings.v;
  const benefits = [
    { t: 'Many needs, one store', d: 'Meals, snacks, drinks, fabrics, shoes, perfumes and jewelry — browse everything in one place.' },
    { t: 'Clear prices', d: 'Prices and totals are calculated for you before you place an order.' },
    ...(s?.deliveryEnabled || s?.collectionEnabled ? [{ t: 'Delivery or collection', d: [s?.deliveryEnabled && 'Have your order delivered', s?.collectionEnabled && 'collect it from the store'].filter(Boolean).join(' or ') + '.' }] : []),
    { t: 'Your own account', d: 'Create an account to keep your cart and follow your order history.' },
  ];
  return (
    <>
      <section className="on-dark bg-brand text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:py-20 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-gold">Bauchi, Nigeria</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">Everything You Love, All in One Place.</h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">Discover delicious meals, irresistible snacks, refreshing drinks, quality fabrics, stylish shoes, beautiful jewelry, and fragrances at Dee-Light.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/search" variant="gold" size="lg">Explore Products</ButtonLink>
              <ButtonLink href="#categories" variant="secondary" size="lg" className="border-white bg-transparent text-white hover:bg-white/10">Shop Categories</ButtonLink>
            </div>
          </div>
          <ul className="hidden grid-cols-2 gap-3 lg:col-span-2 lg:grid" aria-label="What we offer">
            {(cats.v ?? []).slice(0, 7).map((c) => (<li key={c.id}><Link href={`/${c.slug}`} className="block rounded-lg border border-white/20 bg-white/5 px-4 py-5 text-center font-display text-lg hover:border-gold hover:bg-white/10">{c.name}</Link></li>))}
          </ul>
        </div>
        <div className="h-1 bg-gold" aria-hidden />
      </section>

      <section id="categories" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14">
        <h2 className="mb-6 text-3xl font-semibold text-brand">Shop by category</h2>
        {cats.ok && cats.v!.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{cats.v!.map((c) => <CategoryCard key={c.id} c={c} />)}</div>
          : <Alert tone="error">Categories couldn&apos;t be loaded right now. Please refresh in a moment.</Alert>}
      </section>

      <Showcase title="Featured products" result={featured.ok ? featured.v!.slice(0, 8) : null} empty="No featured products yet — check back soon." />
      <Showcase title="Food & snacks" href="/menu" result={food.ok ? food.v!.items : null} empty="Our menu and snacks will appear here." />
      <Showcase title="Fashion & lifestyle" href="/materials" result={fashion.ok ? fashion.v!.items : null} empty="Fabrics, shoes, perfumes and jewelry will appear here." />

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-3xl font-semibold text-brand">Why choose Dee-Light</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{benefits.map((b) => (<li key={b.t} className="border-t-2 border-gold pt-4"><h3 className="font-sans text-lg font-semibold">{b.t}</h3><p className="mt-1 text-sm text-muted">{b.d}</p></li>))}</ul>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 text-center">
        <h2 className="text-3xl font-semibold text-brand">About Dee-Light</h2>
        <p className="mt-4 text-muted">{s?.storeDescription ?? 'Dee-Light is a multi-category shopping destination in Bauchi, bringing restaurant meals and everyday shopping together.'}</p>
        <div className="mt-6 flex justify-center"><ButtonLink href="/about" variant="secondary">Learn more</ButtonLink></div>
      </section>
    </>
  );
}

function Showcase({ title, href, result, empty }: { title: string; href?: string; result: ProductSummary[] | null; empty: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-5 flex items-end justify-between"><h2 className="text-3xl font-semibold text-brand">{title}</h2>{href && <Link href={href} className="text-sm font-medium text-brand underline-offset-4 hover:underline">View all →</Link>}</div>
      {result === null ? <Alert tone="error">This section couldn&apos;t be loaded right now.</Alert> : result.length === 0 ? <EmptyState title="Nothing here yet" message={empty} /> : <ProductGrid items={result} />}
    </section>
  );
}
