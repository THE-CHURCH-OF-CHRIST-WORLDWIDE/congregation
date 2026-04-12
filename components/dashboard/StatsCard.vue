<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  subtitle?: string
  change?: number
  changeLabel?: string
  sparkValues?: number[]
  sparkColor?: string
}
const props = withDefaults(defineProps<Props>(), { change: 0, sparkColor: '#93c5fd' })

const changeIsPositive = computed(() => (props.change ?? 0) >= 0)
</script>

<template>
  <Card>
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0 flex-1">
        <p class="text-xs text-gray-500 font-medium mb-1 truncate">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 leading-tight">{{ value }}</p>
        <div class="flex items-center gap-1.5 mt-1.5">
          <Badge v-if="change !== undefined" :variant="changeIsPositive ? 'success' : 'danger'" size="sm">
            <template #icon>
              <Icon :icon="changeIsPositive ? 'mdi:trending-up' : 'mdi:trending-down'" class="text-[10px]" />
            </template>
            {{ Math.abs(change) }}%
          </Badge>
          <p v-if="subtitle" class="text-xs text-gray-400 truncate">{{ subtitle }}</p>
        </div>
      </div>
      <div class="flex-shrink-0 pt-1">
        <SparkLine
          v-if="sparkValues && sparkValues.length"
          :values="sparkValues"
          :color="sparkColor"
          :width="80"
          :height="36"
        />
      </div>
    </div>
  </Card>
</template>
