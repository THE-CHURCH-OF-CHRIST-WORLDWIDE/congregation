<script setup lang="ts">
interface Slice {
  label: string
  value: number
  color: string
}

const membersStore = useMembersStore()
const currentYear = new Date().getFullYear()

const slices = computed<Slice[]>(() => {
  const m = membersStore.members
  const buckets: Slice[] = [
    {
      label: 'Active',
      value: m.filter((x) => x.status === 'Active').length,
      color: '#e5e7eb',
    },
    {
      label: 'Backsliders',
      value: m.filter((x) => x.status === 'Backslider').length,
      color: '#7dd3fc',
    },
    {
      label: 'Distant',
      value: m.filter((x) => x.status === 'Distant').length,
      color: '#38bdf8',
    },
    {
      label: 'Withdrawal/Transfer',
      value: m.filter((x) => x.status === 'Withdrawal' || x.status === 'Transfer').length,
      color: '#0ea5e9',
    },
    {
      label: 'Weak',
      value: m.filter((x) => x.status === 'Weak').length,
      color: '#0284c7',
    },
    {
      label: 'Late',
      value: m.filter((x) => x.status === 'Late').length,
      color: '#0369a1',
    },
  ]
  return buckets
})

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
      const largeArc = sweep > Math.PI ? 1 : 0
      const path = `M ${cx} ${cy} L ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY} Z`
      // Label position: 65% out from center along the slice's midpoint angle
      const midAngle = angle + sweep / 2
      const labelR = r * 0.6
      const labelX = cx + labelR * Math.cos(midAngle)
      const labelY = cy + labelR * Math.sin(midAngle)
      const pct = Math.round(portion * 100)
      angle = endAngle
      return { ...s, path, labelX, labelY, pct }
    })
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl p-6 text-white"
    style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f3a5f 100%)"
  >
    <h3 class="text-lg font-semibold leading-snug mb-5">{{ currentYear }} Nominal Role Summary</h3>

    <div class="flex items-center gap-6">
      <!-- Legend -->
      <ul class="flex flex-col gap-2 text-sm">
        <li v-for="s in slices" :key="s.label" class="flex items-center gap-2">
          <span
            class="inline-block h-2.5 w-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: s.color }"
            aria-hidden="true"
          ></span>
          <span class="text-white/90">{{ s.label }}</span>
        </li>
      </ul>

      <!-- Pie -->
      <div class="relative ml-auto">
        <svg
          viewBox="0 0 200 200"
          class="h-44 w-44"
          role="img"
          :aria-label="`Member status distribution for ${currentYear}`"
        >
          <g v-if="totalCount > 0">
            <path v-for="(a, i) in arcs" :key="i" :d="a.path" :fill="a.color" />
            <text
              v-for="(a, i) in arcs"
              :key="`label-${i}`"
              :x="a.labelX"
              :y="a.labelY"
              text-anchor="middle"
              dominant-baseline="central"
              class="pie-label"
              :style="{
                fill: a.color === '#e5e7eb' ? '#0ba5ec' : '#ffffff',
                fontSize: a.pct >= 5 ? '11px' : '9px',
              }"
            >
              {{ a.pct }}%
            </text>
          </g>
          <g v-else>
            <circle cx="100" cy="100" r="90" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <text x="100" y="100" text-anchor="middle" dominant-baseline="central" fill="#94a3b8">
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
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}
</style>
