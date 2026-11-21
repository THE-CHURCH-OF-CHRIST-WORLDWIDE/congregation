<script setup lang="ts">
import type { LiveStream } from '~/types/public'

defineProps<{ stream: LiveStream }>()
</script>

<template>
  <!-- The screen: the live picture set full-width like a projection -->
  <div
    class="relative flex aspect-[4/5] w-full items-end overflow-hidden bg-night-raised sm:aspect-video"
  >
    <img
      v-if="stream.thumbnailSrc"
      :src="displayableImageUrl(stream.thumbnailSrc)"
      :alt="stream.title"
      class="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
    />
    <div class="absolute inset-0 bg-night/30" aria-hidden="true"></div>
    <div
      class="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-night via-night/60 to-transparent"
      aria-hidden="true"
    ></div>

    <!-- The locked corner: the one live signal on the page -->
    <div
      class="t-label absolute top-5 left-5 z-20 flex items-center gap-2 bg-live px-3 py-1.5 text-white sm:top-7 sm:left-7"
    >
      <span class="pulse-ring live-dot relative size-2 rounded-full bg-white"></span>
      <span>Live Now</span>
    </div>
    <div
      v-if="stream.viewerCount > 0"
      class="t-label absolute top-5 right-5 z-20 flex items-center gap-2 text-on-night sm:top-7 sm:right-7"
    >
      <Icon icon="mdi:eye-outline" class="size-4" aria-hidden="true" />
      <span class="num">{{ stream.viewerCount.toLocaleString() }} watching</span>
    </div>

    <div
      class="relative z-10 flex w-full flex-col items-start gap-6 px-6 pt-24 pb-7 text-on-night sm:px-10 sm:pb-10 md:flex-row md:items-end md:justify-between"
    >
      <div class="min-w-0">
        <h2 class="t-h2 max-w-2xl text-on-night">{{ stream.title }}</h2>
        <p class="mt-3 text-base text-on-night-muted">{{ stream.congregation }}</p>
      </div>

      <a
        :href="stream.url || '#'"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-light min-h-14 shrink-0 px-7"
        aria-label="Watch live stream now"
      >
        <Icon icon="mdi:play" class="size-5" aria-hidden="true" />
        Watch Live Now
      </a>
    </div>
  </div>
</template>

<style scoped>
/* On the red indicator the ripple is white, so it stays visible against bg-live. */
.pulse-ring.live-dot::before,
.pulse-ring.live-dot::after {
  background: rgb(255 255 255 / 0.85);
}
</style>
