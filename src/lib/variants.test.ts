import { describe, expect, it } from 'vitest';
import type { Variant } from '@/types';
import { activeDims, findVariant, optionsFor } from './variants';
const v = (id: string, o: Partial<Variant>): Variant => ({ id, name: id, sku: null, priceOverride: null, stockQuantity: 1, size: null, color: null, volume: null, ...o });
const shoes = [v('a', { size: '41', color: 'Black' }), v('b', { size: '42', color: 'Black' }), v('c', { size: '42', color: 'Brown' })];
describe('variant selection', () => {
  it('detects which dimensions apply', () => { expect(activeDims(shoes)).toEqual(['size', 'color']); expect(activeDims([v('x', { volume: '50ml' })])).toEqual(['volume']); });
  it('lists unique options', () => { expect(optionsFor(shoes, 'size')).toEqual(['41', '42']); });
  it('needs a complete selection', () => { expect(findVariant(shoes, ['size', 'color'], { size: '42' })).toBeUndefined(); });
  it('finds the matching variant', () => { expect(findVariant(shoes, ['size', 'color'], { size: '42', color: 'Brown' })?.id).toBe('c'); });
  it('returns undefined for a combination that does not exist', () => { expect(findVariant(shoes, ['size', 'color'], { size: '41', color: 'Brown' })).toBeUndefined(); });
});
