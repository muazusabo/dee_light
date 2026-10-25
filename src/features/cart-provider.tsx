'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { addLine, clearLocal, lineKey, readLocal, removeLine, setLineQty, writeLocal, type LocalLine } from '@/lib/cart-local';
import type { CartLine, CartView } from '@/types';
import { useAuth } from './auth-provider';

const EMPTY: CartView = { lines: [], subtotal: '0', deliveryFee: '0', deliveryEnabled: true, collectionEnabled: true, valid: true, itemCount: 0 };
type Ctx = {
  cart: CartView; count: number; loading: boolean;
  add: (productId: string, variantId: string | null, quantity: number) => Promise<void>;
  setQty: (line: CartLine, quantity: number) => Promise<void>;
  remove: (line: CartLine) => Promise<void>;
  reload: () => Promise<void>;
};
const CartContext = createContext<Ctx | null>(null);
export const useCart = () => { const c = useContext(CartContext); if (!c) throw new Error('CartProvider missing'); return c; };

/** Signed-in users: server cart. Guests: localStorage lines priced by the server via /cart/quote, merged into the account cart on login. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartView>(EMPTY);
  const [loading, setLoading] = useState(true);

  const quote = useCallback(async (items: LocalLine[]) => (items.length ? api<CartView>('/cart/quote', { method: 'POST', body: { items } }) : EMPTY), []);
  const reload = useCallback(async () => {
    try { setCart(user ? await api<CartView>('/cart') : await quote(readLocal())); } catch { /* keep last known cart */ } finally { setLoading(false); }
  }, [user, quote]);

  useEffect(() => {
    if (authLoading) return;
    (async () => {
      if (user) {
        const local = readLocal();
        if (local.length) { try { await api('/cart/merge', { method: 'POST', body: { items: local } }); } catch { /* skipped lines are dropped */ } clearLocal(); }
      }
      await reload();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  const guestApply = useCallback(async (next: LocalLine[], focusKey?: string) => {
    const view = await quote(next);
    const bad = focusKey ? view.lines.find((l) => lineKey(l) === focusKey && !l.ok) : undefined;
    if (bad) throw new Error(bad.issue ?? 'This item cannot be added');
    writeLocal(next); setCart(view);
  }, [quote]);

  const add = useCallback(async (productId: string, variantId: string | null, quantity: number) => {
    if (user) setCart(await api<CartView>('/cart/items', { method: 'POST', body: { productId, variantId, quantity } }));
    else await guestApply(addLine(readLocal(), { productId, variantId, quantity }), lineKey({ productId, variantId }));
  }, [user, guestApply]);
  const setQty = useCallback(async (line: CartLine, quantity: number) => {
    if (user && line.id) setCart(await api<CartView>(`/cart/items/${line.id}`, { method: 'PATCH', body: { quantity } }));
    else await guestApply(setLineQty(readLocal(), lineKey(line), quantity), lineKey(line));
  }, [user, guestApply]);
  const remove = useCallback(async (line: CartLine) => {
    if (user && line.id) setCart(await api<CartView>(`/cart/items/${line.id}`, { method: 'DELETE' }));
    else await guestApply(removeLine(readLocal(), lineKey(line)));
  }, [user, guestApply]);

  const value = useMemo(() => ({ cart, count: cart.itemCount, loading, add, setQty, remove, reload }), [cart, loading, add, setQty, remove, reload]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
