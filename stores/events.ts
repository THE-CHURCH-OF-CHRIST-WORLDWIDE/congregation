import { defineStore } from 'pinia'
import { useEventsRepository } from '~/repositories/eventsRepository'
import { recordAudit } from '~/utils/audit'
import type { UpcomingEvent, PastEvent } from '~/types/events'

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
      upcomingEvents.value[idx] = { ...upcomingEvents.value[idx]!, ...updates }
      if (selectedUpcomingEvent.value?.id === id) {
        selectedUpcomingEvent.value = upcomingEvents.value[idx] ?? null
      }
      recordAudit({
        action: 'event.update',
        targetId: id,
        targetLabel: upcomingEvents.value[idx]!.title,
      })
      useToast().success(`"${upcomingEvents.value[idx]!.title}" updated`)
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
