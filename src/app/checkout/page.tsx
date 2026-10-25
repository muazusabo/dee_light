'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Breadcrumbs, Button, ButtonLink, EmptyState, Field, Input, PageHeading, Select, Skeleton, Textarea } from '@/components/ui';
import { useAuth } from '@/features/auth-provider';
import { useCart } from '@/features/cart-provider';
import { api } from '@/lib/api';
import { formatNaira } from '@/lib/format';
import { checkoutSchema, errorsOf, type FieldErrors } from '@/lib/schemas';
import type { Order, Settings } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, reload } = useCart();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const idem = useRef<string>('');
  const [f, setF] = useState({ fulfilmentType: 'DELIVERY', paymentMethod: 'BANK_TRANSFER', customerName: '', customerEmail: '', customerPhone: '', line1: '', city: '', state: '', notes: '' });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => { if (!authLoading && !user) router.replace('/login?next=/checkout'); }, [authLoading, user, router]);
  useEffect(() => { api<Settings>('/settings').then((s) => { setSettings(s); setF((x) => ({ ...x, fulfilmentType: s.deliveryEnabled ? 'DELIVERY' : 'COLLECTION', paymentMethod: 'BANK_TRANSFER' })); }).catch(() => null); }, []);
  useEffect(() => { if (user) setF((x) => ({ ...x, customerName: x.customerName || user.name, customerEmail: x.customerEmail || user.email, customerPhone: x.customerPhone || user.phone || '' })); }, [user]);
  useEffect(() => { idem.current = sessionStorage.getItem('dl_idem') ?? (() => { const k = crypto.randomUUID(); sessionStorage.setItem('dl_idem', k); return k; })(); }, []);

  const delivery = f.fulfilmentType === 'DELIVERY';
  const fee = delivery && settings?.deliveryEnabled ? Number(settings.deliveryFee) : 0;
  const total = useMemo(() => Number(cart.subtotal) + fee, [cart.subtotal, fee]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setFormError(null);
    const parsed = checkoutSchema.safeParse(f);
    if (!parsed.success) { setErrors(errorsOf(parsed.error)); return; }
    setErrors({}); setBusy(true);
    try {
      const v = parsed.data;
      const order = await api<Order>('/orders', { method: 'POST', body: {
        fulfilmentType: v.fulfilmentType, paymentMethod: v.paymentMethod, customerName: v.customerName, customerEmail: v.customerEmail, customerPhone: v.customerPhone,
        notes: v.notes || undefined, idempotencyKey: idem.current,
        deliveryAddress: v.fulfilmentType === 'DELIVERY' ? { line1: v.line1, city: v.city, state: v.state } : undefined,
      } });
      sessionStorage.removeItem('dl_idem');
      await reload();
      router.push(`/account/orders/${order.id}?placed=1`);
    } catch (err) { setFormError((err as Error).message); await reload(); } finally { setBusy(false); }
  }

  if (authLoading || cartLoading || !user) return <div className="mx-auto max-w-5xl px-4 py-8"><Skeleton className="h-64" /></div>;
  if (cart.lines.length === 0) return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState title="Your cart is empty" action={<ButtonLink href="/search">Browse products</ButtonLink>} /></div>;
  const methods = [
    ['BANK_TRANSFER', 'Bank transfer (upload proof after ordering)', true],
    ['CASH_ON_DELIVERY', 'Pay cash on delivery', delivery],
    ['CASH_ON_COLLECTION', 'Pay cash on collection', !delivery],
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
      <PageHeading title="Checkout" />
      <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {formError && <Alert tone="error">{formError}</Alert>}
          {!cart.valid && <Alert tone="error">Some items need attention. <Link className="underline" href="/cart">Review your cart</Link>.</Alert>}
          <fieldset className="space-y-3 rounded-lg border border-line bg-white p-5"><legend className="px-1 font-semibold">Your details</legend>
            <Field label="Full name" htmlFor="name" error={errors.customerName}><Input id="name" autoComplete="name" value={f.customerName} error={errors.customerName} onChange={(e) => set('customerName', e.target.value)} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Email" htmlFor="email" error={errors.customerEmail}><Input id="email" type="email" autoComplete="email" value={f.customerEmail} error={errors.customerEmail} onChange={(e) => set('customerEmail', e.target.value)} /></Field>
              <Field label="Phone number" htmlFor="phone" error={errors.customerPhone}><Input id="phone" type="tel" autoComplete="tel" value={f.customerPhone} error={errors.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} /></Field>
            </div>
          </fieldset>
          <fieldset className="space-y-3 rounded-lg border border-line bg-white p-5"><legend className="px-1 font-semibold">Delivery or collection</legend>
            <div className="flex flex-wrap gap-4">
              {settings?.deliveryEnabled !== false && <label className="flex min-h-11 items-center gap-2"><input type="radio" name="ft" className="accent-brand" checked={delivery} onChange={() => { set('fulfilmentType', 'DELIVERY'); set('paymentMethod', 'BANK_TRANSFER'); }} /> Delivery</label>}
              {settings?.collectionEnabled !== false && <label className="flex min-h-11 items-center gap-2"><input type="radio" name="ft" className="accent-brand" checked={!delivery} onChange={() => { set('fulfilmentType', 'COLLECTION'); set('paymentMethod', 'BANK_TRANSFER'); }} /> Collect from store</label>}
            </div>
            {delivery ? (
              <div className="space-y-3">
                <Field label="Street address" htmlFor="line1" error={errors.line1}><Input id="line1" autoComplete="street-address" value={f.line1} error={errors.line1} onChange={(e) => set('line1', e.target.value)} /></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="City" htmlFor="city" error={errors.city}><Input id="city" autoComplete="address-level2" value={f.city} error={errors.city} onChange={(e) => set('city', e.target.value)} /></Field>
                  <Field label="State" htmlFor="state" error={errors.state}><Input id="state" autoComplete="address-level1" value={f.state} error={errors.state} onChange={(e) => set('state', e.target.value)} /></Field>
                </div>
              </div>
            ) : settings?.businessAddress && <p className="text-sm text-muted">Collect from: {settings.businessAddress}</p>}
            <Field label="Order notes (optional)" htmlFor="notes"><Textarea id="notes" rows={3} maxLength={500} value={f.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
          </fieldset>
          <fieldset className="space-y-3 rounded-lg border border-line bg-white p-5"><legend className="px-1 font-semibold">Payment</legend>
            <Select aria-label="Payment method" value={f.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>{methods.filter((m) => m[2]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
            {errors.paymentMethod && <p role="alert" className="text-xs text-red-700">{errors.paymentMethod}</p>}
            {f.paymentMethod === 'BANK_TRANSFER' && (settings?.paymentInstructions
              ? <section aria-label="Store bank transfer details" className="space-y-2 rounded-md border border-brand/20 bg-brand-50 p-4">
                  <h3 className="font-semibold text-brand">Transfer to the store account</h3>
                  <p className="text-sm">Amount to pay: <strong>{formatNaira(total)}</strong></p>
                  <p className="whitespace-pre-line text-sm">{settings.paymentInstructions}</p>
                  <p className="text-xs text-muted">After placing your order, upload your payment proof from your order page. The store will review it before marking payment as received.</p>
                </section>
              : <Alert>The store hasn&apos;t published bank details yet. You can still place the order and the store will contact you.</Alert>)}
          </fieldset>
        </div>
        <aside className="h-fit space-y-3 rounded-lg border border-line bg-white p-5" aria-label="Order summary">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <ul className="divide-y divide-line text-sm">{cart.lines.map((l) => <li key={(l.id ?? '') + l.productId + l.variantId} className="flex justify-between gap-2 py-2"><span>{l.quantity} × {l.name}{l.variantName ? ` (${l.variantName})` : ''}</span><span>{formatNaira(l.lineTotal)}</span></li>)}</ul>
          <dl className="space-y-1 border-t border-line pt-3 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatNaira(cart.subtotal)}</dd></div><div className="flex justify-between"><dt>Delivery fee</dt><dd>{formatNaira(fee)}</dd></div><div className="flex justify-between pt-1 text-base font-semibold"><dt>Total</dt><dd>{formatNaira(total)}</dd></div></dl>
          <Button type="submit" size="lg" className="w-full" disabled={busy || !cart.valid}>{busy ? 'Placing order…' : 'Place order'}</Button>
          <p className="text-xs text-muted">Prices and stock are re-checked by the store when you place the order.</p>
        </aside>
      </form>
    </div>
  );
}
