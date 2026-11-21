<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}
withDefaults(defineProps<Props>(), { padding: 'md' })

const padClasses = { none: '', sm: 'p-3', md: 'p-4 lg:p-5', lg: 'p-5 lg:p-6' }
</script>

<template>
  <div :class="['rounded-sm border border-rule bg-surface', padClasses[padding]]">
    <slot></slot>
  </div>
</template>
