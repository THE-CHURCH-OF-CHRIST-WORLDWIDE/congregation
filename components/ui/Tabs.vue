<script setup lang="ts">
interface Tab {
  label: string
  value: string
}
interface Props {
  modelValue: string
  tabs: Tab[]
}
defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [val: string] }>()
</script>

<template>
  <div class="no-scrollbar flex gap-1 overflow-x-auto border-b border-rule" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      role="tab"
      :aria-selected="modelValue === tab.value"
      :class="[
        '-mb-px min-h-11 cursor-pointer whitespace-nowrap border-b-2 px-3.5 text-sm transition-colors duration-150',
        modelValue === tab.value
          ? 'border-accent font-semibold text-ink'
          : 'border-transparent font-medium text-ink-muted hover:border-rule-strong hover:text-ink',
      ]"
      @click="emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
