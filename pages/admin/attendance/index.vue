<script setup lang="ts">
import type { ChartData } from 'chart.js'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Attendance', description: 'Church attendance tracker and analytics.' })

const { setHeader } = usePageHeader()
const attendanceStore = useAttendanceStore()
const { exportCSV } = useExportCSV()

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

onMounted(() => {
  setHeader('Attendance Tracker', 'Attendance summaries by activity')
})

const lineChartData = computed<ChartData<'line'>>(() => {
  const monthly = attendanceStore.monthlyPresenceCounts
  return {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: 'Members Listed',
        data: monthly.map((m) => m.listedCount / 4),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: 'Number Present',
        data: monthly.map((m) => m.presentCount / 4),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  }
})

const currentYear = String(new Date().getFullYear())

function doExport() {
  exportCSV(
    attendanceStore.monthlyPresenceCounts.map((m, i) => ({
      Month: MONTH_LABELS[i],
      Sessions: m.totalSessions,
      Present: m.presentCount,
      Listed: m.listedCount,
      'Rate %': m.listedCount ? Math.round((m.presentCount / m.listedCount) * 100) : 0,
    })),
    'attendance-summary'
  )
}

function doImport() {
  const el = document.createElement('input')
  el.type = 'file'
  el.accept = '.csv'
  el.click()
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Action buttons -->
    <div class="flex justify-end gap-2">
      <Button variant="secondary" size="sm" @click="doExport">
        <template #icon-left><Icon icon="mdi:upload-outline" /></template>
        Export CSV
      </Button>
      <Button variant="secondary" size="sm" @click="doImport">
        <template #icon-left><Icon icon="mdi:download-outline" /></template>
        Import CSV
      </Button>
    </div>

    <!-- Annual Summary -->
    <AttendanceSummary />

    <!-- Chart + Performance -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card class="xl:col-span-2">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Monthly Attendance Trend</h3>
        <LineChart :data="lineChartData" :height="260" />
      </Card>

      <AttendancePerformance :year="currentYear" />
    </div>

    <!-- Check-in buttons -->
    <div class="flex gap-3">
      <Button variant="secondary">
        <template #icon-left><Icon icon="mdi:qrcode-scan" /></template>
        QR Check-In
      </Button>
      <Button variant="secondary">
        <template #icon-left><Icon icon="mdi:fingerprint" /></template>
        Fingerprint Sync
      </Button>
    </div>

    <!-- Monthly grid -->
    <MonthlyGrid />
  </div>
</template>
