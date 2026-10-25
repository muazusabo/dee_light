import type { MetadataRoute } from 'next';
import { serverApi } from '@/lib/api';
import { SITE_URL } from '@/lib/nav';
import type { Category, Paged, ProductSummary } from '@/types';

export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, products] = await Promise.all([
    serverApi<Category[]>('/categories').catch(() => []),
    serverApi<Paged<ProductSummary>>('/products?pageSize=48&sort=newest').catch(() => ({ items: [] as ProductSummary[] })),
  ]);
  return [
    { url: SITE_URL }, { url: `${SITE_URL}/about` },
    ...cats.map((c) => ({ url: `${SITE_URL}/${c.slug}` })),
    ...products.items.map((p) => ({ url: `${SITE_URL}/products/${p.slug}` })),
  ];
}
