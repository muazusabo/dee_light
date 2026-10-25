'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, Badge, Button, EmptyState, Input, PageHeading, Select, Skeleton } from '@/components/ui';
import { useApi, useDebounced } from '@/hooks/use-api';
import { qs } from '@/lib/api';
import { formatDate, formatNaira, statusLabel } from '@/lib/format';
import type { Order, Paged } from '@/types';

const STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'];
const PAYMENTS = ['UNPAID', 'PROOF_SUBMITTED', 'VERIFIED', 'REJECTED', 'REFUNDED'];
type Row = Pick<Order, 'id' | 'orderNumber' | 'customerName' | 'status' | 'paymentStatus' | 'fulfilmentType' | 'total' | 'createdAt'>;
export default function AdminOrders() {
  const [q, setQ] = useState(''); const [status, setStatus] = useState(''); const [payment, setPayment] = useState(''); const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const { data, error, loading } = useApi<Paged<Row>>(`/admin/orders${qs({ q: dq, status, paymentStatus: payment, page, pageSize: 15 })}`);
  return (
    <>
      <PageHeading title="Orders" />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Input aria-label="Search orders" type="search" placeholder="Order no., name, email, phone" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <Select aria-label="Order status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}</Select>
        <Select aria-label="Payment status" value={payment} onChange={(e) => { setPayment(e.target.value); setPage(1); }}><option value="">All payments</option>{PAYMENTS.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}</Select>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      {loading && !data ? <Skeleton className="h-64" /> : data?.items.length === 0 ? <EmptyState title="No orders match" /> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white"><table className="min-w-[720px] w-full text-left text-sm"><caption className="sr-only">Orders. Swipe horizontally to view all columns on small screens.</caption>
          <thead className="border-b border-line bg-paper"><tr>{['Order', 'Customer', 'Date', 'Type', 'Status', 'Payment', 'Total'].map((h) => <th key={h} scope="col" className="p-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">{data?.items.map((o) => (<tr key={o.id}><td className="p-3 font-medium"><Link className="hover:underline" href={`/admin/orders/${o.id}`}>{o.orderNumber}</Link></td><td className="p-3">{o.customerName}</td><td className="p-3">{formatDate(o.createdAt)}</td><td className="p-3">{statusLabel(o.fulfilmentType)}</td><td className="p-3"><Badge>{statusLabel(o.status)}</Badge></td><td className="p-3"><Badge tone={o.paymentStatus === 'VERIFIED' ? 'success' : 'warning'}>{statusLabel(o.paymentStatus)}</Badge></td><td className="p-3">{formatNaira(o.total)}</td></tr>))}</tbody></table></div>
      )}
      {data && data.totalPages > 1 && <div className="mt-4 flex justify-center gap-2"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><span className="self-center text-sm">Page {data.page} of {data.totalPages}</span><Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>}
    </>
  );
}
