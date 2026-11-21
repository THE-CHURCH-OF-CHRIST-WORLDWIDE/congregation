<script setup lang="ts">
const emit = defineEmits<{
  'watch-recorded': []
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-lg border border-rule bg-surface-muted px-6 py-16 text-center md:py-20"
  >
    <!-- Play icon (outlined) -->
    <div
      class="mb-6 flex size-20 items-center justify-center rounded-full border border-dashed border-rule-strong bg-surface"
    >
      <svg
        class="ml-1.5 size-9 text-ink-subtle"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
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

    <h3 class="mb-3 font-display text-2xl font-bold text-secondary">
      The last live stream has ended
    </h3>
    <p class="mb-8 max-w-md text-base leading-relaxed text-ink-muted">
      Our live worship service has concluded. Join us next Sunday for our next service or browse our
      recorded streams and sermons below.
    </p>

    <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <button
        class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-on-primary shadow-xs transition-colors duration-150 hover:bg-primary-hover"
        aria-label="Watch recorded videos"
        @click="emit('watch-recorded')"
      >
        <Icon icon="mdi:play-circle-outline" class="size-5" aria-hidden="true" />
        Watch Recorded Videos
      </button>
      <NuxtLink
        to="/teachings/sermons"
        class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-rule-strong bg-surface px-5 text-sm font-semibold text-ink shadow-xs transition-colors duration-150 hover:border-ink-subtle hover:bg-surface-muted"
        aria-label="Browse sermons"
      >
        <Icon icon="mdi:book-open-page-variant-outline" class="size-5" aria-hidden="true" />
        Browse Sermons Instead
      </NuxtLink>
    </div>
  </div>
</template>
