<script setup lang="ts">
const eventsStore = useEventsStore()

const selectedEvent = computed(() => eventsStore.selectedUpcomingEvent)
const hasGallery = computed(
  () => !!selectedEvent.value && selectedEvent.value.galleryImages.length > 0
)

function onExpand(index: number) {
  if (selectedEvent.value?.galleryImages.length) {
    eventsStore.openGallery(selectedEvent.value.galleryImages, index)
  }
}
</script>

<template>
  <div class="h-full">
    <!-- Sub-state A: no event selected OR selected event has no gallery -->
    <div
      v-if="!hasGallery"
      v-reveal="'unveil'"
      class="field-forest relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden p-7 sm:p-10"
    >
      <Icon icon="mdi:camera-outline" class="size-8 text-champagne" aria-hidden="true" />

      <div class="relative">
        <p class="font-display text-[2rem] leading-[1.05] text-on-night sm:text-[2.5rem]">
          No Event Selected
        </p>
        <p class="mt-3 max-w-xs text-base leading-relaxed text-on-night-muted">
          Select any of the events to preview gallery here
        </p>
      </div>
    </div>

    <!-- Sub-state B: selected event with gallery images -->
    <div v-else v-reveal="'unveil'" class="h-full overflow-hidden">
      <ImageSlider :images="selectedEvent!.galleryImages" @expand="onExpand" />
      <p v-if="selectedEvent" class="mt-4 flex items-baseline justify-between gap-4">
        <span class="font-display text-[1.375rem] leading-tight text-ink">{{
          selectedEvent.title
        }}</span>
        <span class="num t-label shrink-0 text-ink-subtle">{{ selectedEvent.date }}</span>
      </p>
    </div>
  </div>
</template>
