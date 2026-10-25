import Link from 'next/link';
import { SafeImage } from '@/components/safe-image';
import type { Category } from '@/types';

export function CategoryCard({ c }: { c: Pick<Category, 'name' | 'slug' | 'description' | 'imageUrl'> }) {
  return (
    <Link href={`/${c.slug}`} className="group flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] bg-brand-50"><SafeImage src={c.imageUrl} alt={`${c.name} category`} sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw" className="transition-transform duration-300 group-hover:scale-105" /></div>
      <div className="p-4"><h3 className="text-xl font-semibold text-brand">{c.name}</h3>{c.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>}<span className="mt-3 inline-block text-sm font-medium text-brand underline-offset-4 group-hover:underline">View products →</span></div>
    </Link>
  );
}
