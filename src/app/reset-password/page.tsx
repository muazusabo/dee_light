'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { AuthShell } from '@/components/auth-shell';
import { Alert, Button, Field, Input } from '@/components/ui';
import { api } from '@/lib/api';
import { errorsOf, resetSchema, type FieldErrors } from '@/lib/schemas';

function Form() {
  const token = useSearchParams().get('token') ?? '';
  const [v, setV] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    const p = resetSchema.safeParse(v);
    if (!p.success) return setErrors(errorsOf(p.error));
    setErrors({}); setBusy(true);
    try { await api('/auth/reset-password', { method: 'POST', body: { token, password: p.data.password } }); setDone(true); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <AuthShell title="Choose a new password">
      {!token ? <Alert tone="error">This reset link is missing its token. <Link href="/forgot-password" className="underline">Request a new one</Link>.</Alert>
        : done ? <Alert tone="success">Password updated. <Link href="/login" className="font-medium underline">Log in</Link></Alert> : (
        <form onSubmit={submit} noValidate className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <Field label="New password" htmlFor="password" error={errors.password}><Input id="password" type="password" autoComplete="new-password" value={v.password} error={errors.password} onChange={(e) => setV({ ...v, password: e.target.value })} /></Field>
          <Field label="Confirm password" htmlFor="confirm" error={errors.confirm}><Input id="confirm" type="password" autoComplete="new-password" value={v.confirm} error={errors.confirm} onChange={(e) => setV({ ...v, confirm: e.target.value })} /></Field>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</Button>
        </form>)}
    </AuthShell>
  );
}
export default function ResetPage() { return <Suspense><Form /></Suspense>; }
