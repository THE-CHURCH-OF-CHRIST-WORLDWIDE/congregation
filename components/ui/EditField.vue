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
  <label class="flex flex-col gap-1.5" :class="{ 'edit-field-invalid': invalid }">
    <span class="text-[13px] font-medium text-ink-muted">{{ label }}</span>
    <div class="edit-field-slot">
      <slot></slot>
    </div>
    <!-- role="alert" so a screen reader announces the clash rather than leaving it unread. -->
    <span v-if="error" role="alert" class="text-xs font-medium text-error">{{ error }}</span>
    <span v-else-if="hint" class="text-xs text-ink-subtle">{{ hint }}</span>
  </label>
</template>

<style scoped>
.edit-field-slot :deep(input),
.edit-field-slot :deep(select),
.edit-field-slot :deep(textarea) {
  width: 100%;
  min-height: 2.5rem;
  border: 1px solid var(--c-rule-strong);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--c-ink);
  background: var(--c-surface);
  outline: none;
  transition:
    border-color var(--duration-fast),
    box-shadow var(--duration-fast);
}
.edit-field-slot :deep(input:hover),
.edit-field-slot :deep(select:hover),
.edit-field-slot :deep(textarea:hover) {
  border-color: var(--c-ink-subtle);
}
.edit-field-slot :deep(input:disabled),
.edit-field-slot :deep(select:disabled),
.edit-field-slot :deep(textarea:disabled) {
  background: var(--c-surface-muted);
  color: var(--c-ink-subtle);
  cursor: not-allowed;
}
.edit-field-slot :deep(input:focus),
.edit-field-slot :deep(select:focus),
.edit-field-slot :deep(textarea:focus) {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-primary) 15%, transparent);
}
.edit-field-invalid .edit-field-slot :deep(input),
.edit-field-invalid .edit-field-slot :deep(select),
.edit-field-invalid .edit-field-slot :deep(textarea) {
  border-color: var(--c-error);
}
.edit-field-invalid .edit-field-slot :deep(input:focus),
.edit-field-invalid .edit-field-slot :deep(select:focus),
.edit-field-invalid .edit-field-slot :deep(textarea:focus) {
  border-color: var(--c-error);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-error) 15%, transparent);
}
</style>
