<script setup lang="ts">
import type { RecordedStream } from '~/types/public'

defineProps<{ stream: RecordedStream }>()
const emit = defineEmits<{ watch: [stream: RecordedStream] }>()

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
</script>

<template>
  <!-- A recorded service on the night field: picture, then a short ruled caption -->
  <article class="group flex h-full flex-col">
    <!-- Thumbnail -->
    <div class="img-zoom relative aspect-video bg-night-raised">
      <img
        v-if="stream.thumbnailSrc"
        :src="displayableImageUrl(stream.thumbnailSrc)"
        :alt="stream.title"
        loading="lazy"
        class="h-full w-full object-cover"
      />
      <div
        v-else
        class="flex h-full w-full items-end p-5 font-display text-3xl leading-none text-on-night/25 italic"
        aria-hidden="true"
      >
        {{ stream.title }}
      </div>
      <div
        class="absolute inset-0 bg-night/15 transition-colors duration-500 group-hover:bg-night/40"
        aria-hidden="true"
      ></div>

      <!-- Duration, set in the corner like a slate -->
      <span class="num t-label absolute right-3 bottom-3 bg-night/80 px-2 py-1 text-on-night">
        {{ stream.duration }}
      </span>

      <!-- Play overlay -->
      <div
        class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      >
        <span
          class="flex size-14 items-center justify-center rounded-full border border-champagne bg-champagne text-night"
        >
          <svg class="ml-0.5 size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col pt-5">
      <span class="t-label text-champagne">{{ stream.serviceType }}</span>
      <h3
        class="mt-2 line-clamp-2 font-display text-2xl leading-[1.12] text-on-night transition-colors duration-300 group-hover:text-champagne"
      >
        {{ stream.title }}
      </h3>

      <p class="mt-3 mb-5 text-sm leading-relaxed text-on-night-muted">
        {{ stream.preacher }}
        <span class="text-on-night/30" aria-hidden="true"> / </span>
        <span class="num">{{ stream.date }}</span>
        <span class="text-on-night/30" aria-hidden="true"> / </span>
        <span class="num">{{ formatViews(stream.views) }} views</span>
      </p>

      <!-- Only offer playback once a recording has actually been attached. -->
      <button
        v-if="stream.videoSrc"
        class="link-line mt-auto self-start text-sm text-on-night"
        :aria-label="`Watch the replay of ${stream.title}`"
        @click="emit('watch', stream)"
      >
        <span class="link-text">Watch Replay</span>
        <Icon icon="mdi:arrow-right" class="link-arrow size-4" aria-hidden="true" />
      </button>
      <p v-else class="t-label mt-auto border-t border-on-night/15 pt-4 text-on-night-muted">
        Recording not published yet
      </p>
    </div>
  </article>
</template>
