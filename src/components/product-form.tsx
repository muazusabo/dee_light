'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Field, Input, Select, Textarea } from '@/components/ui';
import { ImageUploader, type UploadedImage } from '@/components/image-uploader';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { Category } from '@/types';

type VariantRow = { id?: string; name: string; sku: string; priceOverride: string; stockQuantity: string; size: string; color: string; volume: string; isActive: boolean };
export type ProductFormData = {
  id?: string; name: string; description: string; categoryId: string; basePrice: string; comparePrice: string; brand: string; productType: string; unit: string;
  trackStock: boolean; stockQuantity: string; isFeatured: boolean; isActive: boolean; images: UploadedImage[]; variants: VariantRow[]; attributes: { k: string; v: string }[];
};
export const emptyProduct = (): ProductFormData => ({ name: '', description: '', categoryId: '', basePrice: '', comparePrice: '', brand: '', productType: '', unit: '', trackStock: true, stockQuantity: '0', isFeatured: false, isActive: true, images: [], variants: [], attributes: [] });
const emptyVariant = (): VariantRow => ({ name: '', sku: '', priceOverride: '', stockQuantity: '0', size: '', color: '', volume: '', isActive: true });

/** Suggested attribute names per category. Admins can still add any attribute. */
const SUGGEST: Record<string, string[]> = {
  menu: ['portionSize', 'servingInfo', 'ingredients', 'preparation'], snacks: ['packSize', 'quantityPerPack'], drinks: ['flavor'],
  materials: ['fabricType', 'width'], shoes: ['gender'], perfumes: ['fragranceType', 'gender'], jewelry: ['material'],
};
const n = (s: string) => (s.trim() === '' ? undefined : Number(s));

