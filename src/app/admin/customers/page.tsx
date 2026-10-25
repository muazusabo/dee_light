'use client';
import { useState } from 'react';
import { Alert, Badge, Button, EmptyState, Input, PageHeading, Skeleton } from '@/components/ui';
import { useApi, useDebounced } from '@/hooks/use-api';
import { qs } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Paged } from '@/types';

type Row = { id: string; name: string; email: string; phone: string | null; status: string; createdAt: string; _count: { orders: number } };
export default function Customers() {
  const [q, setQ] = useState(''); const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const { data, error, loading } = useApi<Paged<Row>>(`/admin/customers${qs({ q: dq, page, pageSize: 20 })}`);
  return (
    <>
      <PageHeading title="Customers" />
      <Input aria-label="Search customers" type="search" placeholder="Search name or email" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="mb-4 max-w-sm" />
      {error && <Alert tone="error">{error}</Alert>}
      {loading && !data ? <Skeleton className="h-48" /> : data?.items.length === 0 ? <EmptyState title="No customers found" /> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white"><table className="min-w-[680px] w-full text-left text-sm"><caption className="sr-only">Customers. Swipe horizontally to view all columns on small screens.</caption>
          <thead className="border-b border-line bg-paper"><tr>{['Name', 'Email', 'Phone', 'Joined', 'Orders', 'Status'].map((h) => <th key={h} scope="col" className="p-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">{data?.items.map((c) => <tr key={c.id}><td className="p-3 font-medium">{c.name}</td><td className="p-3">{c.email}</td><td className="p-3">{c.phone ?? '—'}</td><td className="p-3">{formatDate(c.createdAt)}</td><td className="p-3">{c._count.orders}</td><td className="p-3"><Badge tone={c.status === 'ACTIVE' ? 'success' : 'danger'}>{c.status}</Badge></td></tr>)}</tbody></table></div>
      )}
      {data && data.totalPages > 1 && <div className="mt-4 flex justify-center gap-2"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>}
    </>
  );
}
