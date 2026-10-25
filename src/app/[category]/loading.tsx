import { ProductGridSkeleton, Skeleton } from '@/components/ui';
export default function Loading() {
  return <div className="mx-auto max-w-7xl px-4 py-8"><Skeleton className="mb-3 h-4 w-48" /><Skeleton className="mb-8 h-10 w-64" /><div className="grid gap-8 lg:grid-cols-[16rem_1fr]"><Skeleton className="hidden h-96 lg:block" /><ProductGridSkeleton count={8} /></div></div>;
}
