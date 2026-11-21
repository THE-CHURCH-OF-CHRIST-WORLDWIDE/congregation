<script setup lang="ts">
const props = defineProps<{
  tags: string[]
  active: string
}>()

const emit = defineEmits<{
  'update:active': [value: string]
}>()
</script>

<template>
  <div class="no-scrollbar flex gap-2 overflow-x-auto pb-1">
    <button
      v-for="tag in props.tags"
      :key="tag"
      :aria-pressed="props.active === tag"
      :class="[
        'inline-flex min-h-11 shrink-0 items-center rounded-md border px-4 text-base font-medium whitespace-nowrap transition-colors duration-150 sm:min-h-10 sm:text-sm',
        props.active === tag
          ? 'border-primary bg-primary text-on-primary shadow-xs'
          : 'border-rule-strong bg-surface text-ink-muted hover:border-ink-subtle hover:bg-surface-muted hover:text-ink',
      ]"
      @click="emit('update:active', tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>
