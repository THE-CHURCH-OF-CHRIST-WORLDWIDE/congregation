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
    isLive: true,
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
    fetchLiveStatus() {
      // TODO: read from Firestore once the repository lands.
    },
    fetchRecordedStreams() {
      // TODO: read from Firestore once the repository lands.
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
