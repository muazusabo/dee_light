'use client';
import { useState } from 'react';
import { Alert, Badge, Button, EmptyState, Field, Input, PageHeading, Skeleton, Textarea } from '@/components/ui';
import { ConfirmDialog, Modal } from '@/components/modal';
import { ImageUploader } from '@/components/image-uploader';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { Category } from '@/types';

type Draft = { id?: string; name: string; description: string; imageUrl: string; sortOrder: string; isActive: boolean };
const blank: Draft = { name: '', description: '', imageUrl: '', sortOrder: '0', isActive: true };
export default function AdminCategories() {
  const { data, error, loading, reload } = useApi<Category[]>('/admin/categories');
  const [d, setD] = useState<Draft | null>(null);
  const [del, setDel] = useState<Category | null>(null);
  const [msg, setMsg] = useState<{ t: 'error' | 'success'; m: string } | null>(null);
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!d) return;
    const body = { name: d.name, description: d.description || undefined, imageUrl: d.imageUrl || undefined, sortOrder: Number(d.sortOrder || 0), isActive: d.isActive };
    try { if (d.id) await api(`/admin/categories/${d.id}`, { method: 'PATCH', body }); else await api('/admin/categories', { method: 'POST', body }); setD(null); reload(); }
    catch (x) { setMsg({ t: 'error', m: (x as Error).message }); }
  }
  return (
    <>
      <PageHeading title="Categories"><Button onClick={() => { setMsg(null); setD(blank); }}>New category</Button></PageHeading>
      {error && <Alert tone="error">{error}</Alert>}{msg && <Alert tone={msg.t} className="mb-3">{msg.m}</Alert>}
      {loading && !data ? <Skeleton className="h-48" /> : data?.length === 0 ? <EmptyState title="No categories" message="Run the seed script to create the seven standard categories." /> : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-white">{data?.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-medium">{c.name} <span className="text-sm text-muted">/{c.slug}</span></p><p className="text-sm text-muted">{c._count?.products ?? 0} products</p></div>
            <div className="flex items-center gap-2"><Badge tone={c.isActive ? 'success' : 'neutral'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => { setMsg(null); setD({ id: c.id, name: c.name, description: c.description ?? '', imageUrl: c.imageUrl ?? '', sortOrder: String(c.sortOrder ?? 0), isActive: !!c.isActive }); }}>Edit</Button>
              <Button size="sm" variant="ghost" className="text-red-700" onClick={() => setDel(c)}>Delete</Button></div></li>))}</ul>
      )}
      <Modal open={!!d} onClose={() => setD(null)} title={d?.id ? 'Edit category' : 'New category'}>
        {d && <form onSubmit={save} className="space-y-3">
          <Field label="Name" htmlFor="cn"><Input id="cn" required minLength={2} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></Field>
          <Field label="Description" htmlFor="cd"><Textarea id="cd" rows={3} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} /></Field>
          <Field label="Display order" htmlFor="co"><Input id="co" inputMode="numeric" value={d.sortOrder} onChange={(e) => setD({ ...d, sortOrder: e.target.value.replace(/\D/g, '') })} /></Field>
          <div><p className="mb-1 text-sm font-medium">Image</p><ImageUploader folder="categories" images={d.imageUrl ? [{ url: d.imageUrl }] : []} onChange={(i) => setD({ ...d, imageUrl: i[0]?.url ?? '' })} /></div>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={d.isActive} onChange={(e) => setD({ ...d, isActive: e.target.checked })} /> Active</label>
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setD(null)}>Cancel</Button><Button type="submit">Save</Button></div></form>}
      </Modal>
      <ConfirmDialog open={!!del} danger title={`Delete “${del?.name}”?`} message="Categories with products can't be deleted; deactivate them instead." confirmLabel="Delete" onCancel={() => setDel(null)}
        onConfirm={async () => { const c = del!; setDel(null); try { await api(`/admin/categories/${c.id}`, { method: 'DELETE' }); reload(); } catch (x) { setMsg({ t: 'error', m: (x as Error).message }); } }} />
    </>
  );
}