export function ProductForm({ initial }: { initial: ProductFormData }) {
  const router = useRouter();
  const cats = useApi<Category[]>('/admin/categories');
  const [d, setD] = useState<ProductFormData>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) => setD((s) => ({ ...s, [k]: v }));
  const slug = cats.data?.find((c) => c.id === d.categoryId)?.slug ?? '';
  const hasVariants = d.variants.length > 0;
  const setV = (i: number, p: Partial<VariantRow>) => set('variants', d.variants.map((v, j) => (j === i ? { ...v, ...p } : v)));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setOk(false);
    if (!d.categoryId) return setErr('Choose a category');
    if (Number.isNaN(Number(d.basePrice)) || d.basePrice === '') return setErr('Enter a valid price');
    const attrs = Object.fromEntries(d.attributes.filter((a) => a.k.trim() && a.v.trim()).map((a) => [a.k.trim(), a.v.trim()]));
    const body = {
      name: d.name, description: d.description || undefined, categoryId: d.categoryId, basePrice: Number(d.basePrice), comparePrice: n(d.comparePrice) ?? null,
      brand: d.brand || undefined, productType: d.productType || undefined, unit: d.unit || undefined, attributes: attrs,
      trackStock: d.trackStock, stockQuantity: Number(d.stockQuantity || 0), isFeatured: d.isFeatured, isActive: d.isActive,
      images: d.images.map((i, idx) => ({ url: i.url, storageKey: i.storageKey, alt: i.alt || d.name, isPrimary: idx === 0 })),
      variants: d.variants.map((v) => ({ id: v.id, name: v.name, sku: v.sku || undefined, priceOverride: n(v.priceOverride) ?? null, stockQuantity: Number(v.stockQuantity || 0), size: v.size || undefined, color: v.color || undefined, volume: v.volume || undefined, isActive: v.isActive })),
    };
    setBusy(true);
    try {
      if (d.id) { await api(`/admin/products/${d.id}`, { method: 'PUT', body }); setOk(true); router.refresh(); }
      else { const p = await api<{ id: string }>('/admin/products', { method: 'POST', body }); router.push(`/admin/products/${p.id}/edit`); }
    } catch (x) { setErr((x as Error).message); window.scrollTo({ top: 0, behavior: 'smooth' }); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      {err && <Alert tone="error">{err}</Alert>}{ok && <Alert tone="success">Product saved.</Alert>}
      <section className="space-y-3 rounded-lg border border-line bg-white p-5"><h2 className="font-semibold">Basics</h2>
        <Field label="Name" htmlFor="pn"><Input id="pn" required minLength={2} value={d.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Category" htmlFor="pc"><Select id="pc" required value={d.categoryId} onChange={(e) => set('categoryId', e.target.value)}><option value="">Select category</option>{cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}{c.isActive === false ? ' (inactive)' : ''}</option>)}</Select></Field>
        <Field label="Description" htmlFor="pd"><Textarea id="pd" rows={4} value={d.description} onChange={(e) => set('description', e.target.value)} /></Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Brand" htmlFor="pb"><Input id="pb" value={d.brand} onChange={(e) => set('brand', e.target.value)} /></Field>
          <Field label="Type" htmlFor="pt" hint="e.g. Jollof rice, Sneakers, Lace"><Input id="pt" value={d.productType} onChange={(e) => set('productType', e.target.value)} /></Field>
          <Field label="Unit" htmlFor="pu" hint="e.g. metre, yard"><Input id="pu" value={d.unit} onChange={(e) => set('unit', e.target.value)} /></Field>
        </div>
      </section>
      <section className="space-y-3 rounded-lg border border-line bg-white p-5"><h2 className="font-semibold">Price &amp; stock</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Price (₦)" htmlFor="pp" hint={hasVariants ? 'Used for options without their own price.' : undefined}><Input id="pp" inputMode="decimal" required value={d.basePrice} onChange={(e) => set('basePrice', e.target.value)} /></Field>
          <Field label="Compare-at price (₦, optional)" htmlFor="pcp"><Input id="pcp" inputMode="decimal" value={d.comparePrice} onChange={(e) => set('comparePrice', e.target.value)} /></Field>
        </div>
        {!hasVariants && <div className="flex flex-wrap items-end gap-4"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={d.trackStock} onChange={(e) => set('trackStock', e.target.checked)} /> Track stock</label>
          {d.trackStock && <Field label="Stock quantity" htmlFor="ps"><Input id="ps" inputMode="numeric" value={d.stockQuantity} onChange={(e) => set('stockQuantity', e.target.value.replace(/\D/g, ''))} /></Field>}</div>}
        <div className="flex gap-6"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={d.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Available to customers</label>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={d.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} /> Featured on homepage</label></div>
      </section>
      <section className="space-y-3 rounded-lg border border-line bg-white p-5"><h2 className="font-semibold">Images</h2>
        <ImageUploader folder="products" images={d.images} onChange={(i) => set('images', i)} max={8} /></section>
      <section className="space-y-3 rounded-lg border border-line bg-white p-5"><h2 className="font-semibold">Variants</h2>
        <p className="text-sm text-muted">Sizes, colors, bottle volumes or portions with their own price and stock. Leave empty for a simple product.</p>
        {d.variants.map((v, i) => (
          <div key={v.id ?? i} className="space-y-2 rounded-md border border-line p-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <Field label="Name" htmlFor={`vn${i}`}><Input id={`vn${i}`} required value={v.name} placeholder="e.g. 50 ml / Size 42" onChange={(e) => setV(i, { name: e.target.value })} /></Field>
              <Field label="Price override (₦)" htmlFor={`vp${i}`}><Input id={`vp${i}`} inputMode="decimal" value={v.priceOverride} onChange={(e) => setV(i, { priceOverride: e.target.value })} /></Field>
              <Field label="Stock" htmlFor={`vs${i}`}><Input id={`vs${i}`} inputMode="numeric" value={v.stockQuantity} onChange={(e) => setV(i, { stockQuantity: e.target.value.replace(/\D/g, '') })} /></Field>
              <Field label="Size" htmlFor={`vz${i}`}><Input id={`vz${i}`} value={v.size} onChange={(e) => setV(i, { size: e.target.value })} /></Field>
              <Field label="Color" htmlFor={`vc${i}`}><Input id={`vc${i}`} value={v.color} onChange={(e) => setV(i, { color: e.target.value })} /></Field>
              <Field label="Volume" htmlFor={`vv${i}`}><Input id={`vv${i}`} value={v.volume} onChange={(e) => setV(i, { volume: e.target.value })} /></Field>
            </div>
            <div className="flex items-center justify-between"><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={v.isActive} onChange={(e) => setV(i, { isActive: e.target.checked })} /> Active</label>
              <Button variant="ghost" size="sm" className="text-red-700" onClick={() => set('variants', d.variants.filter((_, j) => j !== i))}>Remove variant</Button></div>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={() => set('variants', [...d.variants, emptyVariant()])}>Add variant</Button>
      </section>
      <section className="space-y-3 rounded-lg border border-line bg-white p-5"><h2 className="font-semibold">Extra details</h2>
        <datalist id="attr-names">{(SUGGEST[slug] ?? []).map((s) => <option key={s} value={s} />)}</datalist>
        {d.attributes.map((a, i) => (<div key={i} className="flex gap-2"><Input aria-label="Detail name" list="attr-names" placeholder="Name" value={a.k} onChange={(e) => set('attributes', d.attributes.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} /><Input aria-label="Detail value" placeholder="Value" value={a.v} onChange={(e) => set('attributes', d.attributes.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} /><Button variant="ghost" size="sm" aria-label="Remove detail" onClick={() => set('attributes', d.attributes.filter((_, j) => j !== i))}>✕</Button></div>))}
        <Button variant="secondary" size="sm" onClick={() => set('attributes', [...d.attributes, { k: '', v: '' }])}>Add detail</Button>
      </section>
      <div className="flex gap-3"><Button type="submit" size="lg" disabled={busy}>{busy ? 'Saving…' : d.id ? 'Save changes' : 'Create product'}</Button><Button variant="secondary" size="lg" onClick={() => router.push('/admin/products')}>Back to products</Button></div>
    </form>
  );
}
