import { describe, expect, it } from 'vitest';
import { checkoutSchema, errorsOf, loginSchema, registerSchema, resetSchema } from './schemas';
import { safeNext } from './params';
const base = { fulfilmentType: 'DELIVERY', paymentMethod: 'BANK_TRANSFER', customerName: 'Ada Obi', customerEmail: 'ada@example.com', customerPhone: '08012345678', line1: '12 Market Rd', city: 'Bauchi', state: 'Bauchi' } as const;
describe('auth schemas', () => {
  it('validates login', () => { expect(loginSchema.safeParse({ email: 'bad', password: 'x' }).success).toBe(false); expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true); });
  it('requires letters and numbers in passwords', () => { expect(registerSchema.safeParse({ name: 'Ada', email: 'a@b.co', password: 'abcdefgh' }).success).toBe(false); expect(registerSchema.safeParse({ name: 'Ada', email: 'a@b.co', password: 'abcdefg1' }).success).toBe(true); });
  it('checks password confirmation', () => { expect(resetSchema.safeParse({ password: 'abcdefg1', confirm: 'nope' }).success).toBe(false); });
});
describe('checkout schema', () => {
  it('accepts a complete delivery order', () => expect(checkoutSchema.safeParse(base).success).toBe(true));
  it('requires an address for delivery', () => { const r = checkoutSchema.safeParse({ ...base, line1: '' }); expect(r.success).toBe(false); if (!r.success) expect(errorsOf(r.error).line1).toBeTruthy(); });
  it('does not require an address for collection', () => expect(checkoutSchema.safeParse({ ...base, fulfilmentType: 'COLLECTION', line1: '', city: '', state: '' }).success).toBe(true));
  it('rejects cash on delivery for collection', () => expect(checkoutSchema.safeParse({ ...base, fulfilmentType: 'COLLECTION', paymentMethod: 'CASH_ON_DELIVERY' }).success).toBe(false));
  it('rejects invalid phone numbers', () => expect(checkoutSchema.safeParse({ ...base, customerPhone: 'abc' }).success).toBe(false));
});
describe('safeNext', () => {
  it('blocks open redirects', () => { expect(safeNext('//evil.com')).toBe('/account'); expect(safeNext('https://evil.com')).toBe('/account'); expect(safeNext('/checkout')).toBe('/checkout'); });
});
