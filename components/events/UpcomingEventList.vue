<script setup lang="ts">
import type { UpcomingEvent } from '~/types/events'

const eventsStore = useEventsStore()

const events = computed(() => eventsStore.upcomingEvents)
const selected = computed(() => eventsStore.selectedUpcomingEvent)

function selectEvent(event: UpcomingEvent) {
  eventsStore.selectUpcomingEvent(event)
}

function viewGallery(event: UpcomingEvent) {
  eventsStore.selectUpcomingEvent(event)
  if (event.galleryImages.length > 0) {
    eventsStore.openGallery(event.galleryImages, 0)
  }
}

function isSelected(event: UpcomingEvent) {
  return selected.value?.id === event.id
}
</script>

<template>
  <div class="flex h-full flex-col gap-3 overflow-y-auto pr-1">
    <div
      v-for="event in events"
      :key="event.id"
      :class="[
        'cursor-pointer rounded-lg border px-4 py-3.5 transition-colors',
        isSelected(event)
          ? 'border-blue-200 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-blue-100 hover:bg-blue-50/40',
      ]"
      role="button"
      tabindex="0"
      @click="selectEvent(event)"
      @keydown.enter="selectEvent(event)"
    >
      <div class="flex items-start justify-between gap-3">
        <!-- Left: info -->
        <div class="min-w-0 flex-1">
          <p class="truncate text-[15px] font-medium text-gray-900">{{ event.title }}</p>

          <!-- Metadata row -->
          <div class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span class="flex items-center gap-1">
              <Icon icon="mdi:calendar-outline" class="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              {{ event.date }}
            </span>
            <span class="flex items-center gap-1">
              <Icon icon="mdi:clock-outline" class="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              {{ event.time }}
            </span>
            <span class="flex items-center gap-1">
              <Icon icon="mdi:map-marker-outline" class="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              {{ event.venue }}
            </span>
          </div>
        </div>

        <!-- Right: View Gallery link -->
        <button
          v-if="event.galleryImages.length > 0"
          class="flex-shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
          @click.stop="viewGallery(event)"
        >
          View Gallery
        </button>
      </div>
    </div>

    <div
      v-if="events.length === 0"
      class="flex flex-col items-center justify-center py-16 text-gray-400"
    >
      <Icon icon="mdi:calendar-blank-outline" class="mb-2 h-10 w-10" />
      <p class="text-sm">No upcoming events</p>
    </div>
  </div>
</template>
