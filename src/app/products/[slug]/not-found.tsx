import { ButtonLink, EmptyState } from '@/components/ui';
export default function NotFound() {
  return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState title="Product not found" message="This product doesn't exist or is no longer available." action={<ButtonLink href="/search">Browse products</ButtonLink>} /></div>;
}
