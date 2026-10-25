'use client';
import Link from 'next/link';
import { Alert, PageHeading, Skeleton } from '@/components/ui';
import { useApi } from '@/hooks/use-api';
import { formatNaira } from '@/lib/format';

type D = {
  totalProducts: number; activeProducts: number; totalOrders: number; pendingOrders: number; processingOrders: number; completedOrders: number;
  customers: number; revenue: string | number; pendingProofCount: number; pendingProofAmount: string | number;
  lowStock: { productId: string; name: string; stock: number }[];
};
export default function Dashboard() {
  const { data, error, loading } = useApi<D>('/admin/dashboard');
  return (
    <>
      <PageHeading title="Dashboard" description="A live overview of orders, payments, and stock." />
      {error && <Alert tone="error">{error}</Alert>}
      {loading && !data ? <Skeleton className="h-40" /> : data && (
        <>
          <section aria-labelledby="orders-summary">
            <h2 id="orders-summary" className="mb-3 text-xl font-semibold text-brand">Orders &amp; payments</h2>
            <dl className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              <SummaryCard label="New orders" value={data.pendingOrders} href="/admin/orders" />
              <SummaryCard label="In progress" value={data.processingOrders} href="/admin/orders" />
              <SummaryCard label="Completed" value={data.completedOrders} href="/admin/orders" />
              <SummaryCard label="Proofs awaiting review" value={data.pendingProofCount} href="/admin/orders">
                <span className="mt-1 block text-sm text-muted">Order totals: {formatNaira(data.pendingProofAmount)}</span>
              </SummaryCard>
              <SummaryCard label="Verified revenue" value={formatNaira(data.revenue)}>
                <span className="mt-1 block text-xs text-muted">Excludes unverified proofs and cancelled orders.</span>
              </SummaryCard>
              <SummaryCard label="All orders" value={data.totalOrders} />
            </dl>
          </section>
          <section aria-labelledby="store-summary" className="mt-8">
            <h2 id="store-summary" className="mb-3 text-xl font-semibold text-brand">Store</h2>
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <SummaryCard label="Active products" value={`${data.activeProducts} / ${data.totalProducts}`} href="/admin/products" />
              <SummaryCard label="Customers" value={data.customers} href="/admin/customers" />
            </dl>
          </section>
          <section aria-labelledby="low-stock" className="mt-8"><h2 id="low-stock" className="mb-3 text-xl font-semibold">Low stock</h2>
            {data.lowStock.length === 0 ? <p className="text-sm text-muted">No low-stock items.</p> : <ul className="divide-y divide-line rounded-lg border border-line bg-white">{data.lowStock.map((l, i) => <li key={i} className="flex justify-between p-3 text-sm"><Link href={`/admin/products/${l.productId}/edit`} className="hover:underline">{l.name}</Link><span className={l.stock === 0 ? 'font-semibold text-red-700' : ''}>{l.stock} left</span></li>)}</ul>}</section>
        </>
      )}
    </>
  );
}

function SummaryCard({ label, value, href, children }: { label: string; value: string | number; href?: string; children?: React.ReactNode }) {
  return <div className="rounded-lg border border-line bg-white p-4">
    <dl><dt className="text-sm text-muted">{label}</dt><dd className="mt-1 text-2xl font-semibold text-brand">{href ? <Link href={href} className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">{value}</Link> : value}{children}</dd></dl>
  </div>;
}
