import Link from 'next/link';
import { Badge, Price } from '@/components/ui';
import { SafeImage } from '@/components/safe-image';
import { QuickAdd } from '@/components/quick-add';
import type { ProductSummary } from '@/types';

export function ProductCard({ p, priority }: { p: ProductSummary; priority?: boolean }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card">
      <Link href={`/products/${p.slug}`} className="relative block aspect-square overflow-hidden bg-brand-50" aria-label={`View details for ${p.name}`}>
        <SafeImage src={p.image?.url} alt={p.image?.alt ?? p.name} sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw" priority={priority} className="transition-transform duration-300 group-hover:scale-105" />
        {!p.inStock && <span className="absolute left-2 top-2"><Badge tone="danger">Out of stock</Badge></span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs text-muted">{p.category.name}{p.brand ? ` · ${p.brand}` : ''}</p>
        <h3 className="font-sans text-base font-medium leading-snug"><Link href={`/products/${p.slug}`} className="hover:underline">{p.name}</Link></h3>
        <Price amount={p.fromPrice} compare={p.hasVariants ? null : p.comparePrice} from={p.hasVariants} />
        <div className="mt-auto pt-3"><QuickAdd product={p} /></div>
      </div>
    </article>
  );
}
export function ProductGrid({ items, priorityCount = 0 }: { items: ProductSummary[]; priorityCount?: number }) {
  return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{items.map((p, i) => <ProductCard key={p.id} p={p} priority={i < priorityCount} />)}</div>;
}
