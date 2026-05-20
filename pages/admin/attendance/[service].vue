<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const { setHeader } = usePageHeader()
const route = useRoute()

const service = computed(() => String(route.params.service))
const month = computed(() => String(route.query.month ?? '2025-12'))

const monthLabel = computed(() => {
  const year = parseInt(month.value.substring(0, 4), 10)
  const mon = parseInt(month.value.substring(5, 7), 10)
  return formatDate(new Date(year, mon - 1), 'monthYear')
})

const serviceLabel = computed(() =>
  service.value
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
)

onMounted(() => {
  setHeader(
    `${serviceLabel.value} Attendance — ${monthLabel.value}`,
    `Showing summary and daily attendance for all Sundays in ${monthLabel.value}`
  )
})

watch([service, month], () => {
  setHeader(
    `${serviceLabel.value} Attendance — ${monthLabel.value}`,
    `Showing summary and daily attendance for all Sundays in ${monthLabel.value}`
  )
})

useSeoMeta({
  title: computed(() => `${serviceLabel.value} Attendance`),
  description: computed(() => `Attendance records for ${serviceLabel.value} — ${monthLabel.value}`),
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <AttendanceTable :service-type="serviceLabel" :month="month" />
  </div>
</template>
