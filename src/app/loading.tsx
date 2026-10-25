import { ProductGridSkeleton, Skeleton } from '@/components/ui';
export default function Loading() {
  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-8"><Skeleton className="h-10 w-64" /><ProductGridSkeleton /></div>;
}
