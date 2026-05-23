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
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

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

onMounted(() => {
  setHeader(
    `Welcome - ${greeting.value}`,
    'Showing summary and daily attendance for all Sundays in December 2025'
  )
})

const sparkBase = [40, 55, 45, 70, 60, 80, 75, 90, 85, 95, 88, 100]

const statsCards = computed(() => [
  {
    title: 'Total Members',
    value: membersStore.members.length,
    subtitle: `${membersStore.activeCount} active`,
    change: 10,
    changeLabel: 'Compared to last month',
    sparkValues: sparkBase,
    sparkColor: '#93c5fd',
  },
  {
    title: 'This month attendance rate',
    value: '75%',
    subtitle: 'Compared to last month',
    change: 10,
    changeLabel: 'Compared to last month',
    sparkValues: [50, 60, 55, 70, 65, 75, 72, 80],
    sparkColor: '#6ee7b7',
  },
  {
    title: 'Average weekly attendance',
    value: '65%',
    subtitle: '',
    change: 10,
    changeLabel: '',
    sparkValues: [40, 50, 45, 60, 55, 65, 62, 70],
    sparkColor: '#a5b4fc',
  },
  {
    title: 'Annual attendance rate',
    value: '85%',
    subtitle: 'Compared to last year',
    change: 10,
    changeLabel: 'Compared to last year',
    sparkValues: [60, 70, 65, 75, 72, 80, 78, 85],
    sparkColor: '#fca5a5',
  },
])

const barChartData = computed<ChartData<'bar'>>(() => {
  const currentMonthIdx = new Date().getMonth()

  if (chartMode.value === 'monthly') {
    const data = attendanceStore.monthlyByService(chartService.value)
    return {
      labels: MONTH_LABELS,
      datasets: [
        {
          label: 'Present',
          data: data.map((d) => d.present),
          backgroundColor: data.map((_, i) => (i === currentMonthIdx ? '#2563eb' : '#bfdbfe')),
          borderRadius: 4,
        },
        {
          label: 'Absent',
          data: data.map((d) => d.total - d.present),
          backgroundColor: data.map((_, i) => (i === currentMonthIdx ? '#f87171' : '#fecaca')),
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
          :key="`${chartMode}-${chartService}`"
          :data="barChartData"
          :options="barOptions"
          :height="240"
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
