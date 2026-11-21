<script setup lang="ts">
import type { LiveStream } from '~/types/public'

defineProps<{ stream: LiveStream }>()
</script>

<template>
  <div
    class="relative flex min-h-80 w-full items-end overflow-hidden rounded-lg bg-secondary shadow-xs md:min-h-[26rem]"
  >
    <img
      :src="displayableImageUrl(stream.thumbnailSrc)"
      :alt="stream.title"
      class="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
    />
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15"
      aria-hidden="true"
    ></div>

    <!-- The locked corner: the one live signal on the page -->
    <div
      class="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-sm bg-live px-2.5 py-1 shadow-md"
    >
      <span class="pulse-ring live-dot relative size-2 rounded-full bg-white"></span>
      <span class="text-xs font-bold tracking-[0.1em] text-white uppercase">Live Now</span>
    </div>

    <div
      class="relative z-10 flex w-full flex-col items-start px-6 pt-20 pb-7 text-white md:px-10 md:pb-10"
    >
      <h2 class="max-w-2xl font-display text-3xl leading-tight font-bold md:text-4xl">
        {{ stream.title }}
      </h2>
      <p class="mt-2 text-base text-white/85">{{ stream.congregation }}</p>
      <div class="mt-2 mb-7 flex items-center gap-2">
        <Icon icon="mdi:eye-outline" class="size-4 text-white/70" aria-hidden="true" />
        <span class="num text-sm text-white/75"
          >{{ stream.viewerCount.toLocaleString() }} watching</span
        >
      </div>

      <a
        href="#"
        target="_blank"
        rel="noopener"
        class="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-on-primary shadow-xs transition-colors duration-150 hover:bg-primary-hover"
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
