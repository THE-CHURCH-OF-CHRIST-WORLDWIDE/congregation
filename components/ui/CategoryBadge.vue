<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <span
    class="stamp inline-block rounded-sm bg-accent-soft px-2 py-1 ring-1 ring-accent/20 ring-inset"
  >
    {{ label }}
  </span>
</template>
