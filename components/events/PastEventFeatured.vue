<script setup lang="ts">
const eventsStore = useEventsStore()
const event = computed(() => eventsStore.selectedPastEvent)
</script>

<template>
  <div class="h-full">
    <!-- Placeholder when nothing selected -->
    <div
      v-if="!event"
      class="flex h-full min-h-[500px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50"
    >
      <p class="text-sm text-gray-400">No event selected</p>
    </div>

    <!-- Featured card -->
    <div
      v-else
      class="relative flex h-full min-h-[500px] overflow-hidden rounded-xl md:min-h-[560px]"
    >
      <!-- Background image -->
      <img
        :src="event.featuredImage"
        :alt="event.title"
        class="absolute inset-0 h-full w-full object-cover transition-all duration-500"
      />

      <!-- Gradient overlay: strong at bottom, fades up -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" ></div>

      <!-- Content pinned to bottom-left -->
      <div class="relative mt-auto w-full p-5 md:p-7">
        <!-- Category badge -->
        <span class="mb-3 inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          {{ event.category }}
        </span>

        <!-- Title -->
        <h2 class="mb-3 font-['Playfair_Display'] text-2xl font-bold leading-snug text-white md:text-3xl">
          {{ event.title }}
        </h2>

        <!-- Metadata -->
        <div class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/80">
          <span class="flex items-center gap-1.5">
            <Icon icon="mdi:calendar-outline" class="h-4 w-4 flex-shrink-0" />
            {{ event.date }}
          </span>
          <span class="flex items-center gap-1.5">
            <Icon icon="mdi:clock-outline" class="h-4 w-4 flex-shrink-0" />
            {{ event.time }}
          </span>
          <span class="flex items-center gap-1.5">
            <Icon icon="mdi:map-marker-outline" class="h-4 w-4 flex-shrink-0" />
            {{ event.venue }}
          </span>
        </div>

        <!-- Speakers -->
        <SpeakerAvatars :moderator="event.moderator" :speakers="event.speakers" />
      </div>
    </div>
  </div>
</template>
