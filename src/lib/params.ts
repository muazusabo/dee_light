const ALLOWED = ['q', 'category', 'type', 'brand', 'color', 'size', 'volume', 'material', 'unit', 'minPrice', 'maxPrice', 'inStock', 'sort', 'page'] as const;
export type SearchParams = Record<string, string | string[] | undefined>;
/** Whitelist + flatten Next searchParams; the API validates again. */
export function pickParams(sp: SearchParams): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const k of ALLOWED) { const v = sp[k]; const s = Array.isArray(v) ? v[0] : v; if (s) out[k] = s.slice(0, 100); }
  return out;
}
export function safeNext(next: string | null | undefined, fallback = '/account') {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : fallback;
}
