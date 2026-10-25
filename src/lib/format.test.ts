import { describe, expect, it } from 'vitest';
import { formatNaira, statusLabel } from './format';
describe('format', () => {
  it('formats naira', () => { expect(formatNaira('15000')).toContain('15,000'); expect(formatNaira(null)).toContain('0'); });
  it('humanises statuses', () => { expect(statusLabel('OUT_FOR_DELIVERY')).toBe('Out for delivery'); });
});
