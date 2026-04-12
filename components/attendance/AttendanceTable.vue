<script setup lang="ts">
interface Props {
  serviceType?: string
  month?: string
}
const props = withDefaults(defineProps<Props>(), {
  serviceType: 'Sunday Worship',
  month: '2025-12',
})

const attendanceStore = useAttendanceStore()
const membersStore = useMembersStore()
const { exportCSV } = useExportCSV()

const searchQuery = ref('')
const hasChanged = ref(false)

// Get all Sundays for this month
const sundaysInMonth = computed(() => {
  const year = parseInt(props.month.substring(0, 4), 10)
  const mon = parseInt(props.month.substring(5, 7), 10)
  const dates: string[] = []
  const d = new Date(year, mon - 1, 1)
  while (d.getMonth() === mon - 1) {
    if (d.getDay() === 0) dates.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return dates
})

const filteredMembers = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return membersStore.members.filter(
    (m) => !q || m.name.toLowerCase().includes(q) || m.phone.includes(q)
  )
})

function getRecord(memberId: string, date: string) {
  return attendanceStore.records.find(
    (r) => r.memberId === memberId && r.date === date && r.serviceType === props.serviceType
  )
}

function isPresent(memberId: string, date: string) {
  return getRecord(memberId, date)?.present ?? false
}

function toggle(memberId: string, date: string) {
  const record = getRecord(memberId, date)
  if (record) {
    attendanceStore.toggleAttendance(record.id)
    hasChanged.value = true
  }
}

function getMonthlySummary(memberId: string) {
  return attendanceStore.memberMonthlySummary(memberId, props.month, props.serviceType)
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function save() {
  attendanceStore.saveChanges()
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
      const row: Record<string, unknown> = { Name: m.name, Phone: m.phone, 'Sessions Total': summary.sessionsTotal, 'Sessions Present': summary.sessionsPresent, 'Attendance %': summary.percentage }
      sundaysInMonth.value.forEach((d) => {
        row[d] = isPresent(m.id, d) ? 'Present' : 'Absent'
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
        <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
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
              <th scope="col" class="text-left px-3 py-2.5 text-xs font-medium text-gray-500 w-10">S/N</th>
              <th scope="col" class="text-left px-3 py-2.5 text-xs font-medium text-gray-500 min-w-[140px]">Name</th>
              <th scope="col" class="text-left px-3 py-2.5 text-xs font-medium text-gray-500 min-w-[140px]">Member Monthly Summary</th>
              <th
                v-for="date in sundaysInMonth"
                :key="date"
                scope="col"
                class="text-center px-2 py-2.5 text-xs font-medium text-gray-500 w-16"
              >
                {{ formatDate(date) }}
              </th>
              <th scope="col" class="w-8 px-2 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(member, idx) in filteredMembers"
              :key="member.id"
              :class="['border-b border-gray-50', idx % 2 === 0 ? '' : 'bg-gray-50/30']"
            >
              <td class="px-3 py-2.5 text-gray-500">{{ idx + 1 }}</td>
              <td class="px-3 py-2.5">
                <div class="flex items-center gap-2">
                  <Avatar :name="member.name" size="sm" />
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
                    {{ getMonthlySummary(member.id).sessionsPresent }}/{{ getMonthlySummary(member.id).sessionsTotal }}
                  </p>
                </div>
              </td>
              <td
                v-for="date in sundaysInMonth"
                :key="date"
                class="px-2 py-2.5 text-center"
              >
                <input
                  type="checkbox"
                  class="attendance-check"
                  :checked="isPresent(member.id, date)"
                  :aria-label="`${member.name} attendance on ${date}`"
                  @change="toggle(member.id, date)"
                />
              </td>
              <td class="px-2 py-2.5">
                <button class="text-gray-400 hover:text-gray-600 p-0.5" :aria-label="`More actions for ${member.name}`">
                  <Icon icon="mdi:dots-vertical" />
                </button>
              </td>
            </tr>
            <tr v-if="!filteredMembers.length">
              <td :colspan="4 + sundaysInMonth.length" class="px-4 py-10 text-center text-gray-400">
                No members found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Sticky footer -->
    <Transition name="fade">
      <div
        v-if="hasChanged"
        class="sticky bottom-4 flex justify-end gap-2 mt-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3"
      >
        <Button @click="save">Save Changes</Button>
        <Button variant="secondary" @click="cancel">Cancel</Button>
      </div>
    </Transition>
  </div>
</template>
