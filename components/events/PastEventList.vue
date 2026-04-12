<script setup lang="ts">
import type { PastEvent } from '~/types/events'

const eventsStore = useEventsStore()

const subTab = computed({
  get: () => eventsStore.pastSubTab,
  set: (v: 'month' | 'year') => eventsStore.setPastSubTab(v),
})

const monthCount = computed(() => eventsStore.thisMonthCount)
const yearCount = computed(() => eventsStore.thisYearCount)

const displayedEvents = computed(() =>
  subTab.value === 'month' ? eventsStore.thisMonthEvents : eventsStore.thisYearEvents
)

const selected = computed(() => eventsStore.selectedPastEvent)

function selectEvent(event: PastEvent) {
  eventsStore.selectPastEvent(event)
}

function isSelected(event: PastEvent) {
  return selected.value?.id === event.id
}

function planToAttend(event: PastEvent) {
  // Stub — shows browser alert
  alert(`You have indicated you plan to attend: "${event.title}"`)
}

// Category badge colour map
const categoryColour: Record<string, string> = {
  'Bible Study': 'bg-blue-100 text-blue-700',
  'Gospel Meeting': 'bg-green-100 text-green-700',
  "Women's Seminar": 'bg-pink-100 text-pink-700',
}

function categoryClass(cat: string): string {
  return categoryColour[cat] ?? 'bg-gray-100 text-gray-600'
}
</script>

<template>
  <div class="flex h-full flex-col gap-4">
    <!-- Sub-tabs -->
    <PastEventMonthYearTabs
      v-model="subTab"
      :month-count="monthCount"
      :year-count="yearCount"
    />

    <!-- Event list -->
    <div class="flex flex-col gap-3 overflow-y-auto pr-1">
      <!-- Empty state -->
      <div
        v-if="displayedEvents.length === 0"
        class="flex flex-col items-center justify-center py-16 text-gray-400"
      >
        <Icon icon="mdi:calendar-remove-outline" class="mb-3 h-12 w-12 text-gray-300" />
        <p class="text-sm font-medium text-gray-400">
          {{ subTab === 'year' ? 'No events this year' : 'No events this month' }}
        </p>
      </div>

      <!-- Event rows -->
      <div
        v-for="event in displayedEvents"
        :key="event.id"
        :class="[
          'cursor-pointer rounded-lg border px-3 py-3 transition-colors',
          isSelected(event)
            ? 'border-blue-200 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-blue-100 hover:bg-blue-50/40',
        ]"
        role="button"
        tabindex="0"
        @click="selectEvent(event)"
        @keydown.enter="selectEvent(event)"
      >
        <div class="flex gap-3">
          <!-- Thumbnail -->
          <img
            :src="event.thumbnail"
            :alt="event.title"
            class="h-[60px] w-20 flex-shrink-0 rounded-md object-cover"
          />

          <!-- Details -->
          <div class="min-w-0 flex-1">
            <!-- Category -->
            <span
              :class="['mb-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', categoryClass(event.category)]"
            >
              {{ event.category }}
            </span>

            <!-- Title -->
            <p class="truncate text-[14px] font-medium leading-snug text-gray-900">
              {{ event.title }}
            </p>

            <!-- Metadata -->
            <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <Icon icon="mdi:calendar-outline" class="h-3 w-3 text-gray-400" />
                {{ event.date }}
              </span>
              <span class="flex items-center gap-1">
                <Icon icon="mdi:clock-outline" class="h-3 w-3 text-gray-400" />
                {{ event.time }}
              </span>
              <span class="flex items-center gap-1">
                <Icon icon="mdi:map-marker-outline" class="h-3 w-3 text-gray-400" />
                {{ event.venue }}
              </span>
            </div>

            <!-- Plan to attend button -->
            <button
              class="mt-2 w-full rounded-md border border-blue-500 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
              @click.stop="planToAttend(event)"
            >
              Plan to attend
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
