<script setup lang="ts">
import type { ChartData } from 'chart.js'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Attendance', description: 'Church attendance tracker and analytics.' })

const { setHeader } = usePageHeader()
const attendanceStore = useAttendanceStore()
const { exportCSV } = useExportCSV()

/** The trend chart covers one service; the grid below it has its own service selector. */
const TREND_SERVICE = 'Sunday Worship'

// Registers are managed here, so labels written in an earlier session are caught up as soon as
// the roll and the records are both in memory.
useAbsenceTracking().autoSyncWhenReady()

onMounted(() => {
  attendanceStore.load()
  setHeader('Attendance Tracker', 'Attendance summaries by activity')
})

/**
 * Per-session averages, not totals.
 *
 * These lines used to divide by a hard-coded 4 — an assumed four sessions a month. That
 * understated any month with five Sundays, wildly overstated a month with one recorded session,
 * and made the two lines incomparable across months. Divide by the sessions actually recorded.
 *
 * Months with no sessions are `null`, not 0: Chart.js leaves a gap, whereas a zero would draw a
 * line to the floor and read as "nobody attended".
 */
const rollingMonths = computed(() => attendanceStore.rollingMonthsByService(TREND_SERVICE))

const lineChartData = computed<ChartData<'line'>>(() => {
  const monthly = rollingMonths.value

  const perSession = (value: (m: (typeof monthly)[number]) => number) =>
    monthly.map((m) => (m.sessions ? Math.round(value(m) / m.sessions) : null))

  return {
    labels: monthly.map((m) => m.label),
    datasets: [
      {
        label: 'Members listed per session',
        data: perSession((m) => m.total),
        borderColor: '#7a8aa0',
        backgroundColor: 'rgba(122,138,160,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        spanGaps: false,
      },
      {
        label: 'Present per session',
        data: perSession((m) => m.present),
        borderColor: '#2f7a5c',
        backgroundColor: 'rgba(47,122,92,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        spanGaps: false,
      },
    ],
  }
})

/** Nothing across the whole window — show a message instead of two flat empty lines. */
const hasAttendanceData = computed(() => rollingMonths.value.some((m) => m.sessions > 0))

const currentYear = String(new Date().getFullYear())

function doExport() {
  // Mirrors the chart's window, keyed by YYYY-MM — "Jan" alone is ambiguous once the window
  // spans two years.
  exportCSV(
    rollingMonths.value.map((m) => ({
      Month: m.month,
      Sessions: m.sessions,
      Present: m.present,
      Listed: m.total,
      'Rate %': m.rate,
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
  <div class="space-y-6">
    <!-- Action buttons -->
    <div class="flex flex-wrap justify-end gap-2">
      <Button variant="secondary" size="sm" @click="doExport">
        <template #icon-left><Icon icon="mdi:upload-outline" class="text-base" /></template>
        Export CSV
      </Button>
      <Button variant="secondary" size="sm" @click="doImport">
        <template #icon-left><Icon icon="mdi:download-outline" class="text-base" /></template>
        Import CSV
      </Button>
    </div>

    <!-- Annual Summary -->
    <AttendanceSummary />

    <!-- Chart + Performance -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Card class="xl:col-span-2" padding="lg">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="font-display text-base font-semibold text-ink">Monthly Attendance Trend</h3>
            <p class="mt-0.5 text-xs text-ink-muted">
              {{ TREND_SERVICE }} · average per recorded session, last 12 months
            </p>
          </div>
        </div>
        <div class="mt-4">
          <LineChart v-if="hasAttendanceData" :data="lineChartData" :height="260" />
          <EmptyState
            v-else
            icon="mdi:chart-line"
            title="No attendance in the last 12 months"
            description="Record a service and the monthly trend will appear here."
          />
        </div>
      </Card>

      <AttendancePerformance :year="currentYear" />
    </div>

    <!-- Check-in buttons -->
    <div class="flex flex-wrap gap-3">
      <Button variant="secondary">
        <template #icon-left><Icon icon="mdi:qrcode-scan" class="text-base" /></template>
        QR Check-In
      </Button>
      <Button variant="secondary">
        <template #icon-left><Icon icon="mdi:fingerprint" class="text-base" /></template>
        Fingerprint Sync
      </Button>
    </div>

    <!-- Monthly grid -->
    <MonthlyGrid />

    <!-- Visitors and children, recorded per Sunday Worship -->
    <VisitorsAndChildren :service-type="TREND_SERVICE" />
  </div>
</template>
