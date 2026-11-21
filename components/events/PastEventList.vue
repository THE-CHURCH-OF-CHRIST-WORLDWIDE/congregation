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
  'Bible Study': 'bg-info-soft text-info',
  'Gospel Meeting': 'bg-success-soft text-success',
  "Women's Seminar": 'bg-accent-soft text-accent',
}

function categoryClass(cat: string): string {
  return categoryColour[cat] ?? 'bg-surface-sunken text-ink-muted'
}
</script>

<template>
  <div class="flex h-full flex-col gap-4">
    <!-- Sub-tabs -->
    <PastEventMonthYearTabs v-model="subTab" :month-count="monthCount" :year-count="yearCount" />

    <!-- Event list -->
    <div class="ruled flex flex-col overflow-y-auto border-y border-rule">
      <!-- Empty state -->
      <EmptyState
        v-if="displayedEvents.length === 0"
        icon="mdi:calendar-remove-outline"
        :title="subTab === 'year' ? 'No events this year' : 'No events this month'"
        description="Past gatherings appear here once their date has passed."
      />

      <!-- Event rows -->
      <div
        v-for="event in displayedEvents"
        :key="event.id"
        :class="[
          'cursor-pointer px-3 py-4 transition-colors duration-150 focus-visible:-outline-offset-2 sm:px-4',
          isSelected(event) ? 'bg-primary-soft' : 'bg-surface hover:bg-surface-muted',
        ]"
        role="button"
        tabindex="0"
        :aria-pressed="isSelected(event)"
        @click="selectEvent(event)"
        @keydown.enter="selectEvent(event)"
      >
        <div class="flex gap-4">
          <!-- Thumbnail -->
          <img
            :src="displayableImageUrl(event.thumbnail)"
            :alt="event.title"
            class="h-16 w-24 shrink-0 rounded-md bg-surface-sunken object-cover"
            loading="lazy"
            decoding="async"
          />

          <!-- Details -->
          <div class="min-w-0 flex-1">
            <!-- Category -->
            <span
              :class="[
                'mb-1.5 inline-block rounded-sm px-2 py-0.5 text-xs font-semibold',
                categoryClass(event.category),
              ]"
            >
              {{ event.category }}
            </span>

            <!-- Title -->
            <p
              :class="[
                'truncate font-display text-base leading-snug font-semibold',
                isSelected(event) ? 'text-primary-ink' : 'text-ink',
              ]"
            >
              {{ event.title }}
            </p>

            <!-- Metadata -->
            <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              <span class="num flex items-center gap-1.5">
                <Icon
                  icon="mdi:calendar-outline"
                  class="size-3.5 shrink-0 text-ink-subtle"
                  aria-hidden="true"
                />
                {{ event.date }}
              </span>
              <span class="num flex items-center gap-1.5">
                <Icon
                  icon="mdi:clock-outline"
                  class="size-3.5 shrink-0 text-ink-subtle"
                  aria-hidden="true"
                />
                {{ event.time }}
              </span>
              <span class="flex items-center gap-1.5">
                <Icon
                  icon="mdi:map-marker-outline"
                  class="size-3.5 shrink-0 text-ink-subtle"
                  aria-hidden="true"
                />
                {{ event.venue }}
              </span>
            </div>

            <!-- Plan to attend button -->
            <button
              class="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-rule-strong bg-surface px-4 text-sm font-semibold text-primary-ink shadow-xs transition-colors duration-150 hover:border-ink-subtle hover:bg-surface-muted sm:min-h-10 sm:w-auto"
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
