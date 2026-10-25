import type { Variant } from '@/types';
export const DIMS = ['size', 'color', 'volume'] as const;
export type Dim = (typeof DIMS)[number];
export type Selection = Partial<Record<Dim, string>>;

export const activeDims = (vs: Variant[]): Dim[] => DIMS.filter((d) => vs.some((v) => !!v[d]));
export const optionsFor = (vs: Variant[], dim: Dim): string[] => [...new Set(vs.map((v) => v[dim]).filter((x): x is string => !!x))];
/** The variant matching every selected dimension, or undefined until the selection is complete. */
export function findVariant(vs: Variant[], dims: Dim[], sel: Selection): Variant | undefined {
  if (dims.length === 0) return undefined;
  if (dims.some((d) => !sel[d])) return undefined;
  return vs.find((v) => dims.every((d) => (v[d] ?? '') === sel[d]));
}
