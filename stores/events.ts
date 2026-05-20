import { defineStore } from 'pinia'
import type { UpcomingEvent, PastEvent } from '~/types/events'

export const useEventsStore = defineStore('events', () => {
  const activeTab = ref<'upcoming' | 'past'>('upcoming')
  const upcomingEvents = ref<UpcomingEvent[]>([])
  const pastEvents = ref<PastEvent[]>([])
  const selectedUpcomingEvent = ref<UpcomingEvent | null>(null)
  const selectedPastEvent = ref<PastEvent | null>(null)
  const pastSubTab = ref<'month' | 'year'>('month')
  const galleryOpen = ref(false)
  const galleryImages = ref<string[]>([])
  const galleryStartIndex = ref(0)

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
    thisMonthEvents,
    thisYearEvents,
    thisMonthCount,
    thisYearCount,
  }
})
