'use client';
import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input, PageHeading, Skeleton, Textarea } from '@/components/ui';
import { ImageUploader } from '@/components/image-uploader';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { Settings } from '@/types';

export default function AdminSettings() {
  const { data, error, loading } = useApi<Settings>('/settings');
  const [s, setS] = useState<Settings | null>(null);
  const [social, setSocial] = useState({ facebook: '', instagram: '', whatsapp: '', tiktok: '' });
  const [msg, setMsg] = useState<{ t: 'success' | 'error'; m: string } | null>(null);
  useEffect(() => { if (data) { setS(data); setSocial((x) => ({ ...x, ...(data.socialLinks ?? {}) })); } }, [data]);
  if (error) return <Alert tone="error">{error}</Alert>;
  if (loading || !s) return <Skeleton className="h-96" />;
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS({ ...s, [k]: v });
  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    try {
      await api('/admin/settings', { method: 'PUT', body: {
        storeName: s!.storeName, storeDescription: s!.storeDescription ?? '', logoUrl: s!.logoUrl ?? undefined, contactPhone: s!.contactPhone ?? '', ...(s!.contactEmail ? { contactEmail: s!.contactEmail } : {}),
        businessAddress: s!.businessAddress ?? '', socialLinks: Object.fromEntries(Object.entries(social).filter(([, v]) => v.trim())), deliveryEnabled: s!.deliveryEnabled,
        deliveryFee: Number(s!.deliveryFee), collectionEnabled: s!.collectionEnabled, paymentInstructions: s!.paymentInstructions ?? '' } });
      setMsg({ t: 'success', m: 'Settings saved.' });
    } catch (x) { setMsg({ t: 'error', m: (x as Error).message }); }
  }
  return (
    <>
      <PageHeading title="Settings" description="Featured products are chosen on each product (Featured on homepage)." />
      <form onSubmit={save} className="max-w-2xl space-y-6">
        {msg && <Alert tone={msg.t}>{msg.m}</Alert>}
        <section className="space-y-3 rounded-lg border border-line bg-white p-5"><h2 className="font-semibold">Store</h2>
          <Field label="Store name" htmlFor="sn"><Input id="sn" required value={s.storeName} onChange={(e) => set('storeName', e.target.value)} /></Field>
          <Field label="Description" htmlFor="sd"><Textarea id="sd" rows={3} value={s.storeDescription ?? ''} onChange={(e) => set('storeDescription', e.target.value)} /></Field>
          <div><p className="mb-1 text-sm font-medium">Logo</p><ImageUploader folder="branding" images={s.logoUrl ? [{ url: s.logoUrl }] : []} onChange={(i) => set('logoUrl', i[0]?.url ?? null)} /></div></section>
        <section className="space-y-3 rounded-lg border border-line bg-white p-5"><h2 className="font-semibold">Contact (shown in the footer)</h2>
          <Field label="Phone" htmlFor="cp"><Input id="cp" type="tel" value={s.contactPhone ?? ''} onChange={(e) => set('contactPhone', e.target.value)} /></Field>
          <Field label="Email" htmlFor="ce"><Input id="ce" type="email" value={s.contactEmail ?? ''} onChange={(e) => set('contactEmail', e.target.value)} /></Field>
          <Field label="Business location" htmlFor="ba"><Input id="ba" value={s.businessAddress ?? ''} onChange={(e) => set('businessAddress', e.target.value)} /></Field>
          {(['facebook', 'instagram', 'whatsapp', 'tiktok'] as const).map((k) => <Field key={k} label={`${k[0].toUpperCase()}${k.slice(1)} link`} htmlFor={`so-${k}`} hint="Full https:// link"><Input id={`so-${k}`} type="url" value={social[k]} onChange={(e) => setSocial({ ...social, [k]: e.target.value })} /></Field>)}</section>
        <section className="space-y-3 rounded-lg border border-line bg-white p-5"><h2 className="font-semibold">Delivery, collection &amp; payment</h2>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={s.deliveryEnabled} onChange={(e) => set('deliveryEnabled', e.target.checked)} /> Offer delivery</label>
          <Field label="Delivery fee (₦)" htmlFor="df"><Input id="df" inputMode="decimal" value={s.deliveryFee} onChange={(e) => set('deliveryFee', e.target.value)} /></Field>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={s.collectionEnabled} onChange={(e) => set('collectionEnabled', e.target.checked)} /> Offer collection from store</label>
          <Field label="Bank account details & payment instructions" htmlFor="pi" hint="Shown during checkout. Include bank name, account name, account number, and any transfer reference instructions."><Textarea id="pi" rows={5} value={s.paymentInstructions ?? ''} onChange={(e) => set('paymentInstructions', e.target.value)} /></Field></section>
        <Button type="submit" size="lg">Save settings</Button>
      </form>
    </>
  );
}
