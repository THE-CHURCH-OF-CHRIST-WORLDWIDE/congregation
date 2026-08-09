<script setup lang="ts">
const props = defineProps<{
  label: string
  /** Shown in red under the field, and reddens its border. Takes precedence over `hint`. */
  error?: string
  /** Quiet guidance under the field, e.g. the format a number should take. */
  hint?: string
}>()

const invalid = computed(() => Boolean(props.error))
</script>

<template>
  <label class="flex flex-col gap-1" :class="{ 'edit-field-invalid': invalid }">
    <span class="text-xs font-medium text-gray-500">{{ label }}</span>
    <div class="edit-field-slot">
      <slot></slot>
    </div>
    <!-- role="alert" so a screen reader announces the clash rather than leaving it unread. -->
    <span v-if="error" role="alert" class="text-xs text-red-600">{{ error }}</span>
    <span v-else-if="hint" class="text-xs text-gray-400">{{ hint }}</span>
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
.edit-field-invalid .edit-field-slot :deep(input),
.edit-field-invalid .edit-field-slot :deep(select),
.edit-field-invalid .edit-field-slot :deep(textarea) {
  border-color: #dc2626;
}
.edit-field-invalid .edit-field-slot :deep(input:focus),
.edit-field-invalid .edit-field-slot :deep(select:focus),
.edit-field-invalid .edit-field-slot :deep(textarea:focus) {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgb(220 38 38 / 0.15);
}
</style>
