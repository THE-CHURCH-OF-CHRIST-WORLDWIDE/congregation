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
  <article
    class="group flex flex-col overflow-hidden rounded-lg border border-rule bg-surface shadow-xs transition-[box-shadow,border-color] duration-200 hover:border-rule-strong hover:shadow-md"
  >
    <!-- Thumbnail -->
    <div class="relative overflow-hidden bg-surface-sunken" style="aspect-ratio: 16/9">
      <img
        :src="displayableImageUrl(stream.thumbnailSrc)"
        :alt="stream.title"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      />
      <div
        class="absolute inset-0 bg-black/10 transition-colors duration-200 group-hover:bg-black/30"
      ></div>

      <!-- Service type badge top-left -->
      <span
        class="absolute top-3 left-3 rounded-sm bg-surface/95 px-2 py-0.5 text-xs font-semibold text-ink shadow-xs"
      >
        {{ stream.serviceType }}
      </span>

      <!-- Duration badge bottom-right -->
      <span
        class="num absolute right-3 bottom-3 rounded-sm bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white"
      >
        {{ stream.duration }}
      </span>

      <!-- Play overlay -->
      <div
        class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        <span class="flex size-12 items-center justify-center rounded-full bg-white/95 shadow-md">
          <svg
            class="ml-0.5 size-6 text-primary"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col p-5">
      <h3 class="mb-3 line-clamp-2 font-display text-lg leading-snug font-semibold text-ink">
        {{ stream.title }}
      </h3>

      <div class="mb-5 flex flex-col gap-1.5 text-sm text-ink-muted">
        <div class="flex items-center gap-2">
          <Icon
            icon="mdi:account-outline"
            class="size-4 shrink-0 text-ink-subtle"
            aria-hidden="true"
          />
          {{ stream.preacher }}
        </div>
        <div class="num flex items-center gap-2">
          <Icon
            icon="mdi:calendar-outline"
            class="size-4 shrink-0 text-ink-subtle"
            aria-hidden="true"
          />
          {{ stream.date }}
        </div>
        <div class="num flex items-center gap-2">
          <Icon icon="mdi:eye-outline" class="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
          {{ formatViews(stream.views) }} views
        </div>
      </div>

      <!-- Only offer playback once a recording has actually been attached. -->
      <button
        v-if="stream.videoSrc"
        class="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-on-primary shadow-xs transition-colors duration-150 hover:bg-primary-hover"
        :aria-label="`Watch the replay of ${stream.title}`"
        @click="emit('watch', stream)"
      >
        Watch Replay
      </button>
      <p
        v-else
        class="mt-auto rounded-md border border-dashed border-rule-strong bg-surface-muted py-2.5 text-center text-sm text-ink-subtle"
      >
        Recording not published yet
      </p>
    </div>
  </article>
</template>
