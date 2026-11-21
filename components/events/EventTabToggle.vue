<script setup lang="ts">
defineProps<{
  modelValue: 'upcoming' | 'past'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: 'upcoming' | 'past']
}>()
</script>

<template>
  <!-- Two quiet text tabs; a bronze hairline slides beneath the active one -->
  <div
    class="relative grid w-full max-w-[30rem] grid-cols-2 border-b border-rule-strong"
    role="group"
    aria-label="Event timeframe"
  >
    <button
      :class="[
        'flex min-h-14 items-end pb-4 text-left font-display text-[1.625rem] leading-none transition-colors duration-500 sm:text-[2rem]',
        modelValue === 'upcoming' ? 'text-ink' : 'text-ink-subtle hover:text-ink-muted',
      ]"
      :aria-pressed="modelValue === 'upcoming'"
      @click="emit('update:modelValue', 'upcoming')"
    >
      Upcoming Events
    </button>
    <button
      :class="[
        'flex min-h-14 items-end pb-4 pl-6 text-left font-display text-[1.625rem] leading-none transition-colors duration-500 sm:text-[2rem]',
        modelValue === 'past' ? 'text-ink' : 'text-ink-subtle hover:text-ink-muted',
      ]"
      :aria-pressed="modelValue === 'past'"
      @click="emit('update:modelValue', 'past')"
    >
      Past Events
    </button>
    <span
      aria-hidden="true"
      :class="[
        'pointer-events-none absolute -bottom-px left-0 h-[2px] w-1/2 bg-accent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
        modelValue === 'past' ? 'translate-x-full' : 'translate-x-0',
      ]"
    ></span>
  </div>
</template>
