'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, Breadcrumbs, Button, ButtonLink, EmptyState, PageHeading, Skeleton } from '@/components/ui';
import { ImagePlaceholder } from '@/components/safe-image';
import { useCart } from '@/features/cart-provider';
import { formatNaira } from '@/lib/format';
import type { CartLine } from '@/types';

const HOST = 'res.cloudinary.com';
function Thumb({ src, alt }: { src: string | null; alt: string }) {
  let ok = false; try { const url = src ? new URL(src) : null; ok = !!url && url.protocol === 'https:' && url.hostname === HOST; } catch { /* invalid */ }
  return <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-brand-50">{ok ? <Image src={src!} alt={alt} fill sizes="80px" className="object-cover" /> : <ImagePlaceholder className="absolute inset-0" label={alt} />}</div>;
}

export default function CartPage() {
  const { cart, loading, setQty, remove } = useCart();
  const [err, setErr] = useState<string | null>(null);
  const run = async (fn: () => Promise<void>) => { setErr(null); try { await fn(); } catch (e) { setErr((e as Error).message); } };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
      <PageHeading title="Your cart" />
      {loading ? <Skeleton className="h-48 w-full" /> : cart.lines.length === 0 ? (
        <EmptyState title="Your cart is empty" message="Add something you like and it will show up here." action={<ButtonLink href="/search">Start shopping</ButtonLink>} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div>
            {err && <Alert tone="error" className="mb-4">{err}</Alert>}
            <ul className="divide-y divide-line rounded-lg border border-line bg-white">
              {cart.lines.map((l: CartLine) => (
                <li key={(l.id ?? '') + l.productId + l.variantId} className="flex gap-3 p-3 sm:gap-4 sm:p-4">
                  <Thumb src={l.image} alt={l.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1"><div className="min-w-0 flex-1 break-words">{l.slug ? <Link href={`/products/${l.slug}`} className="font-medium hover:underline">{l.name}</Link> : <span className="font-medium">{l.name}</span>}{l.variantName && <p className="text-sm text-muted">{l.variantName}</p>}</div><p className="shrink-0 font-semibold">{formatNaira(l.lineTotal)}</p></div>
                    <p className="text-sm text-muted">{formatNaira(l.unitPrice)}{l.unit ? ` per ${l.unit}` : ' each'}</p>
                    {l.issue && <p role="alert" className="mt-1 text-sm font-medium text-red-700">{l.issue}</p>}
                    <div className="mt-2 flex items-center gap-2">
                      <Button variant="secondary" size="sm" aria-label={`Decrease quantity of ${l.name}`} disabled={l.quantity <= 1} onClick={() => run(() => setQty(l, l.quantity - 1))}>−</Button>
                      <span className="w-8 text-center" aria-live="polite">{l.quantity}</span>
                      <Button variant="secondary" size="sm" aria-label={`Increase quantity of ${l.name}`} disabled={l.available !== null && l.quantity >= l.available} onClick={() => run(() => setQty(l, l.quantity + 1))}>+</Button>
                      <Button variant="ghost" size="sm" className="ml-auto text-red-700" onClick={() => run(() => remove(l))}>Remove</Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/search" className="mt-4 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">← Continue shopping</Link>
          </div>
          <aside className="h-fit space-y-3 rounded-lg border border-line bg-white p-5" aria-label="Order summary">
            <h2 className="text-xl font-semibold">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-medium">{formatNaira(cart.subtotal)}</dd></div>
              {cart.deliveryEnabled && <div className="flex justify-between text-muted"><dt>Delivery fee (if delivered)</dt><dd>{formatNaira(cart.deliveryFee)}</dd></div>}
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatNaira(Number(cart.subtotal) + (cart.deliveryEnabled ? Number(cart.deliveryFee) : 0))}</dd></div>
            </dl>
            <p className="text-xs text-muted">Final totals are confirmed by the store when you check out.</p>
            {cart.valid ? <ButtonLink href="/checkout" size="lg" className="w-full">Proceed to checkout</ButtonLink> : <Alert tone="error">Fix the highlighted items to continue.</Alert>}
          </aside>
        </div>
      )}
    </div>
  );
}
