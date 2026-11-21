<script setup lang="ts">
const emit = defineEmits<{
  'watch-recorded': []
}>()
</script>

<template>
  <!-- An off-air screen: the frame stays, the picture is dark -->
  <div
    class="relative flex w-full flex-col items-center justify-center overflow-hidden border border-on-night/15 bg-night-raised px-6 pt-20 pb-14 text-center sm:aspect-video sm:py-12"
  >
    <div
      class="t-label absolute top-5 left-5 inline-flex items-center gap-2 text-on-night-muted sm:top-7 sm:left-7"
    >
      <span class="size-1.5 rounded-full bg-on-night-muted" aria-hidden="true"></span>
      Off air
    </div>

    <!-- Play icon (outlined) -->
    <div
      class="mb-8 flex size-20 items-center justify-center rounded-full border border-on-night/30 text-on-night-muted sm:size-24"
      aria-hidden="true"
    >
      <svg
        class="ml-1.5 size-8"
        fill="none"
        stroke="currentColor"
        stroke-width="1.25"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
        />
      </svg>
    </div>

    <h3 class="t-h2 max-w-xl text-on-night">
      The last live stream <span class="t-turn text-champagne">has ended</span>
    </h3>
    <p class="mt-5 max-w-md text-base leading-relaxed text-on-night-muted sm:text-lg">
      Our live worship service has concluded. Join us next Sunday for our next service or browse our
      recorded streams and sermons below.
    </p>

    <div class="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:gap-8">
      <button
        class="btn btn-light min-h-14 w-full px-7 sm:w-auto"
        aria-label="Watch recorded videos"
        @click="emit('watch-recorded')"
      >
        <Icon icon="mdi:play-circle-outline" class="size-5" aria-hidden="true" />
        Watch Recorded Videos
      </button>
      <NuxtLink
        to="/teachings/sermons"
        class="link-line text-base text-on-night"
        aria-label="Browse sermons"
      >
        <span class="link-text">Browse Sermons Instead</span>
        <Icon icon="mdi:arrow-right" class="link-arrow size-4" aria-hidden="true" />
      </NuxtLink>
    </div>
  </div>
</template>
