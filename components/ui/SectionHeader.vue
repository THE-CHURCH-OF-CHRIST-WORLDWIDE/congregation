<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  centered?: boolean
}>()
</script>

<template>
  <div :class="['mb-10', centered ? 'text-center' : '']">
    <h2 class="font-serif text-3xl font-bold text-[#1E3A5F] md:text-4xl">{{ title }}</h2>
    <p
      v-if="subtitle"
      class="mt-3 text-gray-500 text-lg max-w-2xl"
      :class="centered ? 'mx-auto' : ''"
    >
      {{ subtitle }}
    </p>
  </div>
</template>
