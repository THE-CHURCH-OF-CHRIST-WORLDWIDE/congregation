<script setup lang="ts">
import { MEMBER_STATUSES } from '~/constants'
interface Slice {
  label: string
  value: number
  color: string
}

const membersStore = useMembersStore()
const currentYear = new Date().getFullYear()

/**
 * Built from `MEMBER_STATUSES` so a status can never be silently missing — the hand-written
 * bucket list this replaces omitted Disfellowshipped, which meant those members were absent
 * from the chart *and* from the total beneath it.
 */
const STATUS_COLORS: Record<string, string> = {
  Active: '#2f7a5c',
  Inactive: '#7a8aa0',
  Backslider: '#a8683f',
  Weak: '#c08a2e',
  Distant: '#2e8a92',
  Withdrawal: '#8a5a9e',
  Disfellowshipped: '#c2493b',
  Transfer: '#3d5f8f',
  Late: '#5e6f3a',
}

const slices = computed<Slice[]>(() =>
  MEMBER_STATUSES.map((status) => ({
    label: status,
    value: membersStore.members.filter((m) => m.status === status).length,
    color: STATUS_COLORS[status] ?? '#7a8aa0',
  }))
)

/** Statuses that at least one member holds. */
const presentSlices = computed(() => slices.value.filter((s) => s.value > 0))

const totalCount = computed(() => slices.value.reduce((a, b) => a + b.value, 0))

// Build the SVG path arcs for the pie. We rely on cumulative angles so each
// slice picks up where the previous one ended.
const arcs = computed(() => {
  const total = totalCount.value || 1
  const cx = 100
  const cy = 100
  const r = 90
  let angle = -Math.PI / 2 // start at 12 o'clock so the largest wedge anchors to the top
  return slices.value
    .filter((s) => s.value > 0)
    .map((s) => {
      const portion = s.value / total
      const sweep = portion * Math.PI * 2
      const startX = cx + r * Math.cos(angle)
      const startY = cy + r * Math.sin(angle)
      const endAngle = angle + sweep
      const endX = cx + r * Math.cos(endAngle)
      const endY = cy + r * Math.sin(endAngle)
      // A slice covering the whole circle starts and ends at the same point, and an SVG arc
      // between two identical points draws nothing — which is why a single-status roll rendered
      // a legend, a percentage, and no pie. Full circles are drawn as a <circle> instead.
      const full = portion >= 1
      const largeArc = sweep > Math.PI ? 1 : 0
      const path = `M ${cx} ${cy} L ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY} Z`
      // Label position: 65% out from center along the slice's midpoint angle
      const midAngle = angle + sweep / 2
      const labelR = r * 0.6
      const labelX = cx + labelR * Math.cos(midAngle)
      const labelY = cy + labelR * Math.sin(midAngle)
      const pct = Math.round(portion * 100)
      angle = endAngle
      return { ...s, path, labelX, labelY, pct, full }
    })
})
</script>

<template>
  <div class="flex flex-col rounded-lg border border-rule bg-surface p-5 shadow-xs">
    <div class="flex items-center justify-between gap-3">
      <h3 class="font-display text-base font-semibold text-ink">
        <span class="num">{{ currentYear }}</span> Nominal Roll Summary
      </h3>
    </div>

    <div class="mt-4 flex flex-1 items-center gap-6">
      <!-- Legend -->
      <ul class="flex min-w-0 flex-1 flex-col divide-y divide-rule text-sm">
        <!-- Only statuses anyone actually holds, with the count. Listing all eight against a
             single member was eight lines of noise that said nothing. -->
        <li v-for="s in presentSlices" :key="s.label" class="flex items-center gap-2 py-1.5">
          <span
            class="inline-block size-2.5 shrink-0 rounded-xs"
            :style="{ backgroundColor: s.color }"
            aria-hidden="true"
          ></span>
          <span class="truncate text-ink">{{ s.label }}</span>
          <span class="num ml-auto pl-3 font-semibold text-ink-muted">{{ s.value }}</span>
        </li>
        <li v-if="!presentSlices.length" class="py-1.5 text-ink-muted">No members yet</li>
      </ul>

      <!-- Pie -->
      <div class="relative ml-auto shrink-0">
        <svg
          viewBox="0 0 200 200"
          class="size-40 sm:size-44"
          role="img"
          :aria-label="`Member status distribution for ${currentYear}`"
        >
          <g v-if="totalCount > 0" class="stroke-surface" stroke-width="1.5">
            <template v-for="(a, i) in arcs" :key="i">
              <circle v-if="a.full" cx="100" cy="100" r="90" :fill="a.color" />
              <path v-else :d="a.path" :fill="a.color" stroke-linejoin="round" />
            </template>
            <text
              v-for="(a, i) in arcs"
              :key="`label-${i}`"
              :x="a.labelX"
              :y="a.labelY"
              text-anchor="middle"
              dominant-baseline="central"
              class="pie-label num"
              stroke="none"
              :style="{
                fill: a.color === '#c08a2e' ? '#172131' : '#ffffff',
                fontSize: a.pct >= 5 ? '11px' : '9px',
              }"
            >
              {{ a.pct }}%
            </text>
          </g>
          <g v-else>
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="#1e293b"
              stroke="#334155"
              stroke-width="1"
              class="fill-surface-sunken stroke-rule-strong"
              stroke-dasharray="4 4"
            />
            <text
              x="100"
              y="100"
              text-anchor="middle"
              dominant-baseline="central"
              fill="#94a3b8"
              class="fill-ink-subtle text-xs"
            >
              No data
            </text>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pie-label {
  font-weight: 600;
  font-family: var(--font-sans);
}
</style>
