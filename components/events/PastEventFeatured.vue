<script setup lang="ts">
const eventsStore = useEventsStore()
const event = computed(() => eventsStore.selectedPastEvent)
</script>

<template>
  <div class="h-full">
    <!-- Placeholder when nothing selected -->
    <div
      v-if="!event"
      class="flex h-full min-h-[500px] items-center justify-center rounded-lg border border-dashed border-rule-strong bg-surface-muted"
    >
      <p class="text-base text-ink-muted">No event selected</p>
    </div>

    <!-- Featured card -->
    <div
      v-else
      class="relative flex h-full min-h-[500px] overflow-hidden rounded-lg bg-gray-950 shadow-xs md:min-h-[560px]"
    >
      <!-- Background image -->
      <img
        :src="displayableImageUrl(event.featuredImage)"
        :alt="event.title"
        class="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        decoding="async"
      />

      <!-- Scrim: strong at bottom, fades up, so the caption stays legible on any photo -->
      <div class="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent"></div>

      <!-- Content pinned to bottom-left -->
      <div class="relative mt-auto w-full p-5 md:p-8">
        <!-- Category badge -->
        <span
          class="mb-3 inline-block rounded-sm bg-primary px-2 py-1 text-xs font-semibold tracking-wide text-white uppercase"
        >
          {{ event.category }}
        </span>

        <!-- Title -->
        <h2 class="mb-3 font-display text-2xl leading-tight font-bold text-white md:text-[2rem]">
          {{ event.title }}
        </h2>

        <!-- Metadata -->
        <div class="mb-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-base text-white/85">
          <span class="num flex items-center gap-1.5">
            <Icon icon="mdi:calendar-outline" class="size-4 shrink-0" aria-hidden="true" />
            {{ event.date }}
          </span>
          <span class="num flex items-center gap-1.5">
            <Icon icon="mdi:clock-outline" class="size-4 shrink-0" aria-hidden="true" />
            {{ event.time }}
          </span>
          <span class="flex items-center gap-1.5">
            <Icon icon="mdi:map-marker-outline" class="size-4 shrink-0" aria-hidden="true" />
            {{ event.venue }}
          </span>
        </div>

        <!-- Speakers -->
        <div class="border-t border-white/20 pt-4">
          <SpeakerAvatars :moderator="event.moderator" :speakers="event.speakers" />
        </div>
      </div>
    </div>
  </div>
</template>
