<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  centered?: boolean
}>()
</script>

<template>
  <div :class="['mb-10 md:mb-12', centered ? 'text-center' : '']">
    <h2
      class="font-display text-[1.875rem] font-bold leading-[1.15] text-secondary md:text-[2.5rem]"
    >
      {{ title }}
    </h2>
    <p
      v-if="subtitle"
      class="mt-3 max-w-2xl text-lg leading-relaxed text-ink-muted"
      :class="centered ? 'mx-auto' : ''"
    >
      {{ subtitle }}
    </p>
  </div>
</template>
