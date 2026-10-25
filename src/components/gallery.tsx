'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { SafeImage } from '@/components/safe-image';

export function Gallery({ images, name }: { images: { id: string; url: string; alt: string | null }[]; name: string }) {
  const [i, setI] = useState(0);
  const cur = images[i];
  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-brand-50"><SafeImage src={cur?.url} alt={cur?.alt ?? name} sizes="(max-width:1024px) 100vw, 50vw" priority /></div>
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto" aria-label="Product images">
          {images.map((im, idx) => (<li key={im.id}><button type="button" onClick={() => setI(idx)} aria-label={`Show image ${idx + 1}`} aria-current={idx === i} className={clsx('relative h-16 w-16 overflow-hidden rounded-md border-2', idx === i ? 'border-brand' : 'border-line')}><SafeImage src={im.url} alt="" sizes="64px" /></button></li>))}
        </ul>
      )}
    </div>
  );
}
