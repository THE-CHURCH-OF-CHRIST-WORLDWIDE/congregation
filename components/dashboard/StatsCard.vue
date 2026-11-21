<script setup lang="ts">
import { chartPalette } from '~/utils/chartTheme'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  /**
   * Percentage change against the previous period. Leave undefined when there is nothing to
   * compare against — the badge is then hidden rather than claiming a flat 0%.
   */
  change?: number
  changeLabel?: string
  sparkValues?: number[]
  sparkColor?: string
}
// No default for `change`: defaulting it to 0 made the badge render on every card, which is
// what put a "+10%" on figures nothing was actually tracking.
const props = withDefaults(defineProps<Props>(), { sparkColor: chartPalette.bookcloth })

const changeIsPositive = computed(() => (props.change ?? 0) >= 0)
</script>

<template>
  <div class="flex h-full flex-col bg-surface px-5 py-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-ink-muted">
          {{ title }}
        </p>
        <p class="num mt-1.5 font-display text-[1.75rem] leading-none font-semibold text-ink">
          {{ value }}
        </p>
      </div>
      <div v-if="sparkValues?.length" class="shrink-0 pt-1 opacity-70">
        <SparkLine
          v-if="sparkValues && sparkValues.length"
          :values="sparkValues"
          :color="sparkColor"
          :width="80"
          :height="36"
        />
      </div>
    </div>
    <div class="mt-3 flex min-w-0 items-center gap-2">
      <Badge
        v-if="change !== undefined"
        :variant="changeIsPositive ? 'success' : 'danger'"
        size="sm"
        class="num"
      >
        <template #icon>
          <Icon
            :icon="changeIsPositive ? 'mdi:trending-up' : 'mdi:trending-down'"
            class="text-[10px]"
            aria-hidden="true"
          />
        </template>
        {{ Math.abs(change) }}%
      </Badge>
      <p v-if="subtitle" class="num truncate text-xs text-ink-subtle">{{ subtitle }}</p>
    </div>
  </div>
</template>
