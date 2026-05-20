<script setup lang="ts">
import type { LiveStream } from '~/types/public'

defineProps<{ stream: LiveStream }>()
</script>

<template>
  <div
    class="relative w-full overflow-hidden rounded-2xl bg-[#1E3A5F] min-h-80 flex items-center justify-center"
    style="background-image: linear-gradient(rgba(30, 58, 95, 0.85), rgba(30, 58, 95, 0.95))"
  >
    <img
      :src="stream.thumbnailSrc"
      :alt="stream.title"
      class="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-40"
      loading="lazy"
    />

    <div class="relative z-10 flex flex-col items-center text-center text-white px-6 py-16">
      <!-- Pulsing LIVE badge -->
      <div
        class="mb-6 flex items-center gap-3 rounded-full bg-[#EF4444]/20 px-4 py-2 backdrop-blur-sm border border-[#EF4444]/30"
      >
        <span class="relative flex h-3 w-3">
          <span
            class="absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75 animate-ping"
          ></span>
          <span class="relative inline-flex h-3 w-3 rounded-full bg-[#EF4444]"></span>
        </span>
        <span class="text-sm font-bold tracking-widest text-[#EF4444] uppercase">Live Now</span>
      </div>

      <h2 class="font-serif text-3xl font-bold mb-3 max-w-2xl md:text-4xl">
        {{ stream.title }}
      </h2>
      <p class="text-white/70 text-base mb-2">{{ stream.congregation }}</p>
      <div class="flex items-center gap-2 mb-8">
        <Icon icon="heroicons:eye" class="h-4 w-4 text-white/50" />
        <span class="text-sm text-white/60"
          >{{ stream.viewerCount.toLocaleString() }} watching</span
        >
      </div>

      <a
        href="#"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Watch live stream now"
      >
        <span class="relative flex h-2 w-2">
          <span
            class="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"
          ></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
        </span>
        Watch Live Now
      </a>
    </div>
  </div>
</template>
