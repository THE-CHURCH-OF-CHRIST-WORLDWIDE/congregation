import { defineStore } from 'pinia'
import type { PublicSermon, Lesson } from '~/types/public'

interface PublicTeachingsState {
  sermons: PublicSermon[]
  sundaySchool: Lesson[]
  activeFilter: string
  searchQuery: string
}

export const usePublicTeachingsStore = defineStore('publicTeachings', {
  state: (): PublicTeachingsState => ({
    sermons: [],
    sundaySchool: [],
    activeFilter: 'All',
    searchQuery: '',
  }),

  getters: {
    filteredSermons(state): PublicSermon[] {
      let items = state.sermons
      if (state.activeFilter !== 'All') {
        items = items.filter(s =>
          s.tags.some(t => t.toLowerCase() === state.activeFilter.toLowerCase()),
        )
      }
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase()
        items = items.filter(
          s =>
            s.title.toLowerCase().includes(q) ||
            s.preacher.toLowerCase().includes(q),
        )
      }
      return items
    },

    filteredLessons(state): Lesson[] {
      let items = state.sundaySchool
      if (state.activeFilter !== 'All') {
        items = items.filter(l =>
          l.tags.some(t => t.toLowerCase() === state.activeFilter.toLowerCase()),
        )
      }
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase()
        items = items.filter(
          l =>
            l.title.toLowerCase().includes(q) ||
            l.preacher.toLowerCase().includes(q),
        )
      }
      return items
    },

    getSermonBySlug(state) {
      return (slug: string) => state.sermons.find(s => s.slug === slug) ?? null
    },

    getLessonBySlug(state) {
      return (slug: string) => state.sundaySchool.find(l => l.slug === slug) ?? null
    },
  },

  actions: {
    fetchSermons() {
      // Seeded via usePublicMockData
    },
    fetchLessons() {
      // Seeded via usePublicMockData
    },
    setFilter(filter: string) {
      this.activeFilter = filter
    },
    setSearch(q: string) {
      this.searchQuery = q
    },
  },
})
