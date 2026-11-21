<script setup lang="ts">
interface Step {
  number: number
  title: string
  description: string
}

defineProps<{ steps: Step[] }>()
</script>

<template>
  <ol
    class="grid divide-y divide-rule border-y border-rule md:grid-cols-3 md:divide-x md:divide-y-0"
  >
    <li
      v-for="step in steps"
      :key="step.number"
      class="flex flex-col py-7 md:px-8 md:py-8 md:first:pl-0 md:last:pr-0"
    >
      <span class="num font-display text-4xl leading-none text-accent" aria-hidden="true">
        {{ step.number }}
      </span>
      <h3 class="mt-4 font-sans text-base font-semibold text-ink">{{ step.title }}</h3>
      <p class="mt-2 text-base leading-relaxed text-ink-muted">{{ step.description }}</p>
    </li>
  </ol>
</template>
