<script setup lang="ts">
import type { LectureshipRegistration, LectureshipSpeaker, LectureshipSpeakerRole } from '~/types'
import { LECTURESHIP_ROLE_ORDER } from '~/constants'

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
  lectureshipStore.loadSpeakers()
  setHeader(
    'Lectureship',
    'Registrations, speakers and officiating ministers for the Bible Lectureship'
  )
})

type Tab = 'registrations' | 'speakers'
const tabs: { label: string; value: Tab }[] = [
  { label: 'Registrations', value: 'registrations' },
  { label: 'Speakers & Officiating', value: 'speakers' },
]
const activeTab = ref<Tab>('registrations')

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

// ── Speakers & officiating ministers ──────────────────────────────────────
const speakerFormOpen = ref(false)
const editSpeaker = ref<LectureshipSpeaker | null>(null)
const newSpeakerRole = ref<LectureshipSpeakerRole>('speaker')

function speakersByRole(role: LectureshipSpeakerRole) {
  return [...lectureshipStore.speakers]
    .filter((s) => s.role === role)
    .sort((a, b) => a.order - b.order)
}

function openAddSpeaker(role: LectureshipSpeakerRole) {
  editSpeaker.value = null
  newSpeakerRole.value = role
  speakerFormOpen.value = true
}

function openEditSpeaker(speaker: LectureshipSpeaker) {
  editSpeaker.value = speaker
  speakerFormOpen.value = true
}

const speakerBusyId = ref<string | null>(null)

