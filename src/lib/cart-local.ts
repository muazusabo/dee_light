export type LocalLine = { productId: string; variantId: string | null; quantity: number };
const KEY = 'dl_cart_v1';
export const lineKey = (l: { productId: string; variantId: string | null }) => `${l.productId}:${l.variantId ?? 'none'}`;

export function readLocal(): LocalLine[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(v) ? v.filter((l) => l && typeof l.productId === 'string' && Number.isInteger(l.quantity)) : []; } catch { return []; }
}
export function writeLocal(lines: LocalLine[]) { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* storage unavailable */ } }
export const clearLocal = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } };

/** Pure helpers (unit-tested). Identical product+variant lines are consolidated. */
export function addLine(lines: LocalLine[], add: LocalLine): LocalLine[] {
  const k = lineKey(add);
  const found = lines.find((l) => lineKey(l) === k);
  if (!found) return [...lines, add];
  return lines.map((l) => (lineKey(l) === k ? { ...l, quantity: Math.min(99, l.quantity + add.quantity) } : l));
}
export const setLineQty = (lines: LocalLine[], key: string, quantity: number) => lines.map((l) => (lineKey(l) === key ? { ...l, quantity } : l));
export const removeLine = (lines: LocalLine[], key: string) => lines.filter((l) => lineKey(l) !== key);
