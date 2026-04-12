<script setup lang="ts">
import type { RecordedStream } from '~/types/public'

defineProps<{ stream: RecordedStream }>()

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
</script>

<template>
  <article class="group flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <!-- Thumbnail -->
    <div class="relative overflow-hidden" style="aspect-ratio:16/9">
      <img
        :src="stream.thumbnailSrc"
        :alt="stream.title"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" ></div>

      <!-- Service type badge top-left -->
      <span class="absolute top-3 left-3 rounded-full bg-[#1E3A5F]/80 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
        {{ stream.serviceType }}
      </span>

      <!-- Duration badge top-right -->
      <span class="absolute top-3 right-3 rounded bg-black/60 px-2 py-0.5 text-xs font-mono text-white">
        {{ stream.duration }}
      </span>

      <!-- Play overlay -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
          <svg class="ml-1 h-6 w-6 text-[#2563EB]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col p-4">
      <h3 class="font-serif font-bold text-[#1E3A5F] leading-snug line-clamp-2 mb-3">
        {{ stream.title }}
      </h3>

      <div class="flex flex-col gap-1.5 text-xs text-gray-500 mb-4">
        <div class="flex items-center gap-1.5">
          <Icon icon="heroicons:user-circle" class="h-3.5 w-3.5 shrink-0" />
          {{ stream.preacher }}
        </div>
        <div class="flex items-center gap-1.5">
          <Icon icon="heroicons:calendar" class="h-3.5 w-3.5 shrink-0" />
          {{ stream.date }}
        </div>
        <div class="flex items-center gap-1.5">
          <Icon icon="heroicons:eye" class="h-3.5 w-3.5 shrink-0" />
          {{ formatViews(stream.views) }} views
        </div>
      </div>

      <button
        class="mt-auto w-full rounded-lg bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        aria-label="Watch replay"
      >
        Watch Replay
      </button>
    </div>
  </article>
</template>
