<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}
withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
})

const variantClasses = {
  primary: 'bg-primary text-on-primary shadow-xs hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'border border-rule-strong bg-surface text-ink shadow-xs hover:bg-surface-muted hover:border-ink-subtle active:bg-surface-sunken',
  danger: 'bg-error text-on-primary shadow-xs hover:brightness-95 active:brightness-90',
  ghost: 'text-ink-muted hover:bg-surface-sunken hover:text-ink active:bg-rule',
}

const sizeClasses = {
  sm: 'min-h-9 px-3 text-[13px] gap-1.5',
  md: 'min-h-11 px-4 text-sm gap-2 sm:min-h-10',
  lg: 'min-h-12 px-6 text-base gap-2',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :class="[
      'inline-flex select-none items-center justify-center rounded-md font-semibold whitespace-nowrap transition-[background-color,border-color,color,filter,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none',
      variantClasses[variant],
      sizeClasses[size],
    ]"
  >
    <Icon v-if="loading" icon="mdi:loading" class="shrink-0 animate-spin" aria-hidden="true" />
    <slot name="icon-left"></slot>
    <slot></slot>
    <slot name="icon-right"></slot>
  </button>
</template>
