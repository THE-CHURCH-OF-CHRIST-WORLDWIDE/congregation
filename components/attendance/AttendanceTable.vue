<script setup lang="ts">
import type { WorshipDetails } from '~/types'

interface Props {
  serviceType?: string
  month?: string
  /** Day of the week this service meets (0 = Sunday … 6 = Saturday). */
  dayOfWeek?: number
}
const props = withDefaults(defineProps<Props>(), {
  serviceType: 'Sunday Worship',
  // Current month by default; a fixed one renders a register for a month nobody is in.
  month: () => new Date().toISOString().slice(0, 7),
  dayOfWeek: 0,
})

const attendanceStore = useAttendanceStore()
const membersStore = useMembersStore()
const { exportCSV } = useExportCSV()

const searchQuery = ref('')
const hasChanged = ref(false)

// Get every meeting date for this service in this month. Combines:
// 1. The service's scheduled day-of-week (e.g. Wednesdays for Bible Class).
// 2. Any other dates that already have records for this month + service, so
//    off-schedule meetings the user already recorded still get a column.
const sundaysInMonth = computed(() => {
  const year = parseInt(props.month.substring(0, 4), 10)
  const mon = parseInt(props.month.substring(5, 7), 10)
  const dates = new Set<string>()
  const d = new Date(year, mon - 1, 1)
  while (d.getMonth() === mon - 1) {
    // formatDate(_, 'iso') uses local-time components, avoiding the UTC offset
    // bug that toISOString causes — critical so the date strings match the
    // (locally-formatted) dates already in records.
    if (d.getDay() === props.dayOfWeek) dates.add(formatDate(d, 'iso'))
    d.setDate(d.getDate() + 1)
  }
  for (const r of attendanceStore.records) {
    if (r.serviceType === props.serviceType && r.date.startsWith(props.month)) {
      dates.add(r.date)
    }
  }
  return [...dates].sort()
})

const filteredMembers = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return membersStore.members.filter(
    (m) => !q || m.name.toLowerCase().includes(q) || m.phone.includes(q)
  )
})

function isPresent(memberId: string, date: string) {
  return attendanceStore.findRecord(memberId, date, props.serviceType)?.present ?? false
}

// ─── Marking present asks where ──────────────────────────────────────────────
/**
 * What the open `WorshipPlaceModal` will apply its answer to.
 *
 * `dates` is a list because the row menu marks a whole month in one go — one answer covers all of
 * them rather than putting the same dialog in front of the user four times.
 *
 * `revert` puts the checkbox back if the dialog is declined. The box is bound with `:checked`
 * rather than `v-model`, so the browser has already drawn it ticked while the store still says
 * absent; without this it would sit there ticked and unsaved.
 */
const pendingMark = ref<{
  memberId: string
  dates: string[]
  subject: string
  scopeNote: string
  revert: () => void
} | null>(null)

const showWorshipModal = ref(false)

function memberName(memberId: string) {
  return membersStore.members.find((m) => m.id === memberId)?.name ?? 'This member'
}

function toggle(memberId: string, date: string, event: Event) {
  const turningOn = !isPresent(memberId, date)

  if (!turningOn) {
    // Un-marking makes no claim about where anybody worshipped, so it needs no dialog.
    attendanceStore.setAttendance(memberId, date, props.serviceType, false)
    hasChanged.value = true
    return
  }

  const checkbox = event.target as HTMLInputElement
  pendingMark.value = {
    memberId,
    dates: [date],
    subject: `${memberName(memberId)} · ${formatDate(date, 'full')}`,
    scopeNote: '',
    revert: () => {
      checkbox.checked = false
    },
  }
  showWorshipModal.value = true
}

// Both handlers close the dialog themselves rather than leaving it to the child's `v-model` emit.
// The parent owns `pendingMark`, so it owns whether the dialog is open — one of the two going
// stale is how you end up with a dialog that answers for the wrong row.
function onWorshipConfirmed(details: WorshipDetails) {
  const pending = pendingMark.value
  pendingMark.value = null
  showWorshipModal.value = false
  if (!pending) return
  for (const date of pending.dates) {
    attendanceStore.setAttendance(pending.memberId, date, props.serviceType, true, details)
  }
  hasChanged.value = true
}

function onWorshipCancelled() {
  pendingMark.value?.revert()
  pendingMark.value = null
  showWorshipModal.value = false
}

/** The record for a cell, so the sheet can show that a tick came from another congregation. */
function recordFor(memberId: string, date: string) {
  return attendanceStore.findRecord(memberId, date, props.serviceType)
}

function worshippedElsewhere(memberId: string, date: string) {
  const record = recordFor(memberId, date)
  return Boolean(record?.present && record.place === 'elsewhere')
}

