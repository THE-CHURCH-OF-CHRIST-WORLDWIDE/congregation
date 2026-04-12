<script setup lang="ts">
interface Step {
  number: number
  title: string
  description: string
}

defineProps<{ steps: Step[] }>()
</script>

<template>
  <div class="grid gap-6 md:grid-cols-3">
    <div v-for="step in steps" :key="step.number" class="flex flex-col items-center text-center p-6">
      <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB] text-white text-xl font-bold font-serif shadow-md">
        {{ step.number }}
      </div>
      <h3 class="mb-2 font-semibold text-[#1E3A5F] text-lg">{{ step.title }}</h3>
      <p class="text-sm text-gray-500 leading-relaxed">{{ step.description }}</p>
    </div>
  </div>
</template>
