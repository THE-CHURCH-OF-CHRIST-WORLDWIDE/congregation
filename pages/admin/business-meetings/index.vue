<script setup lang="ts">
import type { BusinessMeeting } from '~/types/businessMeetings'
import {
  MINUTES_EDITOR_ROLES,
  MINUTES_MANAGER_ROLES,
  formatMeetingDate,
  meetingTypeLabel,
  openActionPoints,
} from '~/utils/businessMeetings'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Business Meetings', description: 'Minutes of church business meetings.' })

const { setHeader } = usePageHeader()
const store = useBusinessMeetingsStore()
const authStore = useAuthStore()

onMounted(() => {
  setHeader('Business Meetings', 'Minutes, decisions and follow-ups from business meetings')
  store.load()
})

const canEdit = computed(() =>
  (MINUTES_EDITOR_ROLES as readonly string[]).includes(authStore.roleId ?? '')
)
const canManage = computed(() =>
  (MINUTES_MANAGER_ROLES as readonly string[]).includes(authStore.roleId ?? '')
)

// ── Filters ────────────────────────────────────────────────────────────────
const search = ref('')
const year = ref('all')
const status = ref<'all' | 'draft' | 'approved'>('all')

const yearOptions = computed(() => [
  { label: 'All years', value: 'all' },
  ...[...new Set(store.meetings.map((m) => m.date.slice(0, 4)).filter(Boolean))]
    .sort()
    .reverse()
    .map((y) => ({ label: y, value: y })),
])
const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Approved', value: 'approved' },
]

/** Search covers what a secretary would remember: the title, people, and what was decided. */
function haystack(m: BusinessMeeting) {
  return [
    m.title,
    m.venue,
    m.chairperson,
    m.secretary,
    ...[...m.agendaItems, ...m.mattersArising, ...m.reports, ...m.otherBusiness].flatMap((i) => [
      i.title,
      i.resolution,
    ]),
  ]
    .join(' ')
    .toLowerCase()
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return store.meetings.filter(
    (m) =>
      (year.value === 'all' || m.date.startsWith(year.value)) &&
      (status.value === 'all' || m.status === status.value) &&
      (!q || haystack(m).includes(q))
  )
})

const {
  page,
  total,
  totalPages,
  paginated,
  rangeStart: from,
  rangeEnd: to,
} = usePagination(filtered, 15)

function decisionsCount(m: BusinessMeeting) {
  return [...m.agendaItems, ...m.mattersArising, ...m.reports, ...m.otherBusiness].filter((i) =>
    i.resolution.trim()
  ).length
}

// ── Summary ────────────────────────────────────────────────────────────────
const drafts = computed(() => store.meetings.filter((m) => m.status === 'draft').length)
const followUps = computed(() => openActionPoints(store.meetings))
const today = new Date().toISOString().slice(0, 10)
const overdue = computed(() => followUps.value.filter((a) => a.dueDate && a.dueDate < today))

// ── Delete ─────────────────────────────────────────────────────────────────
const { confirmDelete } = useConfirm()
async function remove(m: BusinessMeeting) {
  const ok = await confirmDelete(`the minutes of ${formatMeetingDate(m.date) || m.title}`, {
    message: 'The whole record — attendance, decisions and action points — is removed for good.',
  })
  if (ok) await store.remove(m).catch(() => {})
}
</script>

