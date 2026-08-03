import type { MaybeRefOrGetter, Ref, ComputedRef } from 'vue'

/**
 * Client-side pagination over a reactive list.
 *
 * Every paged table in the app shares this so the page-reset rules are
 * consistent: changing the underlying list (a filter, a search, a delete) sends
 * you back to page 1, and deleting the last row of the final page pulls you
 * back rather than stranding you on an empty page.
 */
export function usePagination<T>(source: MaybeRefOrGetter<T[]>, perPage = 10) {
  const page = ref(1)

  const items = computed(() => toValue(source) ?? [])
  const total = computed(() => items.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))

  const paginated = computed(() =>
    items.value.slice((page.value - 1) * perPage, page.value * perPage)
  )

  /** 1-based index of the first row on this page (0 when the list is empty). */
  const rangeStart = computed(() => (total.value === 0 ? 0 : (page.value - 1) * perPage + 1))
  const rangeEnd = computed(() => Math.min(page.value * perPage, total.value))

  // Reset when the list identity changes — a new filter should not leave the
  // reader on page 4 of a 2-page result.
  watch(total, () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  })
  watch(
    () => toValue(source),
    () => {
      page.value = 1
    }
  )

  return {
    page,
    perPage,
    total: total as ComputedRef<number>,
    totalPages,
    paginated: paginated as ComputedRef<T[]>,
    rangeStart,
    rangeEnd,
  } satisfies Record<string, unknown> & { page: Ref<number> }
}