async function confirmDeleteSpeaker(speaker: LectureshipSpeaker) {
  const ok = await confirm({
    title: 'Remove this profile?',
    message: `${speaker.name}'s profile will no longer appear on the public Lectureship page.`,
    confirmLabel: 'Remove',
  })
  if (!ok) return
  speakerBusyId.value = speaker.id
  try {
    await lectureshipStore.removeSpeaker(speaker.id)
  } catch {
    // Reported by the store; the entry stays listed.
  } finally {
    speakerBusyId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <Tabs v-model="activeTab" :tabs="tabs" />

    <template v-if="activeTab === 'registrations'">
      <!-- Summary -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:max-w-3xl">
        <div class="rounded-lg border border-rule bg-surface p-4 shadow-xs">
          <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Registered</p>
          <p class="num mt-2 font-display text-3xl font-semibold text-ink">{{ totalCount }}</p>
        </div>
        <div class="rounded-lg border border-rule bg-surface p-4 shadow-xs">
          <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Attended Sat</p>
          <p class="num mt-2 font-display text-3xl font-semibold text-ink">{{ satCount }}</p>
        </div>
        <div class="rounded-lg border border-rule bg-surface p-4 shadow-xs">
          <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Attended Sun</p>
          <p class="num mt-2 font-display text-3xl font-semibold text-ink">{{ sunCount }}</p>
        </div>
      </div>

      <!-- Search + export -->
      <div
        class="flex flex-col gap-3 rounded-lg border border-rule bg-surface p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="relative sm:w-72">
          <Icon
            icon="mdi:magnify"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <input
            v-model="search"
            type="search"
            placeholder="Search name, email, congregation or phone"
            aria-label="Search registrations"
            class="min-h-10 w-full py-2 pr-3 pl-9 text-sm rounded-md border border-rule-strong bg-surface text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
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
      <div v-else class="overflow-x-auto rounded-lg border border-rule bg-surface shadow-xs">
        <div>
          <table class="w-full text-sm" role="table">
            <thead class="sticky top-0 z-[1] bg-surface-muted">
              <tr>
                <th
                  scope="col"
                  class="border-b border-rule py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase px-4 text-left"
                >
                  Name
                </th>
                <th
                  scope="col"
                  class="border-b border-rule py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase px-4 text-left"
                >
                  Email
                </th>
                <th
                  scope="col"
                  class="border-b border-rule py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase px-4 text-left"
                >
                  Phone / WhatsApp
                </th>
                <th
                  scope="col"
                  class="border-b border-rule py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase px-4 text-left"
                >
                  Congregation
                </th>
                <th
                  scope="col"
                  class="border-b border-rule py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase px-4 text-left"
                >
                  Registered
                </th>
                <th
                  scope="col"
                  class="border-b border-rule py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase px-2 text-center"
                >
                  Sat
                </th>
                <th
                  scope="col"
                  class="border-b border-rule py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase px-2 text-center"
                >
                  Sun
                </th>
                <th scope="col" class="w-10 border-b border-rule px-2 py-2.5"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-rule">
              <tr
                v-for="(r, idx) in visible"
                :key="r.id"
                :class="[
                  'transition-colors hover:bg-surface-muted/70',
                  idx % 2 === 0 ? '' : 'bg-surface-muted/40',
                ]"
              >
                <td class="px-4 py-3 font-medium whitespace-nowrap text-ink">
                  {{ r.fullName }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-ink-muted">{{ r.email }}</td>
                <td class="num px-4 py-3 whitespace-nowrap text-ink-muted">{{ r.phone }}</td>
                <td class="px-4 py-3 text-ink-muted">{{ r.congregation }}</td>
                <td class="num px-4 py-3 text-xs whitespace-nowrap text-ink-muted">
                  {{ r.submittedAt ? formatDate(r.submittedAt, 'dateTime') : '—' }}
                </td>
                <td class="px-2 py-2 text-center">
                  <label
                    :class="[
                      'inline-flex size-9 cursor-pointer items-center justify-center rounded-md border transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus has-[:disabled]:cursor-wait',
                      r.attendedSat
                        ? 'border-success/30 bg-success-soft text-success hover:border-success/60'
                        : 'border-rule-strong bg-surface text-ink-subtle hover:border-ink-subtle hover:text-ink-muted',
                    ]"
                    :title="r.attendedSat ? 'Attended Saturday' : 'Not marked for Saturday'"
                  >
                    <input
                      type="checkbox"
                      class="attendance-check sr-only"
                      :checked="r.attendedSat ?? false"
                      :disabled="attendanceBusyKey === `${r.id}:sat`"
                      :aria-label="`${r.fullName} attended Saturday`"
                      @change="toggleAttendance(r, 'sat', $event)"
                    />
                    <Icon
                      v-if="attendanceBusyKey === `${r.id}:sat`"
                      icon="mdi:loading"
                      class="animate-spin text-base text-ink-subtle"
                    />
                    <Icon
                      v-else
                      :icon="r.attendedSat ? 'mdi:check-circle' : 'mdi:circle-outline'"
                      class="text-lg"
                      aria-hidden="true"
                    />
                  </label>
                </td>
                <td class="px-2 py-2 text-center">
                  <label
                    :class="[
                      'inline-flex size-9 cursor-pointer items-center justify-center rounded-md border transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus has-[:disabled]:cursor-wait',
                      r.attendedSun
                        ? 'border-success/30 bg-success-soft text-success hover:border-success/60'
                        : 'border-rule-strong bg-surface text-ink-subtle hover:border-ink-subtle hover:text-ink-muted',
                    ]"
                    :title="r.attendedSun ? 'Attended Sunday' : 'Not marked for Sunday'"
                  >
                    <input
                      type="checkbox"
                      class="attendance-check sr-only"
                      :checked="r.attendedSun ?? false"
                      :disabled="attendanceBusyKey === `${r.id}:sun`"
                      :aria-label="`${r.fullName} attended Sunday`"
                      @change="toggleAttendance(r, 'sun', $event)"
                    />
                    <Icon
                      v-if="attendanceBusyKey === `${r.id}:sun`"
                      icon="mdi:loading"
                      class="animate-spin text-base text-ink-subtle"
                    />
                    <Icon
                      v-else
                      :icon="r.attendedSun ? 'mdi:check-circle' : 'mdi:circle-outline'"
                      class="text-lg"
                      aria-hidden="true"
                    />
                  </label>
                </td>
                <td class="px-2 py-2 text-right">
                  <button
                    class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-error-soft hover:text-error disabled:opacity-55"
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
      </div>
    </template>

    <!-- ── Speakers, Officiating Ministers, Song Leaders & Moderators ──────── -->
    <template v-else>
      <div class="flex flex-col gap-8">
        <LectureshipRoleSection
          v-for="role in LECTURESHIP_ROLE_ORDER"
          :key="role"
          :role="role"
          :items="speakersByRole(role)"
          :busy-id="speakerBusyId"
          @add="openAddSpeaker(role)"
          @edit="openEditSpeaker"
          @delete="confirmDeleteSpeaker"
        />
      </div>
    </template>

    <LectureshipSpeakerFormModal
      v-model="speakerFormOpen"
      :speaker="editSpeaker"
      :default-role="newSpeakerRole"
      :next-order="lectureshipStore.speakers.length"
    />
  </div>
</template>
