import { describe, expect, it } from 'vitest';
import { addLine, lineKey, removeLine, setLineQty } from './cart-local';
describe('guest cart helpers', () => {
  it('keeps different variants of one product as separate lines', () => {
    const l = addLine(addLine([], { productId: 'p', variantId: '30ml', quantity: 1 }), { productId: 'p', variantId: '100ml', quantity: 1 });
    expect(l).toHaveLength(2);
  });
  it('consolidates identical product+variant lines and caps at 99', () => {
    let l = addLine([], { productId: 'p', variantId: null, quantity: 60 });
    l = addLine(l, { productId: 'p', variantId: null, quantity: 60 });
    expect(l).toEqual([{ productId: 'p', variantId: null, quantity: 99 }]);
  });
  it('updates and removes by key', () => {
    const l = addLine([], { productId: 'p', variantId: 'v', quantity: 1 });
    const k = lineKey(l[0]);
    expect(setLineQty(l, k, 4)[0].quantity).toBe(4);
    expect(removeLine(l, k)).toEqual([]);
  });
});
