import { defineStore } from 'pinia'
import type { UpcomingEvent, PastEvent } from '~/types/events'

const STORAGE_KEY = 'congregation:events'

interface PersistedShape {
  upcoming: UpcomingEvent[]
  past: PastEvent[]
}

function readPersisted(): PersistedShape | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedShape
    if (!parsed || !Array.isArray(parsed.upcoming) || !Array.isArray(parsed.past)) return null
    return parsed
  } catch {
    return null
  }
}

function writePersisted(upcoming: UpcomingEvent[], past: PastEvent[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ upcoming, past }))
  } catch {
    // Storage unavailable (private mode, quota). Ignore.
  }
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export const useEventsStore = defineStore('events', () => {
  const persisted = readPersisted()
  const activeTab = ref<'upcoming' | 'past'>('upcoming')
  const upcomingEvents = ref<UpcomingEvent[]>(persisted?.upcoming ?? [])
  const pastEvents = ref<PastEvent[]>(persisted?.past ?? [])
  const selectedUpcomingEvent = ref<UpcomingEvent | null>(null)
  const selectedPastEvent = ref<PastEvent | null>(null)
  const pastSubTab = ref<'month' | 'year'>('month')
  const galleryOpen = ref(false)
  const galleryImages = ref<string[]>([])
  const galleryStartIndex = ref(0)

  function persist() {
    writePersisted(upcomingEvents.value, pastEvents.value)
  }

  function setTab(tab: 'upcoming' | 'past') {
    activeTab.value = tab
  }

  function setUpcomingEvents(events: UpcomingEvent[]) {
    upcomingEvents.value = events
  }

  function setPastEvents(events: PastEvent[]) {
    pastEvents.value = events
  }

  function selectUpcomingEvent(event: UpcomingEvent) {
    selectedUpcomingEvent.value = event
  }

  function selectPastEvent(event: PastEvent) {
    selectedPastEvent.value = event
  }

  function openGallery(images: string[], startIndex = 0) {
    galleryImages.value = images
    galleryStartIndex.value = startIndex
    galleryOpen.value = true
  }

  function closeGallery() {
    galleryOpen.value = false
    galleryImages.value = []
    galleryStartIndex.value = 0
  }

  function setPastSubTab(tab: 'month' | 'year') {
    pastSubTab.value = tab
  }

  // ── CRUD: Upcoming ────────────────────────────────────────────────────────
  function addUpcomingEvent(event: Omit<UpcomingEvent, 'id'>): UpcomingEvent {
    const created: UpcomingEvent = { ...event, id: makeId('ue') }
    upcomingEvents.value.push(created)
    persist()
    useToast().success(`"${created.title || 'Event'}" added`)
    return created
  }

  function updateUpcomingEvent(id: string, updates: Partial<Omit<UpcomingEvent, 'id'>>) {
    const idx = upcomingEvents.value.findIndex((e) => e.id === id)
    if (idx === -1) return
    upcomingEvents.value[idx] = { ...upcomingEvents.value[idx]!, ...updates }
    if (selectedUpcomingEvent.value?.id === id) {
      selectedUpcomingEvent.value = upcomingEvents.value[idx] ?? null
    }
    persist()
    useToast().success(`"${upcomingEvents.value[idx]!.title}" updated`)
  }

  function deleteUpcomingEvent(id: string) {
    const existing = upcomingEvents.value.find((e) => e.id === id)
    if (!existing) return
    upcomingEvents.value = upcomingEvents.value.filter((e) => e.id !== id)
    if (selectedUpcomingEvent.value?.id === id) selectedUpcomingEvent.value = null
    persist()
    useToast().success(`"${existing.title}" deleted`)
  }

  // ── CRUD: Past ────────────────────────────────────────────────────────────
  function addPastEvent(event: Omit<PastEvent, 'id'>): PastEvent {
    const created: PastEvent = { ...event, id: makeId('pe') }
    pastEvents.value.push(created)
    persist()
    useToast().success(`"${created.title || 'Event'}" added`)
    return created
  }

  function updatePastEvent(id: string, updates: Partial<Omit<PastEvent, 'id'>>) {
    const idx = pastEvents.value.findIndex((e) => e.id === id)
    if (idx === -1) return
    pastEvents.value[idx] = { ...pastEvents.value[idx]!, ...updates }
    if (selectedPastEvent.value?.id === id) {
      selectedPastEvent.value = pastEvents.value[idx] ?? null
    }
    persist()
    useToast().success(`"${pastEvents.value[idx]!.title}" updated`)
  }

  function deletePastEvent(id: string) {
    const existing = pastEvents.value.find((e) => e.id === id)
    if (!existing) return
    pastEvents.value = pastEvents.value.filter((e) => e.id !== id)
    if (selectedPastEvent.value?.id === id) selectedPastEvent.value = null
    persist()
    useToast().success(`"${existing.title}" deleted`)
  }

  const thisMonthEvents = computed(() => {
    const now = new Date()
    return pastEvents.value.filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
  })

  const thisYearEvents = computed(() => {
    const now = new Date()
    const monthIds = new Set(thisMonthEvents.value.map((e) => e.id))
    return pastEvents.value.filter((e) => {
      const d = new Date(e.date)
      return d.getFullYear() === now.getFullYear() && !monthIds.has(e.id)
    })
  })

  const thisMonthCount = computed(() => thisMonthEvents.value.length)
  const thisYearCount = computed(() => thisYearEvents.value.length)

  return {
    activeTab,
    upcomingEvents,
    pastEvents,
    selectedUpcomingEvent,
    selectedPastEvent,
    pastSubTab,
    galleryOpen,
    galleryImages,
    galleryStartIndex,
    setTab,
    setUpcomingEvents,
    setPastEvents,
    selectUpcomingEvent,
    selectPastEvent,
    openGallery,
    closeGallery,
    setPastSubTab,
    addUpcomingEvent,
    updateUpcomingEvent,
    deleteUpcomingEvent,
    addPastEvent,
    updatePastEvent,
    deletePastEvent,
    persist,
    thisMonthEvents,
    thisYearEvents,
    thisMonthCount,
    thisYearCount,
  }
})
