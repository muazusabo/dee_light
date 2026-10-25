import { z } from 'zod';

export const phone = z.string().trim().regex(/^\+?[0-9][0-9\s-]{6,17}$/, 'Enter a valid phone number');
const password = z.string().min(8, 'At least 8 characters').regex(/[A-Za-z]/, 'Include a letter').regex(/\d/, 'Include a number');

export const loginSchema = z.object({ email: z.string().trim().email('Enter a valid email'), password: z.string().min(1, 'Enter your password') });
export const registerSchema = z.object({ name: z.string().trim().min(2, 'Enter your name'), email: z.string().trim().email('Enter a valid email'), password });
export const resetSchema = z.object({ password, confirm: z.string() }).refine((v) => v.password === v.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export const checkoutSchema = z.object({
  fulfilmentType: z.enum(['DELIVERY', 'COLLECTION']),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CASH_ON_DELIVERY', 'CASH_ON_COLLECTION']),
  customerName: z.string().trim().min(2, 'Enter your name'),
  customerEmail: z.string().trim().email('Enter a valid email'),
  customerPhone: phone,
  line1: z.string().trim().optional(), city: z.string().trim().optional(), state: z.string().trim().optional(), notes: z.string().max(500).optional(),
}).superRefine((v, ctx) => {
  if (v.fulfilmentType === 'DELIVERY') {
    for (const f of ['line1', 'city', 'state'] as const) if (!v[f] || v[f]!.length < 2) ctx.addIssue({ code: 'custom', path: [f], message: 'Required for delivery' });
  }
  if (v.paymentMethod === 'CASH_ON_DELIVERY' && v.fulfilmentType !== 'DELIVERY') ctx.addIssue({ code: 'custom', path: ['paymentMethod'], message: 'Cash on delivery needs delivery' });
  if (v.paymentMethod === 'CASH_ON_COLLECTION' && v.fulfilmentType !== 'COLLECTION') ctx.addIssue({ code: 'custom', path: ['paymentMethod'], message: 'Cash on collection needs collection' });
});
export type FieldErrors = Record<string, string>;
export function errorsOf(e: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const i of e.issues) { const k = String(i.path[0] ?? '_'); if (!out[k]) out[k] = i.message; }
  return out;
}
