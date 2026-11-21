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
      class="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-rule-strong bg-surface-muted px-8 py-12"
    >
      <!-- Camera / image placeholder icon -->
      <Icon icon="mdi:camera-outline" class="size-14 text-ink-subtle" aria-hidden="true" />

      <div class="text-center">
        <p class="font-display text-lg font-semibold text-ink">No Event Selected</p>
        <p class="mt-1 max-w-xs text-base leading-relaxed text-ink-muted">
          Select any of the events to preview gallery here
        </p>
      </div>
    </div>

    <!-- Sub-state B: selected event with gallery images -->
    <div v-else class="h-full overflow-hidden rounded-lg border border-rule shadow-xs">
      <ImageSlider :images="selectedEvent!.galleryImages" @expand="onExpand" />
    </div>
  </div>
</template>
