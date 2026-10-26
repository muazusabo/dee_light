import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FilterPanel } from '@/components/filter-panel';
import { ProductGrid } from '@/components/product-card';
import { Breadcrumbs, ButtonLink, EmptyState, PageHeading, Pagination } from '@/components/ui';
import { SafeImage } from '@/components/safe-image';
import { ApiError, qs, serverApi } from '@/lib/api';
import { pickParams, type SearchParams } from '@/lib/params';
import type { Category, Facets, Paged, ProductSummary } from '@/types';

type Props = { params: Promise<{ category: string }>; searchParams: Promise<SearchParams> };

async function getCategory(slug: string) {
  try { return await serverApi<Category>(`/categories/${encodeURIComponent(slug)}`); }
  catch (e) { if (e instanceof ApiError && e.status === 404) notFound(); throw e; }
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const c = await serverApi<Category>(`/categories/${encodeURIComponent(category)}`).catch(() => null);
  return c ? { title: c.name, description: c.description ?? `Shop ${c.name} at DEE-LIGHT.`, alternates: { canonical: `/${c.slug}` } } : { title: 'Category not found' };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const cat = await getCategory(slug);
  const sp = pickParams(await searchParams);
  const page = Math.max(1, Number(sp.page) || 1);
  const [data, facets] = await Promise.all([
    serverApi<Paged<ProductSummary>>(`/products${qs({ ...sp, category: cat.slug, page, pageSize: 12 })}`),
    serverApi<Facets>(`/categories/${cat.slug}/filters`).catch(() => null),
  ]);
  const filterParams = { ...sp };
  delete filterParams.category;
  delete filterParams.page;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: cat.name }]} />
      {cat.imageUrl && <div className="relative mb-6 h-40 overflow-hidden rounded-lg md:h-56"><SafeImage src={cat.imageUrl} alt="" sizes="100vw" priority /></div>}
      <PageHeading title={cat.name} description={cat.description}><p className="text-sm text-muted" aria-live="polite">{data.total} product{data.total === 1 ? '' : 's'}</p></PageHeading>
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside><FilterPanel basePath={`/${cat.slug}`} facets={facets} current={filterParams} showSearch /></aside>
        <section aria-label={`${cat.name} products`}>
          {data.items.length ? (<><ProductGrid items={data.items} priorityCount={4} /><Pagination basePath={`/${cat.slug}`} params={filterParams} page={data.page} totalPages={data.totalPages} /></>)
            : <EmptyState title="No products found" message={Object.keys(filterParams).length ? 'Try removing some filters.' : `There are no ${cat.name.toLowerCase()} products yet. Please check back soon.`} action={Object.keys(filterParams).length ? <ButtonLink href={`/${cat.slug}`} variant="secondary">Clear filters</ButtonLink> : undefined} />}
        </section>
      </div>
    </div>
  );
}
