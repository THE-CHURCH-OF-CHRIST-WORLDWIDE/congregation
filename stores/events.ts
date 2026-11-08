import { defineStore } from 'pinia'
import { useEventsRepository } from '~/repositories/eventsRepository'
import { recordAudit } from '~/utils/audit'
import type { UpcomingEvent, PastEvent } from '~/types/events'

/** Today as "YYYY-MM-DD" in the viewer's local timezone (event dates are plain local dates). */
function localToday(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** An upcoming event whose day has passed, reshaped as a past event with blank extras. */
function toPastEvent(e: UpcomingEvent): PastEvent {
  return {
    id: e.id,
    title: e.title,
    date: e.date,
    time: e.time,
    venue: e.venue,
    category: 'Event',
    thumbnail: e.galleryImages?.[0] ?? '',
    featuredImage: e.galleryImages?.[0] ?? '',
    moderator: { name: '', avatar: '' },
    speakers: [],
  }
}

export const useEventsStore = defineStore('events', () => {
  const activeTab = ref<'upcoming' | 'past'>('upcoming')
  const upcomingEvents = ref<UpcomingEvent[]>([])
  const pastEvents = ref<PastEvent[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)
  const selectedUpcomingEvent = ref<UpcomingEvent | null>(null)
  const selectedPastEvent = ref<PastEvent | null>(null)
  const pastSubTab = ref<'month' | 'year'>('month')
  const galleryOpen = ref(false)
  const galleryImages = ref<string[]>([])
  const galleryStartIndex = ref(0)

  /**
   * Moves any upcoming event whose date is before today into the past list. Derived on the
   * client (not persisted) so it works for anonymous visitors and needs no scheduled job.
   */
  function rollOverPastEvents() {
    const today = localToday()
    const expired = upcomingEvents.value.filter((e) => e.date < today)
    if (!expired.length) return
    upcomingEvents.value = upcomingEvents.value.filter((e) => e.date >= today)
    pastEvents.value.push(...expired.map(toPastEvent))
    if (selectedUpcomingEvent.value && selectedUpcomingEvent.value.date < today)
      selectedUpcomingEvent.value = null
  }

  function fail(e: unknown, fallback: string): never {
    error.value = e instanceof Error ? e.message : fallback
    useToast().error(error.value)
    throw e
  }

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    error.value = null
    try {
      const { upcoming, past } = await useEventsRepository().fetchEvents()
      upcomingEvents.value = upcoming
      pastEvents.value = past
      rollOverPastEvents()
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load events'
      useToast().error(error.value)
    } finally {
      loading.value = false
    }
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
  async function addUpcomingEvent(event: Omit<UpcomingEvent, 'id'>): Promise<UpcomingEvent> {
    saving.value = true
    error.value = null
    try {
      const created = await useEventsRepository().createEvent<UpcomingEvent>('upcoming', event)
      upcomingEvents.value.push(created)
      rollOverPastEvents()
      recordAudit({ action: 'event.create', targetId: created.id, targetLabel: created.title })
      useToast().success(`"${created.title || 'Event'}" added`)
      return created
    } catch (e: unknown) {
      fail(e, 'Failed to add event')
    } finally {
      saving.value = false
    }
  }

  async function updateUpcomingEvent(id: string, updates: Partial<Omit<UpcomingEvent, 'id'>>) {
    const idx = upcomingEvents.value.findIndex((e) => e.id === id)
    if (idx === -1) return
    saving.value = true
    error.value = null
    try {
      await useEventsRepository().updateEvent(id, updates)
      const merged = { ...upcomingEvents.value[idx]!, ...updates }
      upcomingEvents.value[idx] = merged
      if (selectedUpcomingEvent.value?.id === id) selectedUpcomingEvent.value = merged
      recordAudit({ action: 'event.update', targetId: id, targetLabel: merged.title })
      useToast().success(`"${merged.title}" updated`)
      rollOverPastEvents()
    } catch (e: unknown) {
      fail(e, 'Failed to update event')
    } finally {
      saving.value = false
    }
  }

  async function deleteUpcomingEvent(id: string) {
    const existing = upcomingEvents.value.find((e) => e.id === id)
    if (!existing) return
    saving.value = true
    error.value = null
    try {
      await useEventsRepository().deleteEvent(id)
      upcomingEvents.value = upcomingEvents.value.filter((e) => e.id !== id)
      if (selectedUpcomingEvent.value?.id === id) selectedUpcomingEvent.value = null
      recordAudit({ action: 'event.delete', targetId: id, targetLabel: existing.title })
      useToast().success(`"${existing.title}" deleted`)
    } catch (e: unknown) {
      fail(e, 'Failed to delete event')
    } finally {
      saving.value = false
    }
  }

  // ── CRUD: Past ────────────────────────────────────────────────────────────
  async function addPastEvent(event: Omit<PastEvent, 'id'>): Promise<PastEvent> {
    saving.value = true
    error.value = null
    try {
      const created = await useEventsRepository().createEvent<PastEvent>('past', event)
      pastEvents.value.push(created)
      recordAudit({ action: 'event.create', targetId: created.id, targetLabel: created.title })
      useToast().success(`"${created.title || 'Event'}" added`)
      return created
    } catch (e: unknown) {
      fail(e, 'Failed to add event')
    } finally {
      saving.value = false
    }
  }

  async function updatePastEvent(id: string, updates: Partial<Omit<PastEvent, 'id'>>) {
    const idx = pastEvents.value.findIndex((e) => e.id === id)
    if (idx === -1) return
    saving.value = true
    error.value = null
    try {
      await useEventsRepository().updateEvent(id, updates)
      pastEvents.value[idx] = { ...pastEvents.value[idx]!, ...updates }
      if (selectedPastEvent.value?.id === id) {
        selectedPastEvent.value = pastEvents.value[idx] ?? null
      }
      recordAudit({
        action: 'event.update',
        targetId: id,
        targetLabel: pastEvents.value[idx]!.title,
      })
      useToast().success(`"${pastEvents.value[idx]!.title}" updated`)
    } catch (e: unknown) {
      fail(e, 'Failed to update event')
    } finally {
      saving.value = false
    }
  }

  async function deletePastEvent(id: string) {
    const existing = pastEvents.value.find((e) => e.id === id)
    if (!existing) return
    saving.value = true
    error.value = null
    try {
      await useEventsRepository().deleteEvent(id)
      pastEvents.value = pastEvents.value.filter((e) => e.id !== id)
      if (selectedPastEvent.value?.id === id) selectedPastEvent.value = null
      recordAudit({ action: 'event.delete', targetId: id, targetLabel: existing.title })
      useToast().success(`"${existing.title}" deleted`)
    } catch (e: unknown) {
      fail(e, 'Failed to delete event')
    } finally {
      saving.value = false
    }
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
    loading,
    saving,
    error,
    loaded,
    load,
    addUpcomingEvent,
    updateUpcomingEvent,
    deleteUpcomingEvent,
    addPastEvent,
    updatePastEvent,
    deletePastEvent,
    thisMonthEvents,
    thisYearEvents,
    thisMonthCount,
    thisYearCount,
  }
})
