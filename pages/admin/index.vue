<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Dashboard', description: 'Church of Christ admin dashboard overview.' })

const { setHeader } = usePageHeader()
const attendanceStore = useAttendanceStore()
const membersStore = useMembersStore()

const chartMode = ref<'weekly' | 'monthly'>('monthly')
const chartService = ref('Sunday Worship')

const serviceOptions = ['Sunday Worship', 'Sunday School', 'Bible Class', 'Prayer Meeting']

// ─── Live chart data reacts to both chartMode and chartService ─────────────
const chartTitle = computed(() =>
  chartMode.value === 'monthly' ? 'Monthly Attendance Trend' : 'Weekly Attendance Trend'
)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

const SUMMARY_SERVICE = 'Sunday Worship'

/**
 * Figures come from recorded attendance; see `useAttendanceSummary`. Anything with no records
 * renders as "—" rather than a made-up number — these cards used to show hardcoded percentages.
 */
const summary = useAttendanceSummary(SUMMARY_SERVICE)
const noAttendanceYet = computed(() => !summary.hasData.value)

onMounted(() => {
  setHeader(
    `Welcome - ${greeting.value}`,
    `Membership and ${SUMMARY_SERVICE} attendance at a glance`
  )
})

const statsCards = computed(() => [
  {
    title: 'Total members',
    value: membersStore.members.length,
    // No badge: nothing records how the roll changed month to month yet.
    subtitle: `${membersStore.activeCount} active`,
    sparkColor: '#93c5fd',
  },
  {
    title: 'Attendance this month',
    value: summary.thisMonthRate.value === null ? '—' : `${summary.thisMonthRate.value}%`,
    subtitle:
      summary.thisMonthRate.value === null
        ? `No ${summary.monthLabel} records`
        : summary.monthLabel,
    change: summary.monthOnMonthChange.value,
    changeLabel: 'Compared to last month',
    sparkValues: summary.rateTrend.value,
    sparkColor: '#6ee7b7',
  },
  {
    title: 'Average weekly attendance',
    value: summary.averageWeekly.value === null ? '—' : summary.averageWeekly.value,
    subtitle: summary.averageWeekly.value === null ? 'No sessions recorded' : 'People per session',
    sparkColor: '#a5b4fc',
  },
  {
    title: 'Attendance rate this year',
    value: summary.annualRate.value === null ? '—' : `${summary.annualRate.value}%`,
    subtitle:
      summary.annualRate.value === null ? `No ${summary.year} records` : `Across ${summary.year}`,
    sparkValues: summary.rateTrend.value,
    sparkColor: '#fca5a5',
  },
])

const barChartData = computed<ChartData<'bar'>>(() => {
  if (chartMode.value === 'monthly') {
    // Rolling 12 months rather than Jan–Dec: a calendar year empties the chart every 1 January.
    const data = attendanceStore.rollingMonthsByService(chartService.value)
    return {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: 'Present',
          data: data.map((d) => d.present),
          backgroundColor: data.map((_, i) => (i === data.length - 1 ? '#2563eb' : '#bfdbfe')),
          borderRadius: 4,
        },
        {
          label: 'Absent',
          data: data.map((d) => d.total - d.present),
          backgroundColor: data.map((_, i) => (i === data.length - 1 ? '#f87171' : '#fecaca')),
          borderRadius: 4,
        },
      ],
    }
  } else {
    const data = attendanceStore.weeklyByService(chartService.value)
    return {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: 'Present',
          data: data.map((d) => d.present),
          backgroundColor: data.map((_, i) => (i === data.length - 1 ? '#2563eb' : '#bfdbfe')),
          borderRadius: 4,
        },
        {
          label: 'Absent',
          data: data.map((d) => d.total - d.present),
          backgroundColor: data.map((_, i) => (i === data.length - 1 ? '#f87171' : '#fecaca')),
          borderRadius: 4,
        },
      ],
    }
  }
})

const barOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        afterBody(items) {
          const present = items.find((i) => i.dataset.label === 'Present')?.parsed.y ?? 0
          const absent = items.find((i) => i.dataset.label === 'Absent')?.parsed.y ?? 0
          const total = present + absent
          return total ? [`Rate: ${Math.round((present / total) * 100)}%`] : []
        },
      },
    },
  },
  scales: {
    x: { stacked: false, grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 } }, beginAtZero: true },
  },
}))
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Stats row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatsCard v-for="card in statsCards" :key="card.title" v-bind="card" />
    </div>

    <!-- Say why three of the four cards are blank, and where to fix it. -->
    <NuxtLink
      v-if="noAttendanceYet"
      to="/admin/attendance"
      class="flex items-start gap-2.5 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-700"
    >
      <Icon icon="mdi:calendar-plus-outline" class="mt-0.5 shrink-0 text-gray-400" />
      <span>
        No {{ SUMMARY_SERVICE }} attendance has been recorded yet, so the attendance figures are
        empty. <span class="font-medium">Record a service</span> and they will fill in.
      </span>
    </NuxtLink>

    <!-- Attendance chart + Recent video uploads, side-by-side -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card class="xl:col-span-2">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900">{{ chartTitle }}</h3>
            <div class="flex items-center gap-4 mt-2">
              <label class="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input v-model="chartMode" type="radio" value="weekly" class="accent-blue-600" />
                Weekly
              </label>
              <label class="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input v-model="chartMode" type="radio" value="monthly" class="accent-blue-600" />
                Monthly
              </label>
            </div>
          </div>
          <select
            v-model="chartService"
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 flex-shrink-0"
            aria-label="Select service type"
          >
            <option v-for="s in serviceOptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <BarChart
          v-if="attendanceStore.records.length"
          :key="`${chartMode}-${chartService}`"
          :data="barChartData"
          :options="barOptions"
          :height="240"
        />
        <EmptyState
          v-else
          icon="mdi:chart-bar"
          title="No attendance recorded yet"
          description="This chart fills in as registers are marked each week."
        />
      </Card>
      <RecentVideoUploads />
    </div>

    <!-- Backslider table + Recent sermon uploads, side-by-side -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div class="xl:col-span-2">
        <BacksliderTable />
      </div>
      <RecentUploads />
    </div>
  </div>
</template>
