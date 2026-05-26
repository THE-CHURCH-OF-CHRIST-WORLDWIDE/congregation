<script setup lang="ts">
import { SERVICE_CONFIGS } from '~/constants'

interface Props {
  year?: string | number
}
const props = withDefaults(defineProps<Props>(), {
  year: () => String(new Date().getFullYear()),
})

const attendanceStore = useAttendanceStore()

const rows = computed(() => {
  const yr = String(props.year)
  return SERVICE_CONFIGS.map((cfg) => {
    const recs = attendanceStore.records.filter(
      (r) => r.serviceType === cfg.name && r.date.startsWith(yr)
    )
    const total = recs.length
    const present = recs.filter((r) => r.present).length
    const rate = total ? Math.round((present / total) * 100) : 0
    return { name: cfg.name, rate }
  })
})
</script>

<template>
  <Card>
    <h3 class="text-base font-semibold text-gray-900 mb-5">
      Attendance Performance per Activity for {{ year }}
    </h3>

    <div class="flex flex-col gap-4">
      <div v-for="row in rows" :key="row.name">
        <div class="flex items-center justify-between text-sm mb-1.5">
          <span class="text-gray-700">{{ row.name }}</span>
          <span class="font-semibold" style="color: #0ba5ec">{{ row.rate }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" :style="{ width: `${row.rate}%` }"></div>
        </div>
      </div>
    </div>
  </Card>
</template>
