<script setup lang="ts">
import { serviceBySlug } from '~/constants'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const { setHeader } = usePageHeader()
const route = useRoute()

const slug = computed(() => String(route.params.service))
const month = computed(() => String(route.query.month ?? '2025-12'))

// Resolve the slug to a canonical service. Falls back to a title-cased version
// of the slug if it's unknown so the page still renders something coherent.
const serviceConfig = computed(() => serviceBySlug(slug.value))

const serviceLabel = computed(() => {
  const cfg = serviceConfig.value
  if (cfg) return cfg.name
  return slug.value
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
})

const dayOfWeek = computed(() => serviceConfig.value?.dayOfWeek ?? 0)

const monthLabel = computed(() => {
  const year = parseInt(month.value.substring(0, 4), 10)
  const mon = parseInt(month.value.substring(5, 7), 10)
  return formatDate(new Date(year, mon - 1), 'monthYear')
})

function applyHeader() {
  setHeader(
    `${serviceLabel.value} Attendance — ${monthLabel.value}`,
    `Showing summary and daily attendance for ${serviceLabel.value} in ${monthLabel.value}`
  )
}

onMounted(applyHeader)
watch([serviceLabel, monthLabel], applyHeader)

useSeoMeta({
  title: computed(() => `${serviceLabel.value} Attendance`),
  description: computed(() => `Attendance records for ${serviceLabel.value} — ${monthLabel.value}`),
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <AttendanceTable :service-type="serviceLabel" :month="month" :day-of-week="dayOfWeek" />
  </div>
</template>
