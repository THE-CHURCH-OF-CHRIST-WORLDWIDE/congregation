export function useFilteredContent<
  T extends { tags?: string[]; title?: string; preacher?: string },
>(items: Ref<T[]>, activeFilter: Ref<string>, searchQuery: Ref<string>) {
  const filtered = computed(() => {
    let result = items.value

    if (activeFilter.value && activeFilter.value !== 'All') {
      result = result.filter((item) =>
        item.tags?.some((tag) => tag.toLowerCase() === activeFilter.value.toLowerCase())
      )
    }

    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (item) => item.title?.toLowerCase().includes(q) || item.preacher?.toLowerCase().includes(q)
      )
    }

    return result
  })

  return { filtered }
}
