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
  <div class="flex gap-1 border-b border-rule" role="group" aria-label="Past events period">
    <button
      :class="[
        '-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors duration-150',
        modelValue === 'month'
          ? 'border-primary text-primary-ink'
          : 'border-transparent text-ink-muted hover:border-rule-strong hover:text-ink',
      ]"
      :aria-pressed="modelValue === 'month'"
      @click="emit('update:modelValue', 'month')"
    >
      This Month
      <span
        :class="[
          'num min-w-6 rounded-sm px-1.5 py-0.5 text-center text-xs font-semibold',
          monthCount > 0 ? 'bg-primary text-on-primary' : 'bg-surface-sunken text-ink-subtle',
        ]"
        >{{ monthCount }}</span
      >
    </button>

    <button
      :class="[
        '-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors duration-150',
        modelValue === 'year'
          ? 'border-primary text-primary-ink'
          : 'border-transparent text-ink-muted hover:border-rule-strong hover:text-ink',
      ]"
      :aria-pressed="modelValue === 'year'"
      @click="emit('update:modelValue', 'year')"
    >
      This Year
      <span
        :class="[
          'num min-w-6 rounded-sm px-1.5 py-0.5 text-center text-xs font-semibold',
          yearCount > 0 ? 'bg-primary text-on-primary' : 'bg-surface-sunken text-ink-subtle',
        ]"
        >{{ yearCount }}</span
      >
    </button>
  </div>
</template>
