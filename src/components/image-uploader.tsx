'use client';
import { useRef, useState } from 'react';
import { Alert, Button } from '@/components/ui';
import { SafeImage } from '@/components/safe-image';
import { api } from '@/lib/api';

export type UploadedImage = { url: string; storageKey?: string; alt?: string };
/** Admin-only uploader: files go to the API (which validates and stores them in object storage), never directly to the browser's storage. */
export function ImageUploader({ folder, images, onChange, max = 1 }: { folder: 'products' | 'categories' | 'branding'; images: UploadedImage[]; onChange: (i: UploadedImage[]) => void; max?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setErr(null);
    try {
      let next = [...images];
      for (const f of Array.from(files)) {
        if (next.length >= max) break;
        if (f.size > 5 * 1024 * 1024) throw new Error(`${f.name} is larger than 5 MB`);
        const fd = new FormData(); fd.append('file', f);
        const r = await api<{ url: string; key: string }>(`/uploads/images?folder=${folder}`, { method: 'POST', form: fd });
        next = [...next, { url: r.url, storageKey: r.key }];
      }
      onChange(next);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); if (ref.current) ref.current.value = ''; }
  }
  return (
    <div className="space-y-2">
      <ul className="flex flex-wrap gap-3">
        {images.map((im, i) => (
          <li key={im.url} className="w-24 space-y-1">
            <div className="relative h-24 w-24 overflow-hidden rounded-md border border-line"><SafeImage src={im.url} alt={im.alt ?? `Image ${i + 1}`} sizes="96px" /></div>
            <div className="flex gap-1">
              {i > 0 && <Button size="sm" variant="secondary" className="min-h-7 px-2 text-xs" aria-label="Make primary" onClick={() => onChange([im, ...images.filter((_, j) => j !== i)])}>★</Button>}
              <Button size="sm" variant="secondary" className="min-h-7 px-2 text-xs text-red-700" aria-label="Remove image" onClick={() => onChange(images.filter((_, j) => j !== i))}>✕</Button>
            </div>
            {i === 0 && max > 1 && <p className="text-xs text-muted">Primary</p>}
          </li>
        ))}
      </ul>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" multiple={max > 1} className="sr-only" id={`up-${folder}`} onChange={(e) => pick(e.target.files)} />
      {images.length < max && <Button variant="secondary" size="sm" disabled={busy} onClick={() => ref.current?.click()}>{busy ? 'Uploading…' : max > 1 ? 'Add images' : 'Upload image'}</Button>}
      {err && <Alert tone="error">{err}</Alert>}
    </div>
  );
}
