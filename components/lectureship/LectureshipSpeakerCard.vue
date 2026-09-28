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
  <div class="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <!-- Portrait photo, badge + name overlaid at the bottom like a name card -->
    <div
      :class="[
        'relative aspect-[3/4] w-full',
        !speaker.avatar && `bg-gradient-to-br ${meta.gradientClass}`,
      ]"
    >
      <img
        v-if="speaker.avatar"
        :src="displayableImageUrl(speaker.avatar)"
        :alt="speaker.name"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <p
        v-else
        class="absolute inset-0 flex items-center justify-center font-serif text-6xl font-bold text-white/25"
      >
        {{ initials(speaker.name) }}
      </p>

      <div
        class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
      ></div>

      <div class="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4">
        <span
          :class="[
            'w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
            meta.accentClass,
          ]"
        >
          {{ meta.badgeText }}
        </span>
        <p class="text-base font-semibold leading-snug text-white">{{ speaker.name }}</p>
        <p v-if="speaker.title" class="text-xs text-white/70">{{ speaker.title }}</p>
      </div>
    </div>

    <p v-if="speaker.bio" class="px-4 py-4 text-sm leading-relaxed text-gray-500">
      {{ speaker.bio }}
    </p>
  </div>
</template>
