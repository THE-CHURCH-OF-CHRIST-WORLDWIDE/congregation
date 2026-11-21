<script setup lang="ts">
defineProps<{
  modelValue: 'upcoming' | 'past'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: 'upcoming' | 'past']
}>()
</script>

<template>
  <div
    class="inline-flex gap-1 rounded-md border border-rule-strong bg-surface-muted p-1"
    role="group"
    aria-label="Event timeframe"
  >
    <button
      :class="[
        'inline-flex min-h-11 items-center justify-center rounded-[5px] px-5 text-sm font-semibold transition-[background-color,color,box-shadow] duration-150',
        modelValue === 'upcoming'
          ? 'bg-primary text-on-primary shadow-xs'
          : 'text-ink-muted hover:bg-surface hover:text-ink',
      ]"
      :aria-pressed="modelValue === 'upcoming'"
      @click="emit('update:modelValue', 'upcoming')"
    >
      Upcoming Events
    </button>
    <button
      :class="[
        'inline-flex min-h-11 items-center justify-center rounded-[5px] px-5 text-sm font-semibold transition-[background-color,color,box-shadow] duration-150',
        modelValue === 'past'
          ? 'bg-primary text-on-primary shadow-xs'
          : 'text-ink-muted hover:bg-surface hover:text-ink',
      ]"
      :aria-pressed="modelValue === 'past'"
      @click="emit('update:modelValue', 'past')"
    >
      Past Events
    </button>
  </div>
</template>
