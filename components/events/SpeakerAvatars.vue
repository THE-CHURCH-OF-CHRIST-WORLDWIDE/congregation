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
  <div class="flex gap-6 sm:gap-8">
    <!-- Moderator group -->
    <div>
      <p class="t-label mb-3 text-on-night-muted">Moderator</p>
      <div class="flex flex-col items-center gap-1.5">
        <div class="relative size-11">
          <img
            v-if="moderator.avatar"
            :src="displayableImageUrl(moderator.avatar)"
            :alt="moderator.name"
            class="size-11 rounded-full object-cover ring-1 ring-on-night/30"
            loading="lazy"
            decoding="async"
            @error="onImgError"
          />
          <div
            :class="[
              'absolute inset-0 size-11 rounded-full bg-primary text-center font-display text-base leading-11 text-on-night italic ring-1 ring-on-night/30',
              moderator.avatar ? 'hidden' : '',
            ]"
          >
            {{ initials(moderator.name) }}
          </div>
        </div>
        <span class="w-14 truncate text-center text-xs leading-tight text-on-night">
          {{ moderator.name.split(' ')[0] }}
        </span>
      </div>
    </div>

    <!-- Divider -->
    <div class="w-px self-stretch bg-on-night/20"></div>

    <!-- Speakers group -->
    <div class="min-w-0">
      <p class="t-label mb-3 text-on-night-muted">Speakers</p>
      <div class="flex gap-2.5">
        <div
          v-for="speaker in speakers.slice(0, 4)"
          :key="speaker.name"
          class="flex flex-col items-center gap-1.5"
        >
          <div class="relative size-11">
            <img
              v-if="speaker.avatar"
              :src="displayableImageUrl(speaker.avatar)"
              :alt="speaker.name"
              class="size-11 rounded-full object-cover ring-1 ring-on-night/30"
              loading="lazy"
              decoding="async"
              @error="onImgError"
            />
            <div
              :class="[
                'absolute inset-0 size-11 rounded-full bg-night-raised text-center font-display text-base leading-11 text-champagne italic ring-1 ring-on-night/30',
                speaker.avatar ? 'hidden' : '',
              ]"
            >
              {{ initials(speaker.name) }}
            </div>
          </div>
          <span class="w-14 truncate text-center text-xs leading-tight text-on-night">
            {{ speaker.name.split(' ')[0] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
