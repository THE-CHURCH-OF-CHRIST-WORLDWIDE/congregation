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
  <article class="group flex flex-col">
    <!-- Portrait -->
    <div
      v-reveal="'unveil'"
      :class="[
        'img-zoom relative aspect-[4/5] w-full overflow-hidden',
        speaker.avatar ? 'bg-surface-sunken' : 'bg-primary',
      ]"
    >
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
        class="absolute inset-0 flex items-end p-5 font-display text-[clamp(3.5rem,8vw,6rem)] leading-none text-on-night/30 italic"
      >
        {{ initials(speaker.name) }}
      </p>
    </div>

    <!-- Name card -->
    <p class="stamp mt-5">{{ meta.badgeText }}</p>
    <h3 class="mt-2 font-display text-[1.5rem] leading-[1.1] text-ink md:text-[1.75rem]">
      {{ speaker.name }}
    </h3>
    <p v-if="speaker.title" class="t-label mt-2.5 text-ink-subtle">{{ speaker.title }}</p>

    <p v-if="speaker.bio" class="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
      {{ speaker.bio }}
    </p>
  </article>
</template>
