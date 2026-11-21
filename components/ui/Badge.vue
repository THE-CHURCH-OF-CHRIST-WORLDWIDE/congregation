<script setup lang="ts">
interface Props {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pink'
  size?: 'sm' | 'md'
}
withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
})

const variantClasses = {
  success: 'bg-success-soft text-success ring-success/25',
  warning: 'bg-warning-soft text-warning ring-warning/25',
  danger: 'bg-error-soft text-error ring-error/25',
  info: 'bg-info-soft text-info ring-info/25',
  neutral: 'bg-surface-sunken text-ink-muted ring-rule-strong/60',
  pink: 'bg-accent-soft text-accent ring-accent/25',
}
const sizeClasses = {
  sm: 'px-1.5 py-px text-2xs',
  md: 'px-2 py-0.5 text-xs',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 whitespace-nowrap rounded-sm font-semibold ring-1 ring-inset',
      variantClasses[variant],
      sizeClasses[size],
    ]"
  >
    <slot name="icon"></slot>
    <slot></slot>
  </span>
</template>
