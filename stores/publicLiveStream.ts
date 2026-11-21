import { defineStore } from 'pinia'
import type { LiveStream, RecordedStream } from '~/types/public'

interface PublicLiveStreamState {
  isLive: boolean
  currentStream: LiveStream | null
  recordedStreams: RecordedStream[]
  activeTab: 'live' | 'recorded'
  searchQuery: string
  activityFilter: string
}

export const usePublicLiveStreamStore = defineStore('publicLiveStream', {
  state: (): PublicLiveStreamState => ({
    // Off until Settings says otherwise — a default of `true` showed a live badge on every page.
    isLive: false,
    currentStream: null,
    recordedStreams: [],
    activeTab: 'live',
    searchQuery: '',
    activityFilter: 'All Church Activities',
  }),

  getters: {
    filteredRecorded(state): RecordedStream[] {
      let items = state.recordedStreams
      if (state.activityFilter !== 'All Church Activities') {
        items = items.filter(
          (s) => s.serviceType.toLowerCase() === state.activityFilter.toLowerCase()
        )
      }
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase()
        items = items.filter(
          (s) => s.title.toLowerCase().includes(q) || s.preacher.toLowerCase().includes(q)
        )
      }
      return items
    },
  },

  actions: {
    /**
     * Reads the live broadcast staff switch on in Settings → Live Worship. The church settings
     * document is public and already loaded by the navbar, so this costs no extra request.
     */
    async fetchLiveStatus() {
      const settingsStore = useChurchSettingsStore()
      await settingsStore.load()
      const ls = settingsStore.settings.liveStream
      const live = Boolean(ls?.isLive && ls.url)
      this.isLive = live
      this.currentStream = live
        ? {
            id: 'live',
            title: ls.title || settingsStore.settings.liveWorship.nextTitle || 'Live worship',
            congregation: ls.congregation || settingsStore.settings.name,
            city: ls.city,
            viewerCount: 0,
            thumbnailSrc: ls.thumbnail || settingsStore.settings.heroImageUrl || '',
            startedAt: ls.startedAt,
            url: ls.url,
          }
        : null
    },
    /** Recordings are the teachings staff published with a video link. */
    async fetchRecordedStreams() {
      const teachings = usePublicTeachingsStore()
      await teachings.load()
      this.recordedStreams = teachings.recordings
    },
    setTab(tab: 'live' | 'recorded') {
      this.activeTab = tab
    },
    setFilter(filter: string) {
      this.activityFilter = filter
    },
    setSearch(q: string) {
      this.searchQuery = q
    },
    toggleLive() {
      this.isLive = !this.isLive
    },
  },
})
