<script setup lang="ts">
interface Props {
  values: number[]
  color?: string
  height?: number
  width?: number
}
const props = withDefaults(defineProps<Props>(), {
  color: '#93c5fd',
  height: 36,
  width: 80,
})

const points = computed(() => {
  const vals = props.values
  if (!vals.length) return ''
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const xStep = props.width / (vals.length - 1)
  return vals
    .map((v, i) => {
      const x = i * xStep
      const y = props.height - ((v - min) / range) * (props.height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')
})
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="overflow-visible"
    aria-hidden="true"
  >
    <polyline
      :points="points"
      fill="none"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
