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
  <div class="flex h-full flex-col border-t border-ink/80">
    <div
      v-for="(event, i) in events"
      :key="event.id"
      v-reveal="{ delay: 60 + Math.min(i, 6) * 80 }"
      :class="[
        'group cursor-pointer border-b border-rule-strong py-7 transition-colors duration-500 focus-visible:-outline-offset-2 md:py-9',
        isSelected(event) ? 'bg-surface-muted' : 'hover:bg-surface-muted/60',
      ]"
      role="button"
      tabindex="0"
      :aria-pressed="isSelected(event)"
      @click="selectEvent(event)"
      @keydown.enter="selectEvent(event)"
    >
      <div
        class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-5 gap-y-4 px-2 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:gap-x-8 sm:px-4"
      >
        <!-- Date column: the numeral set large, the month stamped beneath -->
        <div class="flex flex-col" aria-hidden="true">
          <span
            :class="[
              'num font-display text-[3.25rem] leading-[0.85] transition-colors duration-500 sm:text-[4.5rem]',
              isSelected(event) ? 'text-accent' : 'text-ink',
            ]"
            >{{ formatDate(event.date, 'dayMonth').split(' ')[0] }}</span
          >
          <span class="stamp mt-2 block">{{
            formatDate(event.date, 'dayMonth').split(' ')[1]
          }}</span>
        </div>

        <!-- Info -->
        <div class="min-w-0">
          <p
            :class="[
              'font-display text-[1.625rem] leading-[1.1] transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5 md:text-[2.125rem]',
              isSelected(event) ? 'text-primary-ink' : 'text-ink',
            ]"
          >
            {{ event.title }}
          </p>

          <!-- Metadata row -->
          <div
            class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[0.9375rem] text-ink-muted"
          >
            <span class="num flex items-center gap-1.5">
              <Icon
                icon="mdi:calendar-outline"
                class="size-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              {{ event.date }}
            </span>
            <span class="num flex items-center gap-1.5">
              <Icon
                icon="mdi:clock-outline"
                class="size-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              {{ event.time }}
            </span>
            <span class="flex items-center gap-1.5">
              <Icon
                icon="mdi:map-marker-outline"
                class="size-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              {{ event.venue }}
            </span>
          </div>
        </div>

        <!-- Right: View Gallery link -->
        <button
          v-if="event.galleryImages.length > 0"
          class="link-line col-start-2 self-start text-sm text-ink sm:col-start-3 sm:-mt-2"
          @click.stop="viewGallery(event)"
        >
          <Icon icon="mdi:image-multiple-outline" class="size-4 text-accent" aria-hidden="true" />
          <span class="link-text">View Gallery</span>
        </button>
      </div>
    </div>

    <div v-if="events.length === 0" class="border-b border-rule-strong">
      <EmptyState
        icon="mdi:calendar-blank-outline"
        title="No upcoming events"
        description="Check back soon — new gatherings are announced here."
      />
    </div>
  </div>
</template>
