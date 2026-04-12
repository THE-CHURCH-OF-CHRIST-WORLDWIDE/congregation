<script setup lang="ts">
const emit = defineEmits<{
  'watch-recorded': []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-[#F8F9FA] px-6 py-20 text-center">
    <!-- Play icon (outlined) -->
    <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-gray-300">
      <svg class="ml-2 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    </div>

    <h3 class="font-serif text-2xl font-bold text-[#1E3A5F] mb-3">
      The last live stream has ended
    </h3>
    <p class="text-gray-500 max-w-md mb-8 leading-relaxed">
      Our live worship service has concluded. Join us next Sunday for our next service or browse our recorded streams and sermons below.
    </p>

    <div class="flex flex-col gap-3 sm:flex-row">
      <button
        class="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        aria-label="Watch recorded videos"
        @click="emit('watch-recorded')"
      >
        <Icon icon="heroicons:play-circle" class="h-5 w-5" />
        Watch Recorded Videos
      </button>
      <NuxtLink
        to="/teachings/sermons"
        class="inline-flex items-center gap-2 rounded-full border border-[#2563EB] px-6 py-3 text-sm font-semibold text-[#2563EB] hover:bg-blue-50 transition-colors"
        aria-label="Browse sermons"
      >
        <Icon icon="heroicons:book-open" class="h-5 w-5" />
        Browse Sermons Instead
      </NuxtLink>
    </div>
  </div>
</template>
