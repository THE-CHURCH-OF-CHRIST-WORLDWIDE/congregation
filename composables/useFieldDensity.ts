import type { InjectionKey } from 'vue'

export type FieldSize = 'sm' | 'md'

/**
 * Lets a container set the size of every field inside it.
 *
 * Repeating row editors want compact controls, but the fields in them are the same `Input` and
 * `Select` components used for full-width single fields. Passing `size="sm"` to each of forty
 * call sites is churn that drifts; a wrapper declaring density once does not. An explicit
 * `size` prop on the field still wins, so a single field can opt out.
 */
export const FIELD_DENSITY: InjectionKey<FieldSize> = Symbol('field-density')

/** Called by a container — e.g. a repeater row — to set the density of its fields. */
export function provideFieldDensity(size: FieldSize) {
  provide(FIELD_DENSITY, size)
}

/** Called by a field. An explicit prop beats the inherited value, which beats `md`. */
export function useFieldSize(explicit?: () => FieldSize | undefined) {
  const inherited = inject(FIELD_DENSITY, 'md' as FieldSize)
  return computed<FieldSize>(() => explicit?.() ?? inherited)
}
