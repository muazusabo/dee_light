'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, Badge, Button, ButtonLink, EmptyState, Input, PageHeading, Skeleton } from '@/components/ui';
import { ConfirmDialog } from '@/components/modal';
import { useApi, useDebounced } from '@/hooks/use-api';
import { api, qs } from '@/lib/api';
import { formatNaira } from '@/lib/format';
import type { Paged } from '@/types';

type Row = { id: string; name: string; basePrice: string; isActive: boolean; isFeatured: boolean; stockQuantity: number; trackStock: boolean; category: { name: string }; _count: { variants: number } };
export default function AdminProducts() {
  const [q, setQ] = useState(''); const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const { data, error, loading, reload } = useApi<Paged<Row>>(`/admin/products${qs({ q: dq, page, pageSize: 15 })}`);
  const [del, setDel] = useState<Row | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <>
      <PageHeading title="Products"><ButtonLink href="/admin/products/new">New product</ButtonLink></PageHeading>
      <Input aria-label="Search products" type="search" placeholder="Search by name or brand" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="mb-4 max-w-sm" />
      {error && <Alert tone="error">{error}</Alert>}{msg && <Alert className="mb-3">{msg}</Alert>}
      {loading && !data ? <Skeleton className="h-64" /> : data && data.items.length === 0 ? <EmptyState title="No products" action={<ButtonLink href="/admin/products/new">Create your first product</ButtonLink>} /> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white"><table className="min-w-[680px] w-full text-left text-sm"><caption className="sr-only">Products. Swipe horizontally to view all columns on small screens.</caption>
          <thead className="border-b border-line bg-paper"><tr><th scope="col" className="p-3">Name</th><th scope="col" className="p-3">Category</th><th scope="col" className="p-3">Price</th><th scope="col" className="p-3">Stock</th><th scope="col" className="p-3">Status</th><th scope="col" className="p-3"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody className="divide-y divide-line">{data?.items.map((p) => (
            <tr key={p.id}><td className="p-3 font-medium"><Link href={`/admin/products/${p.id}/edit`} className="hover:underline">{p.name}</Link></td><td className="p-3">{p.category.name}</td><td className="p-3">{formatNaira(p.basePrice)}</td>
              <td className="p-3">{p._count.variants ? `${p._count.variants} variants` : p.trackStock ? p.stockQuantity : '—'}</td>
              <td className="p-3"><Badge tone={p.isActive ? 'success' : 'neutral'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>{p.isFeatured && <> <Badge tone="gold">Featured</Badge></>}</td>
              <td className="space-x-1 p-3 text-right"><Button size="sm" variant="secondary" onClick={async () => { await api(`/admin/products/${p.id}/active`, { method: 'PATCH', body: { isActive: !p.isActive } }); reload(); }}>{p.isActive ? 'Deactivate' : 'Activate'}</Button><Button size="sm" variant="ghost" className="text-red-700" onClick={() => setDel(p)}>Delete</Button></td></tr>))}</tbody></table></div>
      )}
      {data && data.totalPages > 1 && <div className="mt-4 flex justify-center gap-2"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><span className="self-center text-sm">Page {data.page} of {data.totalPages}</span><Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>}
      <ConfirmDialog open={!!del} danger title={`Delete “${del?.name}”?`} message="If this product appears in past orders it will be deactivated instead, so order history is preserved." confirmLabel="Delete" onCancel={() => setDel(null)}
        onConfirm={async () => { const p = del!; setDel(null); try { const r = await api<{ deleted: boolean }>(`/admin/products/${p.id}`, { method: 'DELETE' }); setMsg(r.deleted ? 'Product deleted.' : 'Product has order history, so it was deactivated instead.'); reload(); } catch (e) { setMsg((e as Error).message); } }} />
    </>
  );
}
