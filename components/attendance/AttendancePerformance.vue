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
  <Card padding="lg">
    <h3 class="mb-5 font-sans text-base font-semibold text-ink">
      Attendance Performance per Activity for <span class="num">{{ year }}</span>
    </h3>

    <EmptyState
      v-if="!attendanceStore.records.length"
      icon="mdi:chart-timeline-variant"
      size="sm"
      title="No attendance recorded yet"
      description="Per-activity rates appear once registers have been marked."
    />

    <div v-else class="flex flex-col gap-4">
      <div v-for="row in rows" :key="row.name">
        <div class="mb-1.5 flex items-center justify-between gap-3 text-sm">
          <span class="text-ink-muted">{{ row.name }}</span>
          <span class="num font-semibold text-ink">{{ row.rate }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" :style="{ width: `${row.rate}%` }"></div>
        </div>
      </div>
    </div>
  </Card>
</template>