<template>
  <div class="space-y-6">
    <Teleport v-if="canEdit" defer to="#admin-header-actions">
      <Button @click="navigateTo('/admin/business-meetings/new')">
        Record Minutes
        <template #icon-right><Icon icon="mdi:plus" /></template>
      </Button>
    </Teleport>

    <!-- Summary -->
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-sm border border-rule bg-surface p-4">
        <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Meetings</p>
        <p class="num mt-1 font-display text-3xl text-ink">{{ store.meetings.length }}</p>
      </div>
      <div class="rounded-sm border border-rule bg-surface p-4">
        <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Awaiting approval
        </p>
        <p class="num mt-1 font-display text-3xl text-ink">{{ drafts }}</p>
      </div>
      <div class="rounded-sm border border-rule bg-surface p-4">
        <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Open action points
        </p>
        <p class="num mt-1 font-display text-3xl text-ink">
          {{ followUps.length }}
          <span v-if="overdue.length" class="ml-1 align-middle font-sans text-sm text-error">
            {{ overdue.length }} overdue
          </span>
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="flex flex-col gap-3 rounded-sm border border-rule bg-surface p-3 sm:flex-row sm:items-end"
    >
      <div class="relative w-full sm:max-w-xs">
        <Icon
          icon="mdi:magnify"
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-ink-subtle"
          aria-hidden="true"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search titles, people, decisions…"
          class="min-h-10 w-full rounded-md border border-rule-strong bg-surface py-2 pr-3 pl-9 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          aria-label="Search meetings"
        />
      </div>
      <div class="grid grid-cols-2 gap-3 sm:ml-auto sm:w-80">
        <Select v-model="year" :options="yearOptions" label="Year" label-class="sr-only" />
        <Select v-model="status" :options="statusOptions" label="Status" label-class="sr-only" />
      </div>
    </div>

    <LoadingState v-if="store.loading && !store.loaded" :rows="5" />

    <EmptyState
      v-else-if="!store.meetings.length"
      icon="mdi:clipboard-text-clock-outline"
      title="No business meetings recorded yet"
      :description="
        canEdit
          ? 'Record the minutes of your first meeting — attendance, reports, decisions and action points.'
          : 'Minutes appear here once the Secretary records them.'
      "
    >
      <template v-if="canEdit" #action>
        <Button @click="navigateTo('/admin/business-meetings/new')">
          <template #icon-left><Icon icon="mdi:plus" /></template>
          Record Minutes
        </Button>
      </template>
    </EmptyState>

    <section v-else class="overflow-hidden rounded-sm border border-rule bg-surface">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-surface-muted">
            <tr
              class="text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
            >
              <th class="border-b border-rule px-4 py-2.5">Date</th>
              <th class="border-b border-rule px-4 py-2.5">Meeting</th>
              <th class="border-b border-rule px-4 py-2.5">Chairperson</th>
              <th class="border-b border-rule px-4 py-2.5 text-right">Present</th>
              <th class="border-b border-rule px-4 py-2.5 text-right">Decisions</th>
              <th class="border-b border-rule px-4 py-2.5">Status</th>
              <th class="border-b border-rule px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="m in paginated"
              :key="m.id"
              class="border-b border-rule last:border-b-0 hover:bg-surface-muted/60"
            >
              <td class="num px-4 py-3 whitespace-nowrap text-ink">{{ m.date || '—' }}</td>
              <td class="px-4 py-3">
                <NuxtLink
                  :to="`/admin/business-meetings/${m.id}`"
                  class="font-medium text-ink hover:text-primary-ink hover:underline"
                >
                  {{ m.title || 'Business Meeting' }}
                </NuxtLink>
                <p class="text-xs text-ink-muted">{{ meetingTypeLabel(m.meetingType) }}</p>
              </td>
              <td class="px-4 py-3 text-ink-muted">{{ m.chairperson || '—' }}</td>
              <td class="num px-4 py-3 text-right text-ink-muted">{{ m.present.length }}</td>
              <td class="num px-4 py-3 text-right text-ink-muted">{{ decisionsCount(m) }}</td>
              <td class="px-4 py-3">
                <Badge :variant="m.status === 'approved' ? 'success' : 'warning'" size="sm">
                  <Icon
                    :icon="m.status === 'approved' ? 'mdi:lock-outline' : 'mdi:pencil-outline'"
                  />
                  {{ m.status === 'approved' ? 'Approved' : 'Draft' }}
                </Badge>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink
                    :to="`/admin/business-meetings/${m.id}`"
                    class="inline-flex size-8 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-sunken hover:text-ink"
                    :aria-label="
                      canEdit && m.status === 'draft' ? `Edit ${m.title}` : `View ${m.title}`
                    "
                    :title="canEdit && m.status === 'draft' ? 'Edit' : 'View'"
                  >
                    <Icon
                      :icon="
                        canEdit && m.status === 'draft' ? 'mdi:pencil-outline' : 'mdi:eye-outline'
                      "
                    />
                  </NuxtLink>
                  <NuxtLink
                    :to="`/admin/business-meetings/${m.id}/print`"
                    target="_blank"
                    class="inline-flex size-8 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-sunken hover:text-ink"
                    :aria-label="`Print ${m.title}`"
                    title="Print / PDF"
                  >
                    <Icon icon="mdi:printer-outline" />
                  </NuxtLink>
                  <button
                    v-if="canManage"
                    type="button"
                    class="inline-flex size-8 items-center justify-center rounded-md text-ink-subtle hover:bg-error-soft hover:text-error"
                    :aria-label="`Delete ${m.title}`"
                    title="Delete"
                    @click="remove(m)"
                  >
                    <Icon icon="mdi:trash-can-outline" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="7" class="px-4 py-10 text-center text-sm text-ink-subtle">
                No meetings match these filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination
        v-if="totalPages > 1"
        v-model:page="page"
        :total-pages="totalPages"
        :total="total"
        :range-start="from"
        :range-end="to"
        label="meetings"
      />
    </section>

    <!-- Follow-ups across every meeting -->
    <section v-if="followUps.length" class="rounded-sm border border-rule bg-surface">
      <header class="border-b border-rule px-4 py-3">
        <h2 class="text-sm font-semibold text-ink">Open action points</h2>
        <p class="text-xs text-ink-muted">
          Everything agreed but not yet marked done, newest meeting first.
        </p>
      </header>
      <ul class="divide-y divide-rule">
        <li
          v-for="a in followUps.slice(0, 10)"
          :key="`${a.meetingId}-${a.id}`"
          class="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3 text-sm"
        >
          <span class="min-w-0 flex-1 text-ink">{{ a.task }}</span>
          <span class="text-ink-muted">{{ a.assignedTo || 'Unassigned' }}</span>
          <span
            class="num text-xs"
            :class="a.dueDate && a.dueDate < today ? 'font-semibold text-error' : 'text-ink-subtle'"
          >
            {{ a.dueDate ? `Due ${a.dueDate}` : 'No due date' }}
          </span>
          <NuxtLink
            :to="`/admin/business-meetings/${a.meetingId}#actions`"
            class="text-xs font-medium text-primary-ink hover:underline"
          >
            {{ a.meetingDate }}
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
