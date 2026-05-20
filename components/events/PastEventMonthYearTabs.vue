<script setup lang="ts">
defineProps<{
  modelValue: 'month' | 'year'
  monthCount: number
  yearCount: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: 'month' | 'year']
}>()
</script>

<template>
  <div class="flex gap-1 border-b border-gray-200">
    <button
      :class="[
        'flex items-center gap-2 px-1 pb-3 pt-1 text-sm font-medium border-b-2 -mb-px transition-colors',
        modelValue === 'month'
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
      ]"
      @click="emit('update:modelValue', 'month')"
    >
      This Month
      <span
        :class="[
          'rounded-full px-2 py-0.5 text-xs font-semibold',
          monthCount > 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500',
        ]"
        >{{ monthCount }}</span
      >
    </button>

    <button
      :class="[
        'flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-medium border-b-2 -mb-px transition-colors',
        modelValue === 'year'
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
      ]"
      @click="emit('update:modelValue', 'year')"
    >
      This Year
      <span
        :class="[
          'rounded-full px-2 py-0.5 text-xs font-semibold',
          yearCount > 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500',
        ]"
        >{{ yearCount }}</span
      >
    </button>
  </div>
</template>
