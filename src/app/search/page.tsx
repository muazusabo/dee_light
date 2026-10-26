import type { Metadata } from 'next';
import { FilterPanel } from '@/components/filter-panel';
import { ProductGrid } from '@/components/product-card';
import { Breadcrumbs, EmptyState, ButtonLink, PageHeading, Pagination } from '@/components/ui';
import { qs, serverApi } from '@/lib/api';
import { pickParams, type SearchParams } from '@/lib/params';
import type { Category, Facets, Paged, ProductSummary } from '@/types';

export const metadata: Metadata = { title: 'Search products', robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = pickParams(await searchParams);
  const page = Math.max(1, Number(sp.page) || 1);
  const oneCat = sp.category && !sp.category.includes(',') ? sp.category : null;
  const [data, cats, facets] = await Promise.all([
    serverApi<Paged<ProductSummary>>(`/products${qs({ ...sp, page, pageSize: 12 })}`),
    serverApi<Category[]>('/categories').catch(() => [] as Category[]),
    oneCat ? serverApi<Facets>(`/categories/${oneCat}/filters`).catch(() => null) : Promise.resolve(null),
  ]);
  const rest = { ...sp };
  delete rest.page;
  const hasFilters = Object.keys(rest).some((k) => k !== 'sort');
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />
      <PageHeading title={sp.q ? `Results for “${sp.q}”` : 'All products'}><p className="text-sm text-muted" aria-live="polite">{data.total} result{data.total === 1 ? '' : 's'}</p></PageHeading>
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside><FilterPanel basePath="/search" facets={facets ?? { filters: ['price'] }} categories={cats} current={rest} showSearch /></aside>
        <section aria-label="Search results">
          {data.items.length ? (<><ProductGrid items={data.items} /><Pagination basePath="/search" params={rest} page={data.page} totalPages={data.totalPages} /></>)
            : <EmptyState title="No matching products" message="Check the spelling or try fewer filters." action={hasFilters ? <ButtonLink href="/search" variant="secondary">Reset search</ButtonLink> : undefined} />}
        </section>
      </div>
    </div>
  );
}
