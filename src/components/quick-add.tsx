'use client';
import { useState } from 'react';
import { Button, ButtonLink } from '@/components/ui';
import { useCart } from '@/features/cart-provider';
import type { ProductSummary } from '@/types';

export function QuickAdd({ product }: { product: ProductSummary }) {
  const { add } = useCart();
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [err, setErr] = useState<string | null>(null);
  if (!product.inStock) return <Button size="sm" className="w-full" disabled>Unavailable</Button>;
  if (product.hasVariants) return <ButtonLink href={`/products/${product.slug}`} variant="secondary" size="sm" className="w-full">Choose options</ButtonLink>;
  return (
    <div>
      <Button size="sm" className="w-full" disabled={state === 'busy'} onClick={async () => {
        setState('busy'); setErr(null);
        try { await add(product.id, null, 1); setState('done'); setTimeout(() => setState('idle'), 1800); } catch (e) { setErr((e as Error).message); setState('idle'); }
      }}>{state === 'busy' ? 'Adding…' : state === 'done' ? 'Added ✓' : 'Add to cart'}</Button>
      <p aria-live="polite" className="mt-1 text-xs text-red-700">{err}</p>
      <span className="sr-only" aria-live="polite">{state === 'done' ? `${product.name} added to cart` : ''}</span>
    </div>
  );
}
