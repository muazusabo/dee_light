'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Alert, Badge, Breadcrumbs, Button, Select, Skeleton } from '@/components/ui';
import { ConfirmDialog } from '@/components/modal';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { formatDate, formatNaira, statusLabel } from '@/lib/format';
import type { Order, OrderStatus } from '@/types';

const NEXT: Record<OrderStatus, OrderStatus[]> = { PENDING: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['PREPARING', 'CANCELLED'], PREPARING: ['READY', 'CANCELLED'], READY: ['OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'], OUT_FOR_DELIVERY: ['COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: [] };
export default function AdminOrder() {
  const { id } = useParams<{ id: string }>();
  const { data: o, error, loading, setData } = useApi<Order>(`/admin/orders/${id}`);
  const [target, setTarget] = useState<OrderStatus | ''>('');
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<Order>) => { setBusy(true); setMsg(null); try { setData(await fn()); setTarget(''); } catch (e) { setMsg((e as Error).message); } finally { setBusy(false); } };
  const setStatus = (s: OrderStatus) => run(() => api<Order>(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status: s } }));
  const setPay = (p: string) => run(() => api<Order>(`/admin/orders/${id}/payment`, { method: 'PATCH', body: { paymentStatus: p } }));
  if (error) return <Alert tone="error">{error}</Alert>;
  if (loading || !o) return <Skeleton className="h-96" />;
  const nexts = NEXT[o.status];
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Orders', href: '/admin/orders' }, { label: o.orderNumber }]} />
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-semibold text-brand">{o.orderNumber}</h1><div className="flex gap-2"><Badge>{statusLabel(o.status)}</Badge><Badge tone={o.paymentStatus === 'VERIFIED' ? 'success' : 'warning'}>Payment: {statusLabel(o.paymentStatus)}</Badge></div></div>
      {msg && <Alert tone="error">{msg}</Alert>}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-4 text-sm"><h2 className="mb-2 text-lg font-semibold">Customer</h2><p>{o.customerName}</p><p>{o.customerPhone}</p><p>{o.customerEmail}</p>
          <p className="mt-2 font-medium">{statusLabel(o.fulfilmentType)}</p>{o.deliveryAddress && <p className="text-muted">{[o.deliveryAddress.line1, o.deliveryAddress.city, o.deliveryAddress.state].filter(Boolean).join(', ')}</p>}{o.notes && <p className="mt-2 text-muted">Notes: {o.notes}</p>}</div>
        <div className="space-y-3 rounded-lg border border-line bg-white p-4 text-sm"><h2 className="text-lg font-semibold">Fulfilment</h2>
          {nexts.length ? <div className="flex gap-2"><Select aria-label="Next status" value={target} onChange={(e) => setTarget(e.target.value as OrderStatus)}><option value="">Change status…</option>{nexts.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}</Select>
            <Button disabled={!target || busy} onClick={() => (target === 'CANCELLED' ? setConfirm(true) : setStatus(target as OrderStatus))}>Update</Button></div> : <p className="text-muted">This order is closed.</p>}
          <h2 className="pt-2 text-lg font-semibold">Payment ({statusLabel(o.paymentMethod)})</h2>
          {o.paymentProofUrl ? <p><a href={o.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline">Open proof of payment</a> <span className="text-muted">(link expires in 10 minutes)</span></p> : <p className="text-muted">{o.hasPaymentProof ? 'Proof uploaded but link unavailable.' : 'No proof uploaded.'}</p>}
          <div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy || o.status === 'CANCELLED'} onClick={() => setPay('VERIFIED')}>Verify payment</Button><Button size="sm" variant="secondary" disabled={busy} onClick={() => setPay('REJECTED')}>Reject proof</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => setPay('REFUNDED')}>Mark refunded</Button></div></div>
      </section>
      <section className="rounded-lg border border-line bg-white"><h2 className="border-b border-line px-4 py-3 text-lg font-semibold">Items</h2>
        <ul className="divide-y divide-line">{o.items.map((i) => <li key={i.id} className="flex justify-between px-4 py-3 text-sm"><span>{i.quantity} × {i.productName}{i.variantName ? ` (${i.variantName})` : ''} <span className="text-muted">@ {formatNaira(i.unitPrice)}</span></span><span>{formatNaira(i.lineTotal)}</span></li>)}</ul>
        <dl className="space-y-1 border-t border-line px-4 py-3 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatNaira(o.subtotal)}</dd></div><div className="flex justify-between"><dt>Delivery</dt><dd>{formatNaira(o.deliveryFee)}</dd></div><div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{formatNaira(o.total)}</dd></div></dl></section>
      <section className="rounded-lg border border-line bg-white p-4 text-sm"><h2 className="mb-2 text-lg font-semibold">History</h2><ol className="space-y-1">{o.history.map((h) => <li key={h.id}>{statusLabel(h.toStatus)} <span className="text-muted">· {formatDate(h.createdAt)}</span></li>)}</ol></section>
      <ConfirmDialog open={confirm} danger title="Cancel this order?" message="Stock for all items will be returned to inventory." confirmLabel="Cancel order" busy={busy} onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); setStatus('CANCELLED'); }} />
    </div>
  );
}
