<script setup lang="ts">
import { serviceBySlug } from '~/constants'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const { setHeader } = usePageHeader()
const route = useRoute()

const slug = computed(() => String(route.params.service))
// Falls back to the current month; a hardcoded one shows an empty register in any other month.
const month = computed(() => String(route.query.month ?? new Date().toISOString().slice(0, 7)))

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
    <!--
      A plain link rather than `router.back()`: the grid's service and year are local refs that
      reset on remount, so history would preserve nothing, and a fixed destination also works
      when the register was opened directly from a bookmark or a shared URL.
    -->
    <NuxtLink
      to="/admin/attendance"
      class="inline-flex w-fit items-center gap-1.5 rounded-lg py-1 text-sm text-gray-500 transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
    >
      <Icon icon="mdi:arrow-left" class="text-base" />
      Back to attendance
    </NuxtLink>

    <AttendanceTable :service-type="serviceLabel" :month="month" :day-of-week="dayOfWeek" />
  </div>
</template>
