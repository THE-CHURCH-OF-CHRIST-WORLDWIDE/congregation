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
  <!-- Quiet text tabs: the active filter is marked by a bronze hairline beneath it -->
  <div class="no-scrollbar -mb-px flex gap-x-7 overflow-x-auto">
    <button
      v-for="tag in props.tags"
      :key="tag"
      :aria-pressed="props.active === tag"
      :class="[
        'relative inline-flex min-h-11 shrink-0 items-center text-[0.9375rem] font-medium whitespace-nowrap transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-accent after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)]',
        props.active === tag
          ? 'text-ink after:scale-x-100'
          : 'text-ink-subtle after:scale-x-0 hover:text-ink',
      ]"
      @click="emit('update:active', tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>
