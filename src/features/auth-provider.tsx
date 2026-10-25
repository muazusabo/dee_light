'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

const HINT = 'dl_session_hint'; // non-sensitive flag: "this browser had a session", so we only try /auth/refresh when useful
type Ctx = { user: User | null; loading: boolean; login: (e: string, p: string) => Promise<User>; register: (n: string, e: string, p: string) => Promise<User>; logout: () => Promise<void>; setUser: (u: User | null) => void };
const AuthContext = createContext<Ctx | null>(null);
export const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error('AuthProvider missing'); return c; };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api<{ user: User | null }>('/auth/me');
        if (r.user) setUser(r.user);
        else if (localStorage.getItem(HINT)) {
          try { setUser((await api<{ user: User }>('/auth/refresh', { method: 'POST' })).user); } catch { localStorage.removeItem(HINT); }
        }
      } catch { /* API unreachable: stay anonymous */ } finally { setLoading(false); }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ user: User }>('/auth/login', { method: 'POST', body: { email, password } });
    localStorage.setItem(HINT, '1'); setUser(r.user); return r.user;
  }, []);
  const register = useCallback(async (name: string, email: string, password: string) => {
    const r = await api<{ user: User }>('/auth/register', { method: 'POST', body: { name, email, password } });
    localStorage.setItem(HINT, '1'); setUser(r.user); return r.user;
  }, []);
  const logout = useCallback(async () => {
    try { await api('/auth/logout', { method: 'POST' }); } finally { localStorage.removeItem(HINT); setUser(null); }
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
