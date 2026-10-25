'use client';
import { Alert, Button } from '@/components/ui';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <div className="mx-auto max-w-3xl space-y-4 px-4 py-16"><Alert tone="error">We couldn&apos;t load this page. Please check your connection and try again.</Alert><Button onClick={reset}>Try again</Button></div>;
}