/** Hover text naming the congregation, and whether the certificate was actually produced. */
function elsewhereTitle(memberId: string, date: string) {
  const record = recordFor(memberId, date)
  if (!record) return ''
  const where = record.congregation || 'another congregation'
  const certificate = record.certificate
    ? 'certificate of worship produced'
    : 'certificate not yet produced'
  return `Worshipped with ${where} — ${certificate}`
}

// Registers can run to hundreds of names; page them so the sheet stays usable.
const {
  page: attPage,
  total: attTotal,
  totalPages: attTotalPages,
  paginated: pagedMembers,
  rangeStart: attFrom,
  rangeEnd: attTo,
} = usePagination(filteredMembers, 25)

// ─── Per-member row menu ─────────────────────────────────────────────────────
const openRowMenu = ref<string | null>(null)

/**
 * Marks every Sunday in the displayed month for one member in a single go.
 *
 * Asks where once, not once per Sunday — a month of dialogs to record a month of attendance would
 * make the shortcut slower than ticking the boxes. The one answer applies to all of them, which the
 * dialog says plainly so nobody records four services abroad by accident.
 */
function markMonth(memberId: string, present: boolean) {
  openRowMenu.value = null
  const dates = sundaysInMonth.value

  if (!present) {
    for (const date of dates) {
      attendanceStore.setAttendance(memberId, date, props.serviceType, false)
    }
    hasChanged.value = true
    return
  }

  pendingMark.value = {
    memberId,
    dates: [...dates],
    subject: `${memberName(memberId)} · ${dates.length} ${props.serviceType} services`,
    scopeNote: `This answer applies to all ${dates.length} services in ${formatDate(props.month + '-01', 'monthYear')}.`,
    revert: () => {},
  }
  showWorshipModal.value = true
}

onMounted(() => {
  const dismiss = () => {
    openRowMenu.value = null
  }
  document.addEventListener('click', dismiss)
  onUnmounted(() => document.removeEventListener('click', dismiss))
})

function getMonthlySummary(memberId: string) {
  const dates = sundaysInMonth.value
  const sessionsTotal = dates.length
  const sessionsPresent = dates.reduce((n, d) => (isPresent(memberId, d) ? n + 1 : n), 0)
  const percentage = sessionsTotal ? Math.round((sessionsPresent / sessionsTotal) * 100) : 0
  return { sessionsTotal, sessionsPresent, percentage }
}

async function save() {
  try {
    await attendanceStore.saveChanges()
  } catch {
    return // Refused — keep the ticks pending so nothing looks saved that is not.
  }
  hasChanged.value = false
}

function cancel() {
  attendanceStore.cancelChanges()
  hasChanged.value = false
}

function doExport() {
  exportCSV(
    filteredMembers.value.map((m) => {
      const summary = getMonthlySummary(m.id)
      const row: Record<string, unknown> = {
        Name: m.name,
        Phone: m.phone,
        'Sessions Total': summary.sessionsTotal,
        'Sessions Present': summary.sessionsPresent,
        'Attendance %': summary.percentage,
      }
      sundaysInMonth.value.forEach((d) => {
        // Names the congregation in the cell, so an exported register still shows which ticks were
        // earned elsewhere — a bare "Present" would flatten the two back together.
        if (!isPresent(m.id, d)) {
          row[d] = 'Absent'
          return
        }
        const record = recordFor(m.id, d)
        if (record?.place !== 'elsewhere') {
          row[d] = 'Present'
          return
        }
        const where = record.congregation || 'another congregation'
        row[d] = `Present (${where}${record.certificate ? '' : ', certificate pending'})`
      })
      return row
    }),
    `attendance-${props.month}`
  )
}
</script>

