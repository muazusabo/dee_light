'use client';
import Link from 'next/link';
import { useState } from 'react';
import { AuthShell } from '@/components/auth-shell';
import { Alert, Button, Field, Input } from '@/components/ui';
import { api } from '@/lib/api';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setBusy(true);
    try { await api('/auth/forgot-password', { method: 'POST', body: { email: email.trim().toLowerCase() } }); setDone(true); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <AuthShell title="Forgot password" subtitle="We'll email you a link to choose a new one.">
      {done ? <Alert tone="success">If an account exists for that email, a reset link is on its way. It expires in 1 hour.</Alert> : (
        <form onSubmit={submit} className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <Field label="Email" htmlFor="email"><Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</Button>
        </form>
      )}
      <p className="mt-4 text-sm"><Link href="/login" className="text-brand underline">Back to log in</Link></p>
    </AuthShell>
  );
}
