<script setup lang="ts">
import type { Speaker } from '~/types/events'

defineProps<{
  moderator: Speaker
  speakers: Speaker[]
}>()

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
  const fallback = img.nextElementSibling as HTMLElement | null
  if (fallback) fallback.classList.remove('hidden')
}
</script>

<template>
  <div class="flex gap-6">
    <!-- Moderator group -->
    <div>
      <p class="mb-2 text-xs font-semibold tracking-wide text-white/70 uppercase">Moderator</p>
      <div class="flex flex-col items-center gap-1">
        <div class="relative size-10">
          <img
            :src="displayableImageUrl(moderator.avatar)"
            :alt="moderator.name"
            class="size-10 rounded-full object-cover ring-2 ring-white/40"
            loading="lazy"
            decoding="async"
            @error="onImgError"
          />
          <div
            class="absolute inset-0 hidden size-10 rounded-full bg-primary text-center text-xs leading-10 font-bold text-white ring-2 ring-white/40"
          >
            {{ initials(moderator.name) }}
          </div>
        </div>
        <span class="w-14 truncate text-center text-xs leading-tight text-white">
          {{ moderator.name.split(' ')[0] }}
        </span>
      </div>
    </div>

    <!-- Divider -->
    <div class="w-px self-stretch bg-white/20"></div>

    <!-- Speakers group -->
    <div>
      <p class="mb-2 text-xs font-semibold tracking-wide text-white/70 uppercase">Speakers</p>
      <div class="flex gap-2">
        <div
          v-for="speaker in speakers.slice(0, 4)"
          :key="speaker.name"
          class="flex flex-col items-center gap-1"
        >
          <div class="relative size-10">
            <img
              :src="displayableImageUrl(speaker.avatar)"
              :alt="speaker.name"
              class="size-10 rounded-full object-cover ring-2 ring-white/40"
              loading="lazy"
              decoding="async"
              @error="onImgError"
            />
            <div
              class="absolute inset-0 hidden size-10 rounded-full bg-secondary text-center text-xs leading-10 font-bold text-white ring-2 ring-white/40"
            >
              {{ initials(speaker.name) }}
            </div>
          </div>
          <span class="w-14 truncate text-center text-xs leading-tight text-white">
            {{ speaker.name.split(' ')[0] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
