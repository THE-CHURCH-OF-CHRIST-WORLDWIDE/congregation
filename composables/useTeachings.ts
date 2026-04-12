export function usePublicTeachings() {
  const store = usePublicTeachingsStore()

  return {
    sermons: computed(() => store.sermons),
    sundaySchool: computed(() => store.sundaySchool),
    filteredSermons: computed(() => store.filteredSermons),
    filteredLessons: computed(() => store.filteredLessons),
    activeFilter: computed({
      get: () => store.activeFilter,
      set: (v: string) => store.setFilter(v),
    }),
    searchQuery: computed({
      get: () => store.searchQuery,
      set: (v: string) => store.setSearch(v),
    }),
    getSermonBySlug: (slug: string) => store.getSermonBySlug(slug),
    getLessonBySlug: (slug: string) => store.getLessonBySlug(slug),
  }
}
