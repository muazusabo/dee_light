import type { Category } from '@/types';
/** Required nav order. Used for ordering and as a fallback if the API is unreachable (navigation only, never product data). */
export const NAV_ORDER = ['menu', 'snacks', 'drinks', 'materials', 'shoes', 'perfumes', 'jewelry'];
export const FALLBACK_NAV = NAV_ORDER.map((s) => ({ slug: s, name: s[0].toUpperCase() + s.slice(1) }));

export function navItems(categories: Pick<Category, 'slug' | 'name'>[] | null) {
  const list = categories?.length ? categories : FALLBACK_NAV;
  const rank = (s: string) => { const i = NAV_ORDER.indexOf(s); return i === -1 ? 100 : i; };
  return [...list].sort((a, b) => rank(a.slug) - rank(b.slug)).map((c) => ({ href: `/${c.slug}`, label: c.name }));
}
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
