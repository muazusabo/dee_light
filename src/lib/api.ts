export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const BROWSER_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const SERVER_BASE = process.env.API_URL || BROWSER_BASE;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function messageOf(body: unknown, status: number) {
  const message = isRecord(body) ? body.message : undefined;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) {
    const parts = message.filter((part): part is string => typeof part === 'string');
    if (parts.length) return parts.join('. ');
  }
  return `Request failed (${status})`;
}

/** Server-side (Server Components): public data only, no cookies. */
export async function serverApi<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(SERVER_BASE + path, { next: { revalidate }, headers: { Accept: 'application/json' } });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, messageOf(body, res.status));
  return body.data as T;
}

/** Browser: cookie-authenticated, with one transparent refresh attempt on 401. */
export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown; form?: FormData } = {}, retried = false): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', 'X-Requested-With': 'dee-light' };
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(opts.body); }
  const res = await fetch(BROWSER_BASE + path, { method: opts.method ?? 'GET', headers, body, credentials: 'include', cache: 'no-store' });
  if (res.status === 401 && !retried && !path.startsWith('/auth/')) {
    const r = await fetch(BROWSER_BASE + '/auth/refresh', { method: 'POST', headers: { 'X-Requested-With': 'dee-light' }, credentials: 'include' });
    if (r.ok) return api<T>(path, opts, true);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, messageOf(json, res.status));
  return json.data as T;
}

export const qs = (params: Record<string, string | number | boolean | undefined | null>) => {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') u.set(k, String(v));
  const s = u.toString();
  return s ? `?${s}` : '';
};
