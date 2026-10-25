import Image from 'next/image';
import clsx from 'clsx';

const HOST = 'res.cloudinary.com';
function trusted(url?: string | null) { if (!url) return false; try { const u = new URL(url); return u.protocol === 'https:' && u.hostname === HOST; } catch { return false; } }

export function ImagePlaceholder({ className, label = 'No image' }: { className?: string; label?: string }) {
  return <div role="img" aria-label={label} className={clsx('flex items-center justify-center bg-brand-50 text-brand/40', className)}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg></div>;
}
/** next/image only for the configured Cloudinary host; other URLs use a neutral placeholder. */
export function SafeImage({ src, alt, sizes, priority, className }: { src?: string | null; alt: string; sizes: string; priority?: boolean; className?: string }) {
  if (!trusted(src)) return <ImagePlaceholder className={clsx('absolute inset-0', className)} label={alt} />;
  return <Image src={src!} alt={alt} fill sizes={sizes} priority={priority} className={clsx('object-cover', className)} />;
}
