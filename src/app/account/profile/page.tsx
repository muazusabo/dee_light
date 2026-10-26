'use client';
import { useState } from 'react';
import { Alert, Button, Field, Input, PageHeading, Skeleton } from '@/components/ui';
import { ConfirmDialog } from '@/components/modal';
import { useAuth } from '@/features/auth-provider';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { phone } from '@/lib/schemas';
import type { User } from '@/types';

type Addr = { id: string; line1: string; city: string; state: string; isDefault: boolean };
export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [ph, setPh] = useState(user?.phone ?? '');
  const [msg, setMsg] = useState<{ t: 'success' | 'error'; m: string } | null>(null);
  const addrs = useApi<Addr[]>('/users/me/addresses');
  const [a, setA] = useState({ line1: '', city: '', state: '' });
  const [del, setDel] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    if (ph && !phone.safeParse(ph).success) return setMsg({ t: 'error', m: 'Enter a valid phone number' });
    try { const u = await api<User>('/users/me', { method: 'PATCH', body: { name, ...(ph ? { phone: ph } : {}) } }); setUser(u); setMsg({ t: 'success', m: 'Profile saved.' }); }
    catch (err) { setMsg({ t: 'error', m: (err as Error).message }); }
  }
  async function addAddr(e: React.FormEvent) {
    e.preventDefault();
    try { await api('/users/me/addresses', { method: 'POST', body: a }); setA({ line1: '', city: '', state: '' }); addrs.reload(); } catch (err) { setMsg({ t: 'error', m: (err as Error).message }); }
  }
  if (!user) return <Skeleton className="h-48" />;
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section><PageHeading title="Profile" />
        <form onSubmit={save} className="space-y-4">
          {msg && <Alert tone={msg.t}>{msg.m}</Alert>}
          <Field label="Full name" htmlFor="n"><Input id="n" value={name} minLength={2} required onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email" htmlFor="e" hint="Email can't be changed here."><Input id="e" value={user.email} disabled readOnly /></Field>
          <Field label="Phone" htmlFor="p"><Input id="p" type="tel" value={ph} onChange={(e) => setPh(e.target.value)} /></Field>
          <Button type="submit">Save changes</Button>
        </form></section>
      <section><PageHeading title="Addresses" />
        {addrs.loading && !addrs.data ? <Skeleton className="h-24" /> : <ul className="mb-4 space-y-2">{addrs.data?.map((x) => <li key={x.id} className="flex items-center justify-between rounded-md border border-line bg-white p-3 text-sm"><span>{x.line1}, {x.city}, {x.state}{x.isDefault ? ' (default)' : ''}</span><Button variant="ghost" size="sm" className="text-red-700" onClick={() => setDel(x.id)}>Remove</Button></li>)}{addrs.data?.length === 0 && <li className="text-sm text-muted">No saved addresses.</li>}</ul>}
        <form onSubmit={addAddr} className="space-y-3"><Field label="Street address" htmlFor="l1"><Input id="l1" required minLength={3} value={a.line1} onChange={(e) => setA({ ...a, line1: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="City" htmlFor="c"><Input id="c" required value={a.city} onChange={(e) => setA({ ...a, city: e.target.value })} /></Field><Field label="State" htmlFor="s"><Input id="s" required value={a.state} onChange={(e) => setA({ ...a, state: e.target.value })} /></Field></div>
          <Button type="submit" variant="secondary">Add address</Button></form></section>
      <ConfirmDialog open={!!del} danger title="Remove address?" message="This address will be deleted." confirmLabel="Remove" onCancel={() => setDel(null)} onConfirm={async () => { const id = del!; setDel(null); await api(`/users/me/addresses/${id}`, { method: 'DELETE' }); addrs.reload(); }} />
    </div>
  );
}
