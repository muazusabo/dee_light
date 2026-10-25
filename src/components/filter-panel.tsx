'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Button, Field, Input, Select } from '@/components/ui';
import { useDebounced } from '@/hooks/use-api';
import type { Category, Facets } from '@/types';

const SORTS = [['featured', 'Featured'], ['newest', 'Newest'], ['price_asc', 'Price: Low to High'], ['price_desc', 'Price: High to Low']];

/** Only controls relevant to the category (as reported by the API) are rendered. */
export function FilterPanel({ basePath, facets, categories, current, showSearch }: { basePath: string; facets: Facets | null; categories?: Category[]; current: Record<string, string | undefined>; showSearch?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(current.q ?? '');
  const [minPrice, setMin] = useState(current.minPrice ?? '');
  const [maxPrice, setMax] = useState(current.maxPrice ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);
  const dq = useDebounced(q);

  const push = useCallback((patch: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...current, ...patch, page: undefined })) if (v) u.set(k, v);
    const s = u.toString();
    router.replace(s ? `${basePath}?${s}` : basePath, { scroll: false });
  }, [basePath, current, router]);
  useEffect(() => { if ((current.q ?? '') !== dq) push({ q: dq || undefined }); }, [current.q, dq, push]);

  const has = (f: string) => !facets || facets.filters.includes(f);
  const list = (id: string, label: string, opts: string[] | undefined, key: string) => opts && opts.length > 0 && (
    <Field label={label} htmlFor={id}><Select id={id} value={current[key] ?? ''} onChange={(e) => push({ [key]: e.target.value || undefined })}><option value="">All</option>{opts.map((o) => <option key={o} value={o}>{o}</option>)}</Select></Field>
  );
  const activeCount = Object.keys(current).filter((k) => k !== 'sort' && k !== 'page' && k !== 'category' && current[k]).length;

  return (
    <>
      <Button
        variant="secondary"
        className="mb-3 w-full justify-between lg:hidden"
        aria-expanded={mobileOpen}
        aria-controls="product-filter-controls"
        onClick={() => setMobileOpen((open) => !open)}
      >
        <span className="inline-flex items-center gap-2"><SlidersHorizontal size={18} aria-hidden />Filters{activeCount > 0 && <span className="rounded-full bg-brand px-2 py-0.5 text-xs text-white">{activeCount}</span>}</span>
        <ChevronDown size={18} aria-hidden className={clsx('transition-transform', mobileOpen && 'rotate-180')} />
      </Button>
      <div id="product-filter-controls" className={clsx('rounded-lg border border-line bg-white p-4 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0', mobileOpen ? 'block' : 'hidden lg:block')}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); push({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined }); }} aria-label="Filter products">
          {showSearch && <Field label="Search" htmlFor="f-q"><Input id="f-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" /></Field>}
          <Field label="Sort by" htmlFor="f-sort"><Select id="f-sort" value={current.sort ?? 'featured'} onChange={(e) => push({ sort: e.target.value === 'featured' ? undefined : e.target.value })}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
          {categories && <Field label="Category" htmlFor="f-cat"><Select id="f-cat" value={current.category ?? ''} onChange={(e) => push({ category: e.target.value || undefined, type: undefined, brand: undefined, color: undefined, size: undefined, volume: undefined, material: undefined, unit: undefined })}><option value="">All categories</option>{categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</Select></Field>}
          {has('type') && list('f-type', 'Type', facets?.types, 'type')}
          {has('brand') && list('f-brand', 'Brand', facets?.brands, 'brand')}
          {has('size') && list('f-size', 'Size', facets?.sizes, 'size')}
          {has('color') && list('f-color', 'Color', facets?.colors, 'color')}
          {has('volume') && list('f-volume', 'Bottle size / volume', facets?.volumes, 'volume')}
          {has('material') && list('f-material', 'Material', facets?.materials, 'material')}
          {has('unit') && list('f-unit', 'Available unit', facets?.units, 'unit')}
          {has('price') && (
            <fieldset className="space-y-1"><legend className="text-sm font-medium">Price (₦)</legend>
              <div className="flex gap-2"><Input aria-label="Minimum price" inputMode="numeric" placeholder="Min" value={minPrice} onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} /><Input aria-label="Maximum price" inputMode="numeric" placeholder="Max" value={maxPrice} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} /></div>
              <Button type="submit" variant="secondary" size="sm" className="mt-1">Apply price</Button></fieldset>
          )}
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand" checked={current.inStock === 'true'} onChange={(e) => push({ inStock: e.target.checked ? 'true' : undefined })} /> In stock only</label>
          {activeCount > 0 && <Button variant="ghost" size="sm" onClick={() => { setQ(''); setMin(''); setMax(''); router.replace(current.category && !categories ? basePath : current.category ? `${basePath}?category=${current.category}` : basePath, { scroll: false }); }}>Clear filters</Button>}
        </form>
      </div>
    </>
  );
}
