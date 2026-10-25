'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthShell } from '@/components/auth-shell';
import { Alert, Button, Field, Input } from '@/components/ui';
import { useAuth } from '@/features/auth-provider';
import { errorsOf, registerSchema, type FieldErrors } from '@/lib/schemas';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [v, setV] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    const p = registerSchema.safeParse(v);
    if (!p.success) return setErrors(errorsOf(p.error));
    setErrors({}); setBusy(true);
    try { await register(p.data.name, p.data.email, p.data.password); router.replace('/account'); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <AuthShell title="Create account" subtitle="Save your cart and track your orders.">
      <form onSubmit={submit} noValidate className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <Field label="Full name" htmlFor="name" error={errors.name}><Input id="name" autoComplete="name" value={v.name} error={errors.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
        <Field label="Email" htmlFor="email" error={errors.email}><Input id="email" type="email" autoComplete="email" value={v.email} error={errors.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
        <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters, with letters and numbers."><Input id="password" type="password" autoComplete="new-password" value={v.password} error={errors.password} onChange={(e) => setV({ ...v, password: e.target.value })} /></Field>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Creating account…' : 'Sign up'}</Button>
        <p className="text-sm text-muted">Already registered? <Link href="/login" className="text-brand underline">Log in</Link></p>
      </form>
    </AuthShell>
  );
}
