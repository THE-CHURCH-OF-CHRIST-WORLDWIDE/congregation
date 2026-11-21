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
  <div class="ruled flex h-full flex-col overflow-y-auto border-y border-rule">
    <div
      v-for="event in events"
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
      <div class="flex items-start gap-4">
        <!-- Date column: the register's entry date -->
        <div class="w-12 shrink-0 pt-0.5 text-center" aria-hidden="true">
          <span
            :class="[
              'num block font-display text-3xl leading-none font-semibold',
              isSelected(event) ? 'text-primary-ink' : 'text-ink',
            ]"
            >{{ formatDate(event.date, 'dayMonth').split(' ')[0] }}</span
          >
          <span class="stamp mt-1.5 block">{{
            formatDate(event.date, 'dayMonth').split(' ')[1]
          }}</span>
        </div>

        <div class="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
          <!-- Info -->
          <div class="min-w-0 flex-1">
            <p
              :class="[
                'font-display text-lg leading-snug font-semibold',
                isSelected(event) ? 'text-primary-ink' : 'text-ink',
              ]"
            >
              {{ event.title }}
            </p>

            <!-- Metadata row -->
            <div class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              <span class="num flex items-center gap-1.5">
                <Icon
                  icon="mdi:calendar-outline"
                  class="size-4 shrink-0 text-ink-subtle"
                  aria-hidden="true"
                />
                {{ event.date }}
              </span>
              <span class="num flex items-center gap-1.5">
                <Icon
                  icon="mdi:clock-outline"
                  class="size-4 shrink-0 text-ink-subtle"
                  aria-hidden="true"
                />
                {{ event.time }}
              </span>
              <span class="flex items-center gap-1.5">
                <Icon
                  icon="mdi:map-marker-outline"
                  class="size-4 shrink-0 text-ink-subtle"
                  aria-hidden="true"
                />
                {{ event.venue }}
              </span>
            </div>
          </div>

          <!-- Right: View Gallery link -->
          <button
            v-if="event.galleryImages.length > 0"
            class="-mx-2.5 inline-flex min-h-11 shrink-0 items-center self-start sm:-my-1 sm:mx-0 gap-1.5 rounded-md px-2.5 text-sm font-semibold text-primary-ink transition-colors duration-150 hover:bg-primary-soft hover:text-primary-hover"
            @click.stop="viewGallery(event)"
          >
            <Icon icon="mdi:image-multiple-outline" class="size-4" aria-hidden="true" />
            View Gallery
          </button>
        </div>
      </div>
    </div>

    <EmptyState
      v-if="events.length === 0"
      icon="mdi:calendar-blank-outline"
      title="No upcoming events"
      description="Check back soon — new gatherings are announced here."
    />
  </div>
</template>
