<script setup lang="ts">
interface Props {
  src?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}
const props = withDefaults(defineProps<Props>(), { size: 'md' })

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const sizeClasses = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

const colors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-teal-500',
]
const colorClass = computed(() => {
  if (!props.name) return colors[0]
  const idx = props.name.charCodeAt(0) % colors.length
  return colors[idx]
})
</script>

<template>
  <div
    :class="[
      'rounded-full flex items-center justify-center overflow-hidden flex-shrink-0',
      sizeClasses[size],
    ]"
    :aria-label="name"
  >
    <img v-if="src" :src="src" :alt="name" class="w-full h-full object-cover" />
    <span
      v-else
      :class="['text-white font-semibold', colorClass]"
      class="w-full h-full flex items-center justify-center"
    >
      {{ initials }}
    </span>
  </div>
</template>
