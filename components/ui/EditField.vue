<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <label class="flex flex-col gap-1">
    <span class="text-xs font-medium text-gray-500">{{ label }}</span>
    <div class="edit-field-slot">
      <slot></slot>
    </div>
  </label>
</template>

<style scoped>
.edit-field-slot :deep(input),
.edit-field-slot :deep(select),
.edit-field-slot :deep(textarea) {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #111827;
  background: #fff;
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.edit-field-slot :deep(input:focus),
.edit-field-slot :deep(select:focus),
.edit-field-slot :deep(textarea:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.15);
}
</style>
