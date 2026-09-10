<script setup lang="ts">
import type { LectureshipRegistration } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({
  title: 'Lectureship',
  description: 'Registrations left through the public Bible Lectureship form.',
})

const { setHeader } = usePageHeader()
const lectureshipStore = useLectureshipStore()
const { exportCSV } = useExportCSV()

onMounted(() => {
  lectureshipStore.load()
  setHeader('Lectureship', 'Registrations for the Bible Lectureship, from the public sign-up form')
})

const search = ref('')

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return lectureshipStore.registrations
  return lectureshipStore.registrations.filter(
    (r) =>
      r.fullName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.congregation.toLowerCase().includes(q) ||
      r.phone.includes(q)
  )
})

function doExport() {
  exportCSV(
    visible.value.map((r) => ({
      'Full Name': r.fullName,
      Email: r.email,
      'Congregation/Church': r.congregation,
      Phone: r.phone,
      'Registered At': r.submittedAt ? formatDate(r.submittedAt, 'long') : '',
      'Attended Sat': r.attendedSat ? 'Yes' : 'No',
      'Attended Sun': r.attendedSun ? 'Yes' : 'No',
    })),
    'lectureship-registrations'
  )
}

const totalCount = computed(() => lectureshipStore.registrations.length)
const satCount = computed(() => lectureshipStore.registrations.filter((r) => r.attendedSat).length)
const sunCount = computed(() => lectureshipStore.registrations.filter((r) => r.attendedSun).length)

// Per-checkbox key ("<id>:sat" / "<id>:sun") so the two boxes on one row, and boxes across
// different rows, can each be in flight independently.
const attendanceBusyKey = ref<string | null>(null)

async function toggleAttendance(
  registration: LectureshipRegistration,
  day: 'sat' | 'sun',
  event: Event
) {
  const checked = (event.target as HTMLInputElement).checked
  const key = `${registration.id}:${day}`
  attendanceBusyKey.value = key
  try {
    await lectureshipStore.updateAttendance(registration.id, day, checked)
  } catch {
    // Reported by the store; the checkbox is bound to store state, so it reverts on its own.
  } finally {
    attendanceBusyKey.value = null
  }
}

const busyId = ref<string | null>(null)
const { confirm } = useConfirm()

async function confirmDelete(registration: LectureshipRegistration) {
  const ok = await confirm({
    title: 'Delete this registration?',
    message: `${registration.fullName}'s registration will be removed permanently.`,
    confirmLabel: 'Delete',
  })
  if (!ok) return
  busyId.value = registration.id
  try {
    await lectureshipStore.remove(registration.id)
  } catch {
    // Reported by the store; the entry stays listed.
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Summary -->
    <div class="grid grid-cols-3 gap-3 sm:max-w-md">
      <div class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
        <p class="text-lg font-bold text-gray-900">{{ totalCount }}</p>
        <p class="text-xs text-gray-500">Registered</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
        <p class="text-lg font-bold text-gray-900">{{ satCount }}</p>
        <p class="text-xs text-gray-500">Attended Sat</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
        <p class="text-lg font-bold text-gray-900">{{ sunCount }}</p>
        <p class="text-xs text-gray-500">Attended Sun</p>
      </div>
    </div>

    <!-- Search + export -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative sm:w-72">
        <Icon
          icon="mdi:magnify"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search name, email, congregation or phone"
          aria-label="Search registrations"
          class="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <Button
        variant="secondary"
        size="sm"
        :disabled="!visible.length"
        class="shrink-0"
        @click="doExport"
      >
        <template #icon-left><Icon icon="mdi:upload-outline" /></template>
        Export CSV
      </Button>
    </div>

    <LoadingState
      v-if="lectureshipStore.loading && !lectureshipStore.loaded"
      title="Loading registrations…"
    />

    <EmptyState
      v-else-if="!lectureshipStore.registrations.length"
      icon="mdi:book-open-page-variant-outline"
      title="No registrations yet"
      description="Sign-ups from the public Lectureship registration form will appear here."
    />

    <EmptyState
      v-else-if="!visible.length"
      icon="mdi:file-search-outline"
      title="No registrations match"
      description="Try a different search term."
      size="sm"
    />

    <!-- List -->
    <Card v-else padding="none">
      <div class="overflow-x-auto">
        <table class="w-full text-sm" role="table">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th scope="col" class="px-3 py-2.5 text-left text-xs font-medium text-gray-500">
                Name
              </th>
              <th scope="col" class="px-3 py-2.5 text-left text-xs font-medium text-gray-500">
                Email
              </th>
              <th scope="col" class="px-3 py-2.5 text-left text-xs font-medium text-gray-500">
                Phone / WhatsApp
              </th>
              <th scope="col" class="px-3 py-2.5 text-left text-xs font-medium text-gray-500">
                Congregation
              </th>
              <th scope="col" class="px-3 py-2.5 text-left text-xs font-medium text-gray-500">
                Registered
              </th>
              <th scope="col" class="px-2 py-2.5 text-center text-xs font-medium text-gray-500">
                Sat
              </th>
              <th scope="col" class="px-2 py-2.5 text-center text-xs font-medium text-gray-500">
                Sun
              </th>
              <th scope="col" class="w-10 px-2 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, idx) in visible"
              :key="r.id"
              :class="['border-b border-gray-50', idx % 2 === 0 ? '' : 'bg-gray-50/30']"
            >
              <td class="px-3 py-2.5 font-medium whitespace-nowrap text-gray-900">
                {{ r.fullName }}
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap text-gray-600">{{ r.email }}</td>
              <td class="px-3 py-2.5 whitespace-nowrap text-gray-600">{{ r.phone }}</td>
              <td class="px-3 py-2.5 text-gray-600">{{ r.congregation }}</td>
              <td class="px-3 py-2.5 whitespace-nowrap text-xs text-gray-500">
                {{ r.submittedAt ? formatDate(r.submittedAt, 'dateTime') : '—' }}
              </td>
              <td class="px-2 py-2.5 text-center">
                <span class="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    class="attendance-check"
                    :checked="r.attendedSat ?? false"
                    :disabled="attendanceBusyKey === `${r.id}:sat`"
                    :aria-label="`${r.fullName} attended Saturday`"
                    @change="toggleAttendance(r, 'sat', $event)"
                  />
                  <Icon
                    v-if="attendanceBusyKey === `${r.id}:sat`"
                    icon="mdi:loading"
                    class="animate-spin text-xs text-gray-400"
                  />
                </span>
              </td>
              <td class="px-2 py-2.5 text-center">
                <span class="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    class="attendance-check"
                    :checked="r.attendedSun ?? false"
                    :disabled="attendanceBusyKey === `${r.id}:sun`"
                    :aria-label="`${r.fullName} attended Sunday`"
                    @change="toggleAttendance(r, 'sun', $event)"
                  />
                  <Icon
                    v-if="attendanceBusyKey === `${r.id}:sun`"
                    icon="mdi:loading"
                    class="animate-spin text-xs text-gray-400"
                  />
                </span>
              </td>
              <td class="px-2 py-2.5 text-right">
                <button
                  class="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  :disabled="busyId === r.id"
                  :aria-label="`Delete ${r.fullName}'s registration`"
                  @click="confirmDelete(r)"
                >
                  <Icon
                    :icon="busyId === r.id ? 'mdi:loading' : 'mdi:trash-can-outline'"
                    :class="busyId === r.id && 'animate-spin'"
                  />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>
