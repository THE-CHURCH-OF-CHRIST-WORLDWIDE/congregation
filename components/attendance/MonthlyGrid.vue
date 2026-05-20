<script setup lang="ts">
const attendanceStore = useAttendanceStore()

const serviceOptions = [
  'Sunday Worship',
  'Sunday School',
  'Bible Class',
  'Prayer Meeting',
  'Youth Class',
  "Leaders' Class",
  'Evangelism',
  'Singing Practice',
]

const selectedService = ref(serviceOptions[0]!)
const selectedYear = ref('2025')

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

const serviceSlug = computed(() => selectedService.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))

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

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="month in monthlyData"
        :key="month.month"
        class="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors"
      >
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-gray-800">{{ month.label }}</h4>
          <button class="text-gray-400 hover:text-gray-600">
            <Icon icon="mdi:dots-vertical" />
          </button>
        </div>

        <div class="mb-3">
          <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{{ selectedService }}</span>
            <span class="font-medium">{{ month.rate }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: `${month.rate}%` }"></div>
          </div>
        </div>

        <div class="flex gap-4 text-xs text-gray-600">
          <div>
            <p class="text-gray-400">Sessions</p>
            <p class="font-semibold text-gray-900 text-base">{{ month.sessions }}</p>
          </div>
          <div>
            <p class="text-gray-400">Present</p>
            <p class="font-semibold text-gray-900 text-base">{{ month.present }}</p>
          </div>
          <div>
            <p class="text-gray-400">Total</p>
            <p class="font-semibold text-gray-900 text-base">{{ month.total }}</p>
          </div>
        </div>

        <NuxtLink
          v-if="month.sessions > 0"
          :to="`/admin/attendance/${serviceSlug}?month=${month.month}`"
          class="mt-3 text-xs text-blue-600 hover:underline flex items-center gap-1"
        >
          View Details
          <Icon icon="mdi:arrow-right" class="text-xs" />
        </NuxtLink>
        <p v-else class="mt-3 text-xs text-gray-400">No records yet</p>
      </div>
    </div>
  </Card>
</template>
