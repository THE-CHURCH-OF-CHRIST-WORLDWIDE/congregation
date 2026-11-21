<script setup lang="ts">
const eventsStore = useEventsStore()
const event = computed(() => eventsStore.selectedPastEvent)
</script>

<template>
  <div class="h-full">
    <!-- Placeholder when nothing selected -->
    <div
      v-if="!event"
      v-reveal="'unveil'"
      class="field-forest flex aspect-[4/5] w-full flex-col justify-end p-7 sm:p-10"
    >
      <p class="font-display text-[2rem] leading-[1.05] text-on-night sm:text-[2.5rem]">
        No event selected
      </p>
    </div>

    <!-- Featured: the photograph set large, its caption on the floor of the frame -->
    <div
      v-else
      v-reveal="'unveil'"
      class="field-night relative flex aspect-[2/3] w-full overflow-hidden sm:aspect-[4/5]"
    >
      <!-- Background image -->
      <img
        v-if="event.featuredImage"
        :key="event.id"
        :src="displayableImageUrl(event.featuredImage)"
        :alt="event.title"
        class="featured-img absolute inset-0 h-full w-full object-cover"
        decoding="async"
      />
      <div
        v-else
        class="absolute inset-0 flex items-start justify-end bg-primary p-8 font-display text-[10rem] leading-none text-on-night/20 italic"
        aria-hidden="true"
      >
        {{ event.title.charAt(0) }}
      </div>

      <!-- Scrim: strong at the floor, so the caption stays legible on any photo -->
      <div class="absolute inset-0 bg-linear-to-t from-night/90 via-night/50 to-night/5"></div>

      <!-- Caption pinned to the floor -->
      <div class="relative mt-auto w-full p-6 md:p-9">
        <!-- Category -->
        <span class="t-label text-champagne">
          {{ event.category }}
        </span>

        <!-- Title -->
        <h2 class="t-h2 mt-3 text-on-night">
          {{ event.title }}
        </h2>

        <!-- Metadata -->
        <div
          class="mt-5 mb-7 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[0.9375rem] text-on-night-muted"
        >
          <span class="num flex items-center gap-1.5">
            <Icon
              icon="mdi:calendar-outline"
              class="size-4 shrink-0 text-champagne"
              aria-hidden="true"
            />
            {{ event.date }}
          </span>
          <span class="num flex items-center gap-1.5">
            <Icon
              icon="mdi:clock-outline"
              class="size-4 shrink-0 text-champagne"
              aria-hidden="true"
            />
            {{ event.time }}
          </span>
          <span class="flex items-center gap-1.5">
            <Icon
              icon="mdi:map-marker-outline"
              class="size-4 shrink-0 text-champagne"
              aria-hidden="true"
            />
            {{ event.venue }}
          </span>
        </div>

        <!-- Speakers -->
        <div class="border-t border-on-night/20 pt-5">
          <SpeakerAvatars :moderator="event.moderator" :speakers="event.speakers" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* A new selection settles into the frame */
.featured-img {
  animation: featured-settle 1.4s var(--ease-out-expo) both;
}
@keyframes featured-settle {
  from {
    opacity: 0;
    transform: scale(1.06);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .featured-img {
    animation: none;
  }
}
</style>
