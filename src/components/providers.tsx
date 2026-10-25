'use client';
import { AuthProvider } from '@/features/auth-provider';
import { CartProvider } from '@/features/cart-provider';
export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider><CartProvider>{children}</CartProvider></AuthProvider>;
}
