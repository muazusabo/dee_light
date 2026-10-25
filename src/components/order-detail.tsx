'use client';
import { useRef, useState } from 'react';
import { Alert, Badge, Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/modal';
import { formatDate, formatNaira, statusLabel } from '@/lib/format';
import type { Order } from '@/types';

export function OrderDetail({ order: o, onUploadProof, onCancel, busy, message }: { order: Order; onUploadProof: (f: File) => void; onCancel: () => void; busy: boolean; message: string | null }) {
  const file = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState(false);
  const canCancel = o.status === 'PENDING' && o.paymentStatus !== 'VERIFIED';
  const needsProof = o.paymentMethod === 'BANK_TRANSFER' && o.status !== 'CANCELLED' && ['UNPAID', 'REJECTED', 'PROOF_SUBMITTED'].includes(o.paymentStatus);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-semibold text-brand">{o.orderNumber}</h1><p className="text-sm text-muted">Placed {formatDate(o.createdAt)}</p></div>
        <div className="flex gap-2"><Badge>Order: {statusLabel(o.status)}</Badge><Badge tone={o.paymentStatus === 'VERIFIED' ? 'success' : o.paymentStatus === 'REJECTED' ? 'danger' : 'warning'}>Payment: {statusLabel(o.paymentStatus)}</Badge></div>
      </div>
      {message && <Alert>{message}</Alert>}
      <section className="rounded-lg border border-line bg-white">
        <h2 className="border-b border-line px-4 py-3 text-lg font-semibold">Items</h2>
        <ul className="divide-y divide-line">{o.items.map((i) => <li key={i.id} className="flex justify-between gap-3 px-4 py-3 text-sm"><span>{i.quantity} × {i.productName}{i.variantName ? ` (${i.variantName})` : ''}</span><span>{formatNaira(i.lineTotal)}</span></li>)}</ul>
        <dl className="space-y-1 border-t border-line px-4 py-3 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatNaira(o.subtotal)}</dd></div><div className="flex justify-between"><dt>Delivery fee</dt><dd>{formatNaira(o.deliveryFee)}</dd></div><div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{formatNaira(o.total)}</dd></div></dl>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-4 text-sm"><h2 className="mb-2 text-lg font-semibold">{o.fulfilmentType === 'DELIVERY' ? 'Delivery' : 'Collection'}</h2>
          <p>{o.customerName}</p><p>{o.customerPhone}</p><p>{o.customerEmail}</p>
          {o.deliveryAddress && <p className="mt-2 text-muted">{[o.deliveryAddress.line1, o.deliveryAddress.city, o.deliveryAddress.state].filter(Boolean).join(', ')}</p>}
          {o.notes && <p className="mt-2 text-muted">Notes: {o.notes}</p>}</div>
        <div className="rounded-lg border border-line bg-white p-4 text-sm"><h2 className="mb-2 text-lg font-semibold">History</h2>
          <ol className="space-y-1">{o.history.map((h) => <li key={h.id}>{statusLabel(h.toStatus)} <span className="text-muted">· {formatDate(h.createdAt)}</span></li>)}</ol></div>
      </section>
      {needsProof && (
        <section className="rounded-lg border border-line bg-white p-4 text-sm"><h2 className="mb-2 text-lg font-semibold">Proof of payment</h2>
          <p className="mb-3 text-muted">{o.hasPaymentProof ? 'Proof uploaded. You can replace it if needed. Your payment is confirmed only after the store verifies it.' : 'After paying by bank transfer, upload a screenshot or photo of your receipt (JPEG, PNG or WebP, up to 5 MB).'}</p>
          <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" id="proof" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadProof(f); e.target.value = ''; }} />
          <Button variant="secondary" disabled={busy} onClick={() => file.current?.click()}>{busy ? 'Uploading…' : o.hasPaymentProof ? 'Replace proof' : 'Upload proof'}</Button></section>
      )}
      {canCancel && <><Button variant="ghost" className="text-red-700" onClick={() => setConfirm(true)}>Cancel order</Button>
        <ConfirmDialog open={confirm} danger title="Cancel this order?" message="Items will be returned to stock. This can't be undone." confirmLabel="Cancel order" busy={busy} onConfirm={() => { setConfirm(false); onCancel(); }} onCancel={() => setConfirm(false)} /></>}
    </div>
  );
}
