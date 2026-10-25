import { ButtonLink, EmptyState } from '@/components/ui';
export default function NotFound() {
  return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState title="Page not found" message="The page you are looking for doesn't exist or is no longer available." action={<ButtonLink href="/">Back to home</ButtonLink>} /></div>;
}