<template>
  <div class="flex flex-col gap-0">
    <!-- Controls -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <div class="relative flex-1">
        <Icon
          icon="mdi:magnify"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base"
        />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search members..."
          class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          aria-label="Search attendance"
        />
      </div>
      <div class="flex gap-2">
        <Button variant="secondary" size="sm" @click="doExport">
          <template #icon-left><Icon icon="mdi:upload-outline" /></template>
          Export CSV
        </Button>
        <Button variant="secondary" size="sm">
          <template #icon-left><Icon icon="mdi:download-outline" /></template>
          Import CSV
        </Button>
      </div>
    </div>

    <Card padding="none">
      <div class="overflow-x-auto">
        <table class="w-full text-sm" role="table">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th scope="col" class="text-left px-3 py-2.5 text-xs font-medium text-gray-500 w-10">
                S/N
              </th>
              <th
                scope="col"
                class="text-left px-3 py-2.5 text-xs font-medium text-gray-500 min-w-[140px]"
              >
                Name
              </th>
              <th
                scope="col"
                class="text-left px-3 py-2.5 text-xs font-medium text-gray-500 min-w-[140px]"
              >
                Member Monthly Summary
              </th>
              <th
                v-for="date in sundaysInMonth"
                :key="date"
                scope="col"
                class="text-center px-2 py-2.5 text-xs font-medium text-gray-500 w-16"
              >
                {{ formatDate(date, 'dayMonth') }}
              </th>
              <th scope="col" class="w-8 px-2 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(member, idx) in pagedMembers"
              :key="member.id"
              :class="['border-b border-gray-50', idx % 2 === 0 ? '' : 'bg-gray-50/30']"
            >
              <td class="px-3 py-2.5 text-gray-500">{{ attFrom + idx }}</td>
              <td class="px-3 py-2.5">
                <div class="flex items-center gap-2">
                  <Avatar :src="member.avatar" :name="member.name" size="sm" />
                  <span class="font-medium text-gray-900 text-xs">{{ member.name }}</span>
                </div>
              </td>
              <td class="px-3 py-2.5 min-w-[140px]">
                <div>
                  <div class="flex items-center gap-2 mb-0.5">
                    <div class="progress-bar flex-1">
                      <div
                        class="progress-bar-fill"
                        :style="{ width: `${getMonthlySummary(member.id).percentage}%` }"
                      ></div>
                    </div>
                    <span class="text-[11px] font-medium text-gray-700 w-7 text-right">
                      {{ getMonthlySummary(member.id).percentage }}%
                    </span>
                  </div>
                  <p class="text-[10px] text-gray-400">
                    {{ getMonthlySummary(member.id).sessionsPresent }}/{{
                      getMonthlySummary(member.id).sessionsTotal
                    }}
                  </p>
                </div>
              </td>
              <td v-for="date in sundaysInMonth" :key="date" class="px-2 py-2.5 text-center">
                <span class="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    class="attendance-check"
                    :checked="isPresent(member.id, date)"
                    :aria-label="`${member.name} attendance on ${date}`"
                    @change="toggle(member.id, date, $event)"
                  />
                  <!-- Marks a tick that came from another congregation. Without it the sheet shows
                       an ordinary present and the distinction is invisible once saved. -->
                  <Icon
                    v-if="worshippedElsewhere(member.id, date)"
                    icon="mdi:certificate-outline"
                    class="text-xs text-amber-500"
                    :class="!recordFor(member.id, date)?.certificate && 'opacity-50'"
                    :title="elsewhereTitle(member.id, date)"
                    :aria-label="elsewhereTitle(member.id, date)"
                  />
                </span>
              </td>
              <td class="px-2 py-2.5 relative">
                <button
                  class="text-gray-400 hover:text-gray-600 p-0.5"
                  :aria-label="`More actions for ${member.name}`"
                  :aria-expanded="openRowMenu === member.id"
                  @click.stop="openRowMenu = openRowMenu === member.id ? null : member.id"
                >
                  <Icon icon="mdi:dots-vertical" />
                </button>
                <div
                  v-if="openRowMenu === member.id"
                  class="absolute right-2 top-8 z-10 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                  @click.stop
                >
                  <button
                    class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                    @click="markMonth(member.id, true)"
                  >
                    <Icon icon="mdi:check-all" class="text-green-600" />
                    Mark all present
                  </button>
                  <button
                    class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                    @click="markMonth(member.id, false)"
                  >
                    <Icon icon="mdi:close-box-multiple-outline" class="text-red-500" />
                    Mark all absent
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="membersStore.loading && !pagedMembers.length">
              <td :colspan="4 + sundaysInMonth.length" class="px-4">
                <LoadingState :rows="6" title="Loading register…" />
              </td>
            </tr>
            <tr v-else-if="!pagedMembers.length">
              <td :colspan="4 + sundaysInMonth.length" class="px-4">
                <EmptyState
                  icon="mdi:calendar-check-outline"
                  title="No members to mark"
                  description="Attendance can be recorded once members are on the nominal roll."
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination
        v-model:page="attPage"
        :total-pages="attTotalPages"
        :total="attTotal"
        :range-start="attFrom"
        :range-end="attTo"
        label="members"
      />
    </Card>

    <!-- Sticky footer -->
    <Transition name="fade">
      <div
        v-if="hasChanged"
        class="sticky bottom-4 flex justify-end gap-2 mt-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3"
      >
        <Button :loading="attendanceStore.saving" @click="save">Save Changes</Button>
        <Button variant="secondary" @click="cancel">Cancel</Button>
      </div>
    </Transition>

    <WorshipPlaceModal
      v-model="showWorshipModal"
      :subject="pendingMark?.subject ?? ''"
      :scope-note="pendingMark?.scopeNote ?? ''"
      @confirm="onWorshipConfirmed"
      @cancel="onWorshipCancelled"
    />
  </div>
</template>
