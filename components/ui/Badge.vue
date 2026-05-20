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
  success: 'bg-[#0F973D] text-white',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-700',
  pink: 'bg-pink-500 text-white',
}
const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full font-medium',
      variantClasses[variant],
      sizeClasses[size],
    ]"
  >
    <slot name="icon"></slot>
    <slot></slot>
  </span>
</template>
