import { describe, expect, it } from 'vitest'
import { ref, nextTick } from 'vue'
import { usePagination } from '~/composables/usePagination'

const list = (n: number) => Array.from({ length: n }, (_, i) => `item-${i + 1}`)

describe('usePagination', () => {
  it('slices the current page and reports the range', () => {
    const { page, paginated, total, totalPages, rangeStart, rangeEnd } = usePagination(list(25), 10)

    expect(total.value).toBe(25)
    expect(totalPages.value).toBe(3)
    expect(paginated.value).toHaveLength(10)
    expect(paginated.value[0]).toBe('item-1')
    expect(rangeStart.value).toBe(1)
    expect(rangeEnd.value).toBe(10)

    page.value = 3
    expect(paginated.value).toEqual(['item-21', 'item-22', 'item-23', 'item-24', 'item-25'])
    expect(rangeStart.value).toBe(21)
    expect(rangeEnd.value).toBe(25)
  })

  it('reports a single page and a zero range when empty', () => {
    const { totalPages, paginated, rangeStart, rangeEnd } = usePagination([], 10)

    // One page, not zero — the pager hides itself and the table shows its empty state.
    expect(totalPages.value).toBe(1)
    expect(paginated.value).toEqual([])
    expect(rangeStart.value).toBe(0)
    expect(rangeEnd.value).toBe(0)
  })

  it('returns to page 1 when the source list changes', async () => {
    const source = ref(list(25))
    const { page, paginated } = usePagination(source, 10)

    page.value = 3
    expect(paginated.value[0]).toBe('item-21')

    // e.g. the user typed a search term
    source.value = list(4)
    await nextTick()

    expect(page.value).toBe(1)
    expect(paginated.value).toHaveLength(4)
  })

  it('pulls back a page when the last row of the final page is removed', async () => {
    const source = ref(list(11))
    const { page, totalPages } = usePagination(source, 10)

    page.value = 2
    expect(totalPages.value).toBe(2)

    // Deleting the only row on page 2 must not strand the reader there.
    source.value = list(10)
    await nextTick()

    expect(page.value).toBe(1)
  })

  it('accepts a getter as its source', () => {
    const source = ref(list(12))
    const { total, paginated } = usePagination(() => source.value, 5)

    expect(total.value).toBe(12)
    expect(paginated.value).toHaveLength(5)
  })
})
