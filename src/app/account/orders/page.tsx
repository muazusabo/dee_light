'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, Badge, Button, ButtonLink, EmptyState, PageHeading, Skeleton } from '@/components/ui';
import { useApi } from '@/hooks/use-api';
import { formatDate, formatNaira, statusLabel } from '@/lib/format';
import type { Order, Paged } from '@/types';

type Row = Pick<Order, 'id' | 'orderNumber' | 'status' | 'paymentStatus' | 'total' | 'createdAt'> & { _count: { items: number } };
export default function Orders() {
  const [page, setPage] = useState(1);
  const { data, error, loading } = useApi<Paged<Row>>(`/orders?page=${page}&pageSize=10`);
  return (
    <>
      <PageHeading title="My orders" />
      {error && <Alert tone="error">{error}</Alert>}
      {loading && !data ? <Skeleton className="h-40" /> : data && data.items.length === 0 ? <EmptyState title="No orders yet" action={<ButtonLink href="/search">Start shopping</ButtonLink>} /> : (
        <>
          <ul className="divide-y divide-line rounded-lg border border-line bg-white">
            {data?.items.map((o) => (
              <li key={o.id}><Link href={`/account/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-brand-50">
                <div><p className="font-medium">{o.orderNumber}</p><p className="text-sm text-muted">{formatDate(o.createdAt)} · {o._count.items} item{o._count.items === 1 ? '' : 's'}</p></div>
                <div className="flex flex-wrap items-center gap-2"><Badge>{statusLabel(o.status)}</Badge><Badge tone={o.paymentStatus === 'VERIFIED' ? 'success' : 'warning'}>{statusLabel(o.paymentStatus)}</Badge><span className="font-semibold">{formatNaira(o.total)}</span></div></Link></li>
            ))}
          </ul>
          {data && data.totalPages > 1 && <div className="mt-4 flex justify-center gap-2"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>}
        </>
      )}
    </>
  );
}
