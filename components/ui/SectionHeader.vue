<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  centered?: boolean
}>()
</script>

<template>
  <div :class="['mb-12 md:mb-16', centered ? 'text-center' : '']">
    <h2 class="t-h2 max-w-[18ch] text-secondary" :class="centered ? 'mx-auto' : ''">
      <SplitReveal :text="title" />
    </h2>
    <p v-if="subtitle" v-reveal.150 class="t-lede mt-5 max-w-xl" :class="centered ? 'mx-auto' : ''">
      {{ subtitle }}
    </p>
  </div>
</template>
