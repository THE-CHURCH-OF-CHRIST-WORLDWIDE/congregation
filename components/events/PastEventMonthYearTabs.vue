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
  <!-- Quiet filters for the archive: text tabs with a sliding bronze hairline -->
  <div
    class="relative grid w-full max-w-[18rem] grid-cols-2 border-b border-rule"
    role="group"
    aria-label="Past events period"
  >
    <button
      :class="[
        'inline-flex min-h-11 items-baseline gap-2 pb-2 text-left text-sm font-semibold transition-colors duration-500',
        modelValue === 'month' ? 'text-ink' : 'text-ink-subtle hover:text-ink-muted',
      ]"
      :aria-pressed="modelValue === 'month'"
      @click="emit('update:modelValue', 'month')"
    >
      This Month
      <span
        :class="['num text-xs font-semibold', monthCount > 0 ? 'text-accent' : 'text-ink-subtle']"
        >{{ monthCount }}</span
      >
    </button>

    <button
      :class="[
        'inline-flex min-h-11 items-baseline gap-2 pb-2 text-left text-sm font-semibold transition-colors duration-500',
        modelValue === 'year' ? 'text-ink' : 'text-ink-subtle hover:text-ink-muted',
      ]"
      :aria-pressed="modelValue === 'year'"
      @click="emit('update:modelValue', 'year')"
    >
      This Year
      <span
        :class="['num text-xs font-semibold', yearCount > 0 ? 'text-accent' : 'text-ink-subtle']"
        >{{ yearCount }}</span
      >
    </button>
    <span
      aria-hidden="true"
      :class="[
        'pointer-events-none absolute -bottom-px left-0 h-px w-1/2 bg-accent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
        modelValue === 'year' ? 'translate-x-full' : 'translate-x-0',
      ]"
    ></span>
  </div>
</template>
