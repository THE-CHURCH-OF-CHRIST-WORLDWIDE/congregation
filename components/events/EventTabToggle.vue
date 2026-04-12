<script setup lang="ts">
defineProps<{
  modelValue: 'upcoming' | 'past'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: 'upcoming' | 'past']
}>()
</script>

<template>
  <div class="inline-flex gap-2">
    <button
      :class="[
        'rounded-full px-5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        modelValue === 'upcoming'
          ? 'bg-blue-600 text-white shadow-sm'
          : 'border border-gray-300 text-gray-600 bg-white hover:bg-gray-50',
      ]"
      :aria-pressed="modelValue === 'upcoming'"
      @click="emit('update:modelValue', 'upcoming')"
    >
      Upcoming Events
    </button>
    <button
      :class="[
        'rounded-full px-5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        modelValue === 'past'
          ? 'bg-blue-600 text-white shadow-sm'
          : 'border border-gray-300 text-gray-600 bg-white hover:bg-gray-50',
      ]"
      :aria-pressed="modelValue === 'past'"
      @click="emit('update:modelValue', 'past')"
    >
      Past Events
    </button>
  </div>
</template>
