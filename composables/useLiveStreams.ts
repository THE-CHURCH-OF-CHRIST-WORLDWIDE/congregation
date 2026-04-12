export function useLiveStreams() {
  const store = usePublicLiveStreamStore()

  return {
    isLive: computed(() => store.isLive),
    currentStream: computed(() => store.currentStream),
    recordedStreams: computed(() => store.recordedStreams),
    filteredRecorded: computed(() => store.filteredRecorded),
    activeTab: computed(() => store.activeTab),
    searchQuery: computed({
      get: () => store.searchQuery,
      set: (v: string) => store.setSearch(v),
    }),
    activityFilter: computed({
      get: () => store.activityFilter,
      set: (v: string) => store.setFilter(v),
    }),
    setTab: (tab: 'live' | 'recorded') => store.setTab(tab),
    toggleLive: () => store.toggleLive(),
  }
}
