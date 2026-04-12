<script setup lang="ts">
import type { ServiceAttendanceStats } from '~/types'

const services: ServiceAttendanceStats[] = [
  { serviceType: 'Sunday Worship', count: 600, change: 10, icon: 'mdi:church' },
  { serviceType: "Leaders' Class", count: 150, change: 10, icon: 'mdi:account-tie-outline' },
  { serviceType: 'Sunday School', count: 45823, change: 10, icon: 'mdi:book-education-outline' },
  { serviceType: 'Bible Class', count: 45823, change: 10, icon: 'mdi:bible' },
  { serviceType: 'Evangelism', count: 45823, change: -5, icon: 'mdi:bullhorn-outline' },
  { serviceType: 'Prayer Meeting', count: 45823, change: 10, icon: 'mdi:hands-pray' },
  { serviceType: 'Singing Practice', count: 45823, change: 10, icon: 'mdi:music-note-outline' },
  { serviceType: 'Youth Class', count: 45823, change: 10, icon: 'mdi:account-group-outline' },
]

const selectedYear = ref('2025')
const years = ['2025', '2024', '2023']

function fmt(n: number) {
  return new Intl.NumberFormat('en-NG').format(n)
}
</script>

<template>
  <Card>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-sm font-semibold text-gray-900">Average Annual Attendance</h3>
        <p class="text-xs text-gray-400 mt-0.5">Showing annual attendance summaries by activity</p>
      </div>
      <select
        v-model="selectedYear"
        class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        aria-label="Select year"
      >
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        v-for="svc in services"
        :key="svc.serviceType"
        class="bg-gray-50 rounded-xl p-3"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Icon :icon="svc.icon" class="text-blue-600 text-base" />
          </div>
          <Badge :variant="svc.change >= 0 ? 'success' : 'danger'" size="sm">
            <template #icon>
              <Icon :icon="svc.change >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'" class="text-[10px]" />
            </template>
            {{ Math.abs(svc.change) }}%
          </Badge>
        </div>
        <p class="text-xl font-bold text-gray-900">{{ fmt(svc.count) }}</p>
        <p class="text-xs text-gray-500 mt-0.5 truncate">{{ svc.serviceType }}</p>
      </div>
    </div>
  </Card>
</template>
