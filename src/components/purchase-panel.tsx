'use client';
import { useMemo, useState } from 'react';
import { Alert, Badge, Button, Field, Price, Select } from '@/components/ui';
import { useCart } from '@/features/cart-provider';
import { activeDims, findVariant, optionsFor, type Dim, type Selection } from '@/lib/variants';
import type { ProductDetail } from '@/types';
import Link from 'next/link';

const DIM_LABEL: Record<Dim, string> = { size: 'Size', color: 'Color', volume: 'Volume' };

export function PurchasePanel({ product }: { product: ProductDetail }) {
  const { add } = useCart();
  const vs = product.variants;
  const dims = useMemo(() => activeDims(vs), [vs]);
  const [sel, setSel] = useState<Selection>({});
  const [byName, setByName] = useState('');
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

  const variant = product.hasVariants ? (dims.length ? findVariant(vs, dims, sel) : vs.find((v) => v.id === byName)) : undefined;
  const price = variant ? (variant.priceOverride ?? product.basePrice) : product.basePrice;
  const stock = variant ? variant.stockQuantity : product.hasVariants ? null : product.stockQuantity ?? null; // null = untracked or unknown
  const soldOut = !product.inStock || (variant ? variant.stockQuantity <= 0 : false) || (!product.hasVariants && stock !== null && stock !== undefined && stock <= 0);
  const needsChoice = product.hasVariants && !variant;
  const max = stock === null || stock === undefined ? 99 : Math.max(1, Math.min(99, stock));

  async function onAdd() {
    setBusy(true); setMsg(null);
    try { await add(product.id, variant?.id ?? null, qty); setMsg({ tone: 'success', text: 'Added to your cart.' }); }
    catch (e) { setMsg({ tone: 'error', text: (e as Error).message }); } finally { setBusy(false); }
  }
  const fromPrice = product.hasVariants && !variant ? vs.reduce((m, v) => Math.min(m, Number(v.priceOverride ?? product.basePrice)), Infinity) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Price amount={fromPrice ?? price} compare={variant || !product.hasVariants ? product.comparePrice : null} from={fromPrice !== null} className="text-2xl" />
        {soldOut ? <Badge tone="danger">Out of stock</Badge> : <Badge tone="success">In stock</Badge>}
        {product.unit && <span className="text-sm text-muted">per {product.unit}</span>}
      </div>

      {product.hasVariants && (dims.length ? dims.map((d) => (
        <Field key={d} label={DIM_LABEL[d]} htmlFor={`v-${d}`}>
          <Select id={`v-${d}`} value={sel[d] ?? ''} onChange={(e) => { setSel((s) => ({ ...s, [d]: e.target.value || undefined })); setQty(1); setMsg(null); }}>
            <option value="">Select {DIM_LABEL[d].toLowerCase()}</option>
            {optionsFor(vs, d).map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        </Field>
      )) : (
        <Field label="Option" htmlFor="v-name"><Select id="v-name" value={byName} onChange={(e) => { setByName(e.target.value); setQty(1); }}>
          <option value="">Select an option</option>{vs.map((v) => <option key={v.id} value={v.id} disabled={v.stockQuantity <= 0}>{v.name}{v.stockQuantity <= 0 ? ' (out of stock)' : ''}</option>)}</Select></Field>
      ))}
      {product.hasVariants && dims.length > 0 && Object.keys(sel).length === dims.length && !variant && <Alert tone="error">That combination isn&apos;t available. Please choose another.</Alert>}

      <Field label="Quantity" htmlFor="qty">
        <div className="flex w-40 items-center gap-1">
          <Button variant="secondary" size="sm" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</Button>
          <input id="qty" inputMode="numeric" aria-live="polite" className="h-9 w-14 rounded-md border border-line text-center" value={qty} onChange={(e) => setQty(Math.max(1, Math.min(max, Number(e.target.value.replace(/\D/g, '')) || 1)))} />
          <Button variant="secondary" size="sm" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(max, q + 1))}>+</Button>
        </div>
      </Field>
      {stock !== null && stock !== undefined && stock > 0 && stock <= 5 && <p className="text-sm text-amber-800">Only {stock} left.</p>}

      <Button size="lg" className="w-full sm:w-auto" onClick={onAdd} disabled={busy || soldOut || needsChoice}>{busy ? 'Adding…' : soldOut ? 'Unavailable' : needsChoice ? 'Select options to add' : 'Add to cart'}</Button>
      {msg && <Alert tone={msg.tone}>{msg.text} {msg.tone === 'success' && <Link href="/cart" className="font-medium underline">View cart</Link>}</Alert>}
    </div>
  );
}
