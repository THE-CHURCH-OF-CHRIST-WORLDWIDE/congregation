import { defineStore } from 'pinia'
import type { PublicSermon, Lesson, RecordedStream } from '~/types/public'
import { useTeachingsRepository } from '~/repositories/teachingsRepository'
import { splitTeachings } from '~/utils/publicTeachings'

interface PublicTeachingsState {
  sermons: PublicSermon[]
  sundaySchool: Lesson[]
  /** Teachings with a playable recording, shown under Live Streams → Recorded. */
  recordings: RecordedStream[]
  activeFilter: string
  searchQuery: string
  loading: boolean
  loaded: boolean
  error: string | null
}

// One in-flight request shared by every caller (pages, teasers, the live page).
let inflight: Promise<void> | null = null

export const usePublicTeachingsStore = defineStore('publicTeachings', {
  state: (): PublicTeachingsState => ({
    sermons: [],
    sundaySchool: [],
    recordings: [],
    activeFilter: 'All',
    searchQuery: '',
    loading: false,
    loaded: false,
    error: null,
  }),

  getters: {
    filteredSermons(state): PublicSermon[] {
      let items = state.sermons
      if (state.activeFilter !== 'All') {
        items = items.filter((s) =>
          s.tags.some((t) => t.toLowerCase() === state.activeFilter.toLowerCase())
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

    filteredLessons(state): Lesson[] {
      let items = state.sundaySchool
      if (state.activeFilter !== 'All') {
        items = items.filter((l) =>
          l.tags.some((t) => t.toLowerCase() === state.activeFilter.toLowerCase())
        )
      }
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase()
        items = items.filter(
          (l) => l.title.toLowerCase().includes(q) || l.preacher.toLowerCase().includes(q)
        )
      }
      return items
    },

    getSermonBySlug(state) {
      return (slug: string) => state.sermons.find((s) => s.slug === slug) ?? null
    },

    getLessonBySlug(state) {
      return (slug: string) => state.sundaySchool.find((l) => l.slug === slug) ?? null
    },
  },

  actions: {
    /**
     * Reads the `teachings` collection (what staff upload in Admin → Teachings) once per session
     * and splits it into sermons, Sunday School lessons and recordings. Safe to call from
     * anywhere; repeat calls reuse the first result.
     */
    load(force = false): Promise<void> {
      if (this.loaded && !force) return Promise.resolve()
      if (inflight) return inflight
      this.loading = true
      this.error = null
      inflight = useTeachingsRepository()
        .fetchSermons()
        .then((all) => {
          const { sermons, lessons, recorded } = splitTeachings(all)
          this.sermons = sermons
          this.sundaySchool = lessons
          this.recordings = recorded
          this.loaded = true
        })
        .catch((e: unknown) => {
          console.error('[publicTeachings] load failed', e)
          this.error = 'Teachings could not be loaded. Please refresh to try again.'
        })
        .finally(() => {
          this.loading = false
          inflight = null
        })
      return inflight
    },
    fetchSermons() {
      return this.load()
    },
    fetchLessons() {
      return this.load()
    },
    setFilter(filter: string) {
      this.activeFilter = filter
    },
    setSearch(q: string) {
      this.searchQuery = q
    },
  },
})
