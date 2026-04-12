<script setup lang="ts">
import type { Speaker } from '~/types/events'

defineProps<{
  moderator: Speaker
  speakers: Speaker[]
}>()

function initials(name: string): string {
  return name.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2)
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
      <p class="text-xs text-white/60 mb-2 font-medium uppercase tracking-wide">Moderator</p>
      <div class="flex flex-col items-center gap-1">
        <div class="relative w-10 h-10">
          <img
            :src="moderator.avatar"
            :alt="moderator.name"
            class="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
            @error="onImgError"
          />
          <div
            class="hidden absolute inset-0 w-10 h-10 rounded-full bg-blue-500 items-center justify-center text-white text-xs font-bold ring-2 ring-white/30"
          >
            {{ initials(moderator.name) }}
          </div>
        </div>
        <span class="text-white text-[11px] text-center w-12 truncate leading-tight">
          {{ moderator.name.split(' ')[0] }}
        </span>
      </div>
    </div>

    <!-- Divider -->
    <div class="w-px bg-white/20 self-stretch" ></div>

    <!-- Speakers group -->
    <div>
      <p class="text-xs text-white/60 mb-2 font-medium uppercase tracking-wide">Speakers</p>
      <div class="flex gap-2">
        <div
          v-for="speaker in speakers.slice(0, 4)"
          :key="speaker.name"
          class="flex flex-col items-center gap-1"
        >
          <div class="relative w-10 h-10">
            <img
              :src="speaker.avatar"
              :alt="speaker.name"
              class="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
              @error="onImgError"
            />
            <div
              class="hidden absolute inset-0 w-10 h-10 rounded-full bg-indigo-500 items-center justify-center text-white text-xs font-bold ring-2 ring-white/30"
            >
              {{ initials(speaker.name) }}
            </div>
          </div>
          <span class="text-white text-[11px] text-center w-12 truncate leading-tight">
            {{ speaker.name.split(' ')[0] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
