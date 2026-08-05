<script setup lang="ts">
import { SERVICE_CONFIGS, serviceByName } from '~/constants'

const attendanceStore = useAttendanceStore()

const serviceOptions = SERVICE_CONFIGS.map((s) => s.name)

const selectedService = ref<string>(serviceOptions[0]!)
const selectedYear = ref(String(new Date().getFullYear()))

// Build year options dynamically from the records that actually exist, so the
// dropdown surfaces years the user has data for (plus the current year).
const yearOptions = computed(() => {
  const years = new Set<string>()
  for (const r of attendanceStore.records) {
    if (r.date && r.date.length >= 4) years.add(r.date.slice(0, 4))
  }
  years.add(String(new Date().getFullYear()))
  return [...years].sort((a, b) => Number(b) - Number(a))
})

// A selected year that is not among the options renders as a blank select — which is what a
// hardcoded '2025' did once the 2025 records went away.
watch(
  yearOptions,
  (options) => {
    if (!options.includes(selectedYear.value)) selectedYear.value = options[0]!
  },
  { immediate: true }
)

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const monthlyData = computed(() =>
  attendanceStore.monthlyByService(selectedService.value, selectedYear.value).map((d, i) => ({
    ...d,
    label: months[i]!,
  }))
)

const serviceSlug = computed(
  () =>
    serviceByName(selectedService.value)?.slug ??
    selectedService.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
)

const hasRecordsForSelection = computed(() => monthlyData.value.some((m) => m.total > 0))

const headerText = computed(
  () => `Showing 12 months of ${selectedService.value} attendance for ${selectedYear.value}`
)
</script>

<template>
  <Card>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <p class="text-sm font-medium text-gray-700">{{ headerText }}</p>
      <div class="flex gap-2">
        <select
          v-model="selectedService"
          class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="Select service"
        >
          <option v-for="s in serviceOptions" :key="s" :value="s">{{ s }}</option>
        </select>
        <select
          v-model="selectedYear"
          class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="Select year"
        >
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <p
      v-if="!hasRecordsForSelection"
      class="mb-4 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm text-blue-900"
    >
      <Icon icon="mdi:information-outline" class="mt-0.5 shrink-0" />
      <span>
        Nothing recorded for {{ selectedService }} in {{ selectedYear }} yet. Open any month below
        to mark its register — the summaries here fill in as you do.
      </span>
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="month in monthlyData"
        :key="month.month"
        class="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 hover:border-blue-200 transition-colors"
      >
        <!-- Header: Month Year + menu -->
        <!-- The card's only action is "View Details" at the foot of it, so no
             overflow menu here — an empty one is worse than none. -->
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-gray-900">{{ month.label }} {{ selectedYear }}</h4>
        </div>

        <!-- Service + percentage + progress -->
        <div class="mb-4">
          <div class="flex items-center justify-between text-sm mb-1.5">
            <span class="text-gray-700">{{ selectedService }}</span>
            <span class="font-semibold" style="color: #0ba5ec">{{ month.rate }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: `${month.rate}%` }"></div>
          </div>
        </div>

        <!-- Stat boxes -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="rounded-xl bg-blue-50/60 p-3">
            <p class="text-xs text-gray-500">Sessions</p>
            <p class="mt-1 text-lg font-bold text-gray-900">{{ month.sessions }}</p>
          </div>
          <div class="rounded-xl bg-blue-50/60 p-3">
            <p class="text-xs text-gray-500">Present</p>
            <p class="mt-1 text-lg font-bold text-gray-900">{{ month.present }}</p>
          </div>
        </div>

        <!-- View Details CTA -->
        <NuxtLink
          :to="`/admin/attendance/${serviceSlug}?month=${month.month}`"
          class="view-details-btn mt-auto inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
          :aria-label="`${month.sessions ? 'View' : 'Mark'} ${selectedService} attendance for ${month.label} ${selectedYear}`"
        >
          {{ month.sessions ? 'View details' : 'Mark register' }}
          <Icon icon="mdi:arrow-right" class="text-base" />
        </NuxtLink>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.view-details-btn {
  border-color: #0ba5ec;
  color: #0ba5ec;
}
.view-details-btn:hover {
  background-color: rgba(11, 165, 236, 0.08);
}
</style>
