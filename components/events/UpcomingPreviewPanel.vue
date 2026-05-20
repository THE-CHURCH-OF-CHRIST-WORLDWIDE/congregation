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
      class="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-8 py-12"
    >
      <!-- Camera / image placeholder icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1"
        stroke="currentColor"
        class="h-16 w-16 text-gray-300"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
        />
      </svg>

      <div class="text-center">
        <p class="font-medium text-gray-500">No Event Selected</p>
        <p class="mt-1 text-sm text-gray-400">Select any of the events to preview gallery here</p>
      </div>
    </div>

    <!-- Sub-state B: selected event with gallery images -->
    <div v-else class="h-full overflow-hidden rounded-xl">
      <ImageSlider :images="selectedEvent!.galleryImages" @expand="onExpand" />
    </div>
  </div>
</template>
