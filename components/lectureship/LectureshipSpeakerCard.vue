<script setup lang="ts">
import type { LectureshipSpeaker } from '~/types'
import { LECTURESHIP_ROLES } from '~/constants'

const props = defineProps<{ speaker: LectureshipSpeaker }>()

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const meta = computed(() => LECTURESHIP_ROLES[props.speaker.role])
</script>

<template>
  <div
    class="flex flex-col overflow-hidden rounded-lg border border-rule bg-surface shadow-xs transition-[box-shadow,border-color] duration-200 hover:border-rule-strong hover:shadow-md"
  >
    <!-- Portrait photo, badge + name overlaid at the bottom like a name card -->
    <div :class="['relative aspect-[3/4] w-full', !speaker.avatar && 'bookcloth']">
      <img
        v-if="speaker.avatar"
        :src="displayableImageUrl(speaker.avatar)"
        :alt="speaker.name"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <p
        v-else
        class="absolute inset-0 flex items-center justify-center font-display text-6xl font-bold text-white/50"
      >
        {{ initials(speaker.name) }}
      </p>

      <div
        class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/35 to-transparent"
      ></div>

      <div class="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3 sm:p-4">
        <span
          :class="[
            'w-fit rounded-sm px-1.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
            meta.accentClass,
          ]"
        >
          {{ meta.badgeText }}
        </span>
        <p class="font-display text-base leading-snug font-semibold text-white sm:text-lg">
          {{ speaker.name }}
        </p>
        <p v-if="speaker.title" class="text-sm leading-snug text-white/80">{{ speaker.title }}</p>
      </div>
    </div>

    <p v-if="speaker.bio" class="px-4 py-4 text-sm leading-relaxed text-ink-muted">
      {{ speaker.bio }}
    </p>
  </div>
</template>
