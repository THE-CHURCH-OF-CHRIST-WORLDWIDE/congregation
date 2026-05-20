<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <span
    class="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 tracking-wide"
  >
    {{ label }}
  </span>
</template>
