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
  <div class="flex h-full flex-col gap-8">
    <!-- Sub-tabs -->
    <PastEventMonthYearTabs v-model="subTab" :month-count="monthCount" :year-count="yearCount" />

    <!-- The archive -->
    <div class="flex flex-col border-t border-ink/80">
      <!-- Empty state -->
      <div v-if="displayedEvents.length === 0" class="border-b border-rule-strong">
        <EmptyState
          icon="mdi:calendar-remove-outline"
          :title="subTab === 'year' ? 'No events this year' : 'No events this month'"
          description="Past gatherings appear here once their date has passed."
        />
      </div>

      <!-- Event rows -->
      <div
        v-for="(event, i) in displayedEvents"
        :key="event.id"
        v-reveal="{ delay: 60 + Math.min(i, 6) * 80 }"
        :class="[
          'group cursor-pointer border-b border-rule-strong px-2 py-6 transition-colors duration-500 focus-visible:-outline-offset-2 sm:px-4 md:py-7',
          isSelected(event) ? 'bg-surface-muted' : 'hover:bg-surface-muted/60',
        ]"
        role="button"
        tabindex="0"
        :aria-pressed="isSelected(event)"
        @click="selectEvent(event)"
        @keydown.enter="selectEvent(event)"
      >
        <div
          class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-x-7"
        >
          <!-- Thumbnail -->
          <div class="img-zoom aspect-[4/3] w-full overflow-hidden bg-surface-sunken">
            <img
              v-if="event.thumbnail"
              :src="displayableImageUrl(event.thumbnail)"
              :alt="event.title"
              class="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div
              v-else
              class="flex h-full w-full items-end bg-primary p-2.5 font-display text-[2.5rem] leading-none text-on-night/30 italic"
              aria-hidden="true"
            >
              {{ event.title.charAt(0) }}
            </div>
          </div>

          <!-- Details -->
          <div class="min-w-0">
            <!-- Category -->
            <span
              :class="[
                't-label inline-block rounded-sm px-1.5 py-0.5',
                categoryClass(event.category),
              ]"
            >
              {{ event.category }}
            </span>

            <!-- Title -->
            <p
              :class="[
                'mt-2.5 font-display text-[1.5rem] leading-[1.1] transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 md:text-[1.875rem]',
                isSelected(event) ? 'text-primary-ink' : 'text-ink',
              ]"
            >
              {{ event.title }}
            </p>

            <!-- Metadata -->
            <div class="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-muted">
              <span class="num flex items-center gap-1.5">
                <Icon
                  icon="mdi:calendar-outline"
                  class="size-3.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                {{ event.date }}
              </span>
              <span class="num flex items-center gap-1.5">
                <Icon
                  icon="mdi:clock-outline"
                  class="size-3.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                {{ event.time }}
              </span>
              <span class="flex items-center gap-1.5">
                <Icon
                  icon="mdi:map-marker-outline"
                  class="size-3.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                {{ event.venue }}
              </span>
            </div>

            <!-- Plan to attend button -->
            <button
              class="btn btn-outline mt-5 min-h-11 w-full px-5 text-sm sm:w-auto"
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
