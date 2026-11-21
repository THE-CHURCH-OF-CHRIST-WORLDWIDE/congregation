<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <span class="stamp inline-flex items-center gap-2">
    <span class="h-px w-3 bg-current opacity-60" aria-hidden="true"></span>
    {{ label }}
  </span>
</template>
