'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { OrderDetail } from '@/components/order-detail';
import { Alert, Breadcrumbs, Skeleton } from '@/components/ui';
import { api } from '@/lib/api';
import { useApi } from '@/hooks/use-api';
import type { Order } from '@/types';

function Page() {
  const { id } = useParams<{ id: string }>();
  const placed = useSearchParams().get('placed');
  const { data, error, loading, setData } = useApi<Order>(`/orders/${id}`);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true); setMsg(null);
    try { const fd = new FormData(); fd.append('file', file); setData(await api<Order>(`/orders/${id}/payment-proof`, { method: 'POST', form: fd })); setMsg('Proof received. The store will verify your payment.'); }
    catch (e) { setMsg((e as Error).message); } finally { setBusy(false); }
  }
  async function cancel() {
    setBusy(true); setMsg(null);
    try { await api(`/orders/${id}/cancel`, { method: 'POST' }); setData(await api<Order>(`/orders/${id}`)); } catch (e) { setMsg((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <>
      <Breadcrumbs items={[{ label: 'Orders', href: '/account/orders' }, { label: data?.orderNumber ?? 'Order' }]} />
      {placed && data && <Alert tone="success" className="mb-4">Thank you! Your order <strong>{data.orderNumber}</strong> has been placed.{data.paymentMethod === 'BANK_TRANSFER' ? ' Pay using the instructions below, then upload your proof of payment.' : ''}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      {loading && !data ? <Skeleton className="h-64" /> : data && <OrderDetail order={data} onUploadProof={upload} onCancel={cancel} busy={busy} message={msg} />}
    </>
  );
}
export default function OrderPage() { return <Suspense><Page /></Suspense>; }
