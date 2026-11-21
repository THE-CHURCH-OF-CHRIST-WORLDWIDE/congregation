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
  <Card padding="none" class="overflow-hidden">
    <div
      class="flex flex-col justify-between gap-3 border-b border-rule px-5 py-4 sm:flex-row sm:items-center"
    >
      <p class="font-display text-base font-semibold text-ink">{{ headerText }}</p>
      <div class="flex gap-2">
        <select
          v-model="selectedService"
          class="min-h-9 cursor-pointer rounded-md border border-rule-strong bg-surface px-3 py-1.5 text-sm text-ink shadow-xs outline-none transition-[border-color,box-shadow] hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          aria-label="Select service"
        >
          <option v-for="s in serviceOptions" :key="s" :value="s">{{ s }}</option>
        </select>
        <select
          v-model="selectedYear"
          class="num min-h-9 cursor-pointer rounded-md border border-rule-strong bg-surface px-3 py-1.5 text-sm text-ink shadow-xs outline-none transition-[border-color,box-shadow] hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          aria-label="Select year"
        >
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <p
      v-if="!hasRecordsForSelection"
      class="mx-5 mt-4 flex items-start gap-2 rounded-md border border-info/25 bg-info-soft px-4 py-3 text-sm text-info"
    >
      <Icon icon="mdi:information-outline" class="mt-0.5 shrink-0 text-base" />
      <span>
        Nothing recorded for {{ selectedService }} in {{ selectedYear }} yet. Open any month below
        to mark its register — the summaries here fill in as you do.
      </span>
    </p>

    <!-- The year as a ledger: one ruled line per month, month pinned on the left. -->
    <div class="max-h-[70vh] overflow-auto" :class="!hasRecordsForSelection && 'mt-4'">
      <table class="w-full border-separate border-spacing-0 text-[13px]">
        <thead class="sticky top-0 z-[2]">
          <tr>
            <th
              scope="col"
              class="sticky left-0 z-[1] min-w-[150px] border-r border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
            >
              Month
            </th>
            <th
              scope="col"
              class="min-w-[220px] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
            >
              Rate
            </th>
            <th
              scope="col"
              class="border-b border-l border-rule bg-surface-muted px-4 py-2.5 text-right text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
            >
              Sessions
            </th>
            <th
              scope="col"
              class="border-b border-l border-rule bg-surface-muted px-4 py-2.5 text-right text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
            >
              Present
            </th>
            <th scope="col" class="border-b border-l border-rule bg-surface-muted px-4 py-2.5">
              <span class="sr-only">Register</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- The row's only action is the register link at the end of it, so no
               overflow menu here — an empty one is worse than none. -->
          <tr
            v-for="month in monthlyData"
            :key="month.month"
            class="group transition-colors hover:bg-surface-muted/70"
          >
            <th
              scope="row"
              class="sticky left-0 z-[1] border-r border-b border-rule bg-surface px-4 py-2 text-left font-display text-sm font-semibold whitespace-nowrap text-ink transition-colors group-hover:bg-surface-muted"
            >
              {{ month.label }} <span class="num">{{ selectedYear }}</span>
            </th>
            <td class="border-b border-rule px-4 py-2">
              <div class="mb-1 flex items-center justify-between gap-3">
                <span class="truncate text-ink-muted">{{ selectedService }}</span>
                <span class="num font-semibold text-ink">{{ month.rate }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill" :style="{ width: `${month.rate}%` }"></div>
              </div>
            </td>
            <td class="num border-b border-l border-rule px-4 py-2 text-right text-ink">
              {{ month.sessions }}
            </td>
            <td class="num border-b border-l border-rule px-4 py-2 text-right text-ink">
              {{ month.present }}
            </td>
            <td class="border-b border-l border-rule px-3 py-1.5 text-right">
              <NuxtLink
                :to="`/admin/attendance/${serviceSlug}?month=${month.month}`"
                :class="[
                  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-semibold whitespace-nowrap transition-colors duration-150',
                  month.sessions
                    ? 'border border-rule-strong bg-surface text-ink hover:border-ink-subtle hover:bg-surface-muted'
                    : 'bg-primary text-on-primary shadow-xs hover:bg-primary-hover',
                ]"
                :aria-label="`${month.sessions ? 'View' : 'Mark'} ${selectedService} attendance for ${month.label} ${selectedYear}`"
              >
                {{ month.sessions ? 'View details' : 'Mark register' }}
                <Icon icon="mdi:arrow-right" class="text-base" />
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Card>
</template>
