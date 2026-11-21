<script setup lang="ts">
const membersStore = useMembersStore()
const { exportCSV } = useExportCSV()
// Absences come from the Sunday register, not from `Member.absenceCount` — nothing ever wrote to
// that field, so this table showed nobody however long people had been away.
const { backsliders, absencesFor, BACKSLIDER_THRESHOLD } = useAbsenceTracking()

const search = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return backsliders.value.filter(
    (m) => !q || m.name.toLowerCase().includes(q) || m.phone.includes(q)
  )
})

const { page, total, totalPages, paginated, rangeStart, rangeEnd } = usePagination(filtered, 5)

function doExport() {
  exportCSV(
    backsliders.value.map((m) => ({
      Name: m.name,
      Phone: m.phone,
      'Consecutive Sundays Missed': absencesFor(m.id),
      Status: m.status,
    })),
    'backsliders'
  )
}
</script>

<template>
  <Card padding="none" class="overflow-hidden">
    <div
      class="flex flex-col justify-between gap-3 border-b border-rule px-5 py-4 sm:flex-row sm:items-center"
    >
      <div class="min-w-0">
        <h3 class="font-sans text-base font-semibold text-ink">
          Backslider Summary - Members Needing Follow-up
        </h3>
        <p class="mt-0.5 text-xs text-ink-muted">
          Members who have missed <span class="num">{{ BACKSLIDER_THRESHOLD }}</span> or more Sunday
          services in a row
        </p>
      </div>
      <button
        class="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border border-rule-strong bg-surface px-3 text-[13px] font-semibold text-ink transition-colors duration-150 hover:border-ink-subtle hover:bg-surface-muted"
        :aria-label="`Export ${filtered.length} backsliders to CSV`"
        @click="doExport"
      >
        <Icon icon="mdi:upload-outline" class="text-base text-ink-subtle" aria-hidden="true" />
        Export CSV
      </button>
    </div>

    <div class="flex gap-2 border-b border-rule bg-surface-muted/60 px-5 py-3">
      <div class="relative flex-1">
        <Icon
          icon="mdi:magnify"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base text-ink-subtle"
          aria-hidden="true"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search here..."
          class="min-h-9 w-full rounded-md border border-rule-strong bg-surface py-1.5 pr-3 pl-9 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          aria-label="Search backsliders"
        />
      </div>
      <Button variant="secondary" size="sm">
        <template #icon-left><Icon icon="mdi:filter-variant" class="text-base" /></template>
        Filter
      </Button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm" role="table">
        <thead class="sticky top-0 z-[1] bg-surface-muted">
          <tr>
            <th
              scope="col"
              class="px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase border-b border-rule w-12 text-right"
            >
              S/N
            </th>
            <th
              scope="col"
              class="px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase border-b border-rule"
            >
              Name
            </th>
            <th
              scope="col"
              class="px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase border-b border-rule"
            >
              Phone Number
            </th>
            <th
              scope="col"
              class="px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase border-b border-rule"
            >
              Consecutive Absences
            </th>
            <th
              scope="col"
              class="px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase border-b border-rule"
            >
              Action Required
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-rule">
          <tr
            v-for="(member, idx) in paginated"
            :key="member.id"
            class="transition-colors duration-150 hover:bg-surface-muted/70"
          >
            <td class="num px-4 py-3 text-right text-ink-subtle">{{ rangeStart + idx }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <Avatar :src="member.avatar" :name="member.name" size="sm" />
                <span class="font-medium whitespace-nowrap text-ink">{{ member.name }}</span>
              </div>
            </td>
            <td class="num px-4 py-3 whitespace-nowrap text-ink-muted">{{ member.phone }}</td>
            <td class="px-4 py-3">
              <Badge variant="danger" size="sm" class="num">
                <template #icon>
                  <Icon icon="mdi:alert-circle-outline" class="text-[11px]" aria-hidden="true" />
                </template>
                {{ absencesFor(member.id) }} Sundays missed
              </Badge>
            </td>
            <td class="px-4 py-3">
              <a
                :href="`tel:${member.phone}`"
                class="inline-flex items-center gap-1 text-sm font-medium whitespace-nowrap text-primary-ink underline-offset-3 hover:text-primary-hover hover:underline"
                :aria-label="`Contact ${member.name}`"
              >
                <Icon icon="mdi:phone-outline" class="text-sm" aria-hidden="true" />
                Contact member
              </a>
            </td>
          </tr>
          <tr v-if="membersStore.loading && !paginated.length">
            <td colspan="5" class="px-4">
              <LoadingState :rows="4" size="sm" title="Loading members…" />
            </td>
          </tr>
          <tr v-else-if="!paginated.length">
            <td colspan="5" class="px-4">
              <EmptyState
                icon="mdi:account-check-outline"
                size="sm"
                title="No members needing follow-up"
                description="Members with three or more absences are listed here."
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      v-model:page="page"
      :total-pages="totalPages"
      :total="total"
      :range-start="rangeStart"
      :range-end="rangeEnd"
      label="members"
    />
  </Card>
</template>
