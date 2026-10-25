const nf = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2, minimumFractionDigits: 0 });
/** Display only. All real arithmetic happens on the server with decimals. */
export const formatNaira = (v: string | number | null | undefined) => nf.format(Number(v ?? 0));
export const formatDate = (iso: string) => new Date(iso).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
export const statusLabel = (s: string) => s.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
