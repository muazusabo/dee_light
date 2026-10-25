'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { AuthShell } from '@/components/auth-shell';
import { Alert, Button, Field, Input } from '@/components/ui';
import { useAuth } from '@/features/auth-provider';
import { safeNext } from '@/lib/params';
import { errorsOf, loginSchema, type FieldErrors } from '@/lib/schemas';

function Form() {
  const { login } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));
  const [v, setV] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    const p = loginSchema.safeParse(v);
    if (!p.success) return setErrors(errorsOf(p.error));
    setErrors({}); setBusy(true);
    try { const u = await login(p.data.email, p.data.password); router.replace(next === '/account' && u.role === 'ADMIN' ? '/admin' : next); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <AuthShell title="Log in" subtitle="Welcome back to DEE-LIGHT.">
      <form onSubmit={submit} noValidate className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <Field label="Email" htmlFor="email" error={errors.email}><Input id="email" type="email" autoComplete="email" value={v.email} error={errors.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
        <Field label="Password" htmlFor="password" error={errors.password}><Input id="password" type="password" autoComplete="current-password" value={v.password} error={errors.password} onChange={(e) => setV({ ...v, password: e.target.value })} /></Field>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</Button>
        <p className="text-sm"><Link href="/forgot-password" className="text-brand underline">Forgot password?</Link></p>
        <p className="text-sm text-muted">New here? <Link href="/register" className="text-brand underline">Create an account</Link></p>
      </form>
    </AuthShell>
  );
}
export default function LoginPage() { return <Suspense><Form /></Suspense>; }
