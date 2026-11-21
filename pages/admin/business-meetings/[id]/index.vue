<script setup lang="ts">
import type { BusinessMeeting } from '~/types/businessMeetings'
import {
  MEETING_TYPES,
  MINUTES_EDITOR_ROLES,
  MINUTES_MANAGER_ROLES,
  emptyMeeting,
  formatMeetingDate,
  newActionPoint,
  newMinuteItem,
  normaliseMeeting,
} from '~/utils/businessMeetings'
import { todayIso } from '~/utils/legalText'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const route = useRoute()
const { setHeader } = usePageHeader()
const store = useBusinessMeetingsStore()
const authStore = useAuthStore()
const membersStore = useMembersStore()
const settingsStore = useChurchSettingsStore()

const id = computed(() => String(route.params.id))
const isNew = computed(() => id.value === 'new')

const canEdit = computed(() =>
  (MINUTES_EDITOR_ROLES as readonly string[]).includes(authStore.roleId ?? '')
)
const canManage = computed(() =>
  (MINUTES_MANAGER_ROLES as readonly string[]).includes(authStore.roleId ?? '')
)

// ── Draft ──────────────────────────────────────────────────────────────────
/** The stored meeting, or null while creating one. */
const stored = computed(() => (isNew.value ? null : store.byId(id.value)))
const draft = ref<BusinessMeeting>(normaliseMeeting('new', emptyMeeting(todayIso())))
const notFound = ref(false)

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

function resetDraft() {
  if (isNew.value) {
    draft.value = normaliseMeeting('new', emptyMeeting(todayIso()))
  } else if (stored.value) {
    draft.value = clone(stored.value)
  }
}

/** What the draft is compared against to decide whether anything is unsaved. */
const baseline = ref('')
function markClean() {
  baseline.value = JSON.stringify(draft.value)
}
const isDirty = computed(() => JSON.stringify(draft.value) !== baseline.value)

onMounted(async () => {
  setHeader('Business Meetings', 'Minutes of a business meeting')
  await Promise.all([store.load(), settingsStore.load(), membersStore.load()])
  if (!isNew.value && !stored.value) {
    notFound.value = true
    return
  }
  resetDraft()
  markClean()
  if (isNew.value) baseline.value = '' // a new meeting is always "unsaved" until written
})

// ── Mode ───────────────────────────────────────────────────────────────────
/** Approved minutes, and anyone without write access, get the finished document instead. */
const readOnly = computed(
  () => !canEdit.value || (!isNew.value && stored.value?.status === 'approved')
)

watch(
  () => [draft.value.title, draft.value.date, isNew.value] as const,
  () => {
    const title = isNew.value ? 'Record Minutes' : draft.value.title || 'Business Meeting'
    setHeader(title, formatMeetingDate(draft.value.date))
  }
)

// ── Name suggestions ───────────────────────────────────────────────────────
const memberNames = computed(() =>
  [...new Set(membersStore.members.map((m) => m.name).filter(Boolean))].sort()
)
const NAMES = 'bm-member-names'

/** Everyone present is a likely mover, seconder or presenter, so they lead the suggestions. */
const suggestionNames = computed(() => [
  ...draft.value.present,
  ...memberNames.value.filter((n) => !draft.value.present.includes(n)),
])

// ── Sections ───────────────────────────────────────────────────────────────
const sections = [
  { id: 'details', label: 'Meeting details', icon: 'mdi:information-outline' },
  { id: 'attendance', label: 'Attendance', icon: 'mdi:account-multiple-check-outline' },
  { id: 'opening', label: 'Opening', icon: 'mdi:hands-pray' },
  { id: 'previous', label: 'Previous minutes', icon: 'mdi:history' },
  { id: 'arising', label: 'Matters arising', icon: 'mdi:arrow-u-left-top' },
  { id: 'reports', label: 'Reports', icon: 'mdi:file-chart-outline' },
  { id: 'business', label: 'New business', icon: 'mdi:gavel' },
  { id: 'aob', label: 'Any other business', icon: 'mdi:dots-horizontal-circle-outline' },
  { id: 'actions', label: 'Action points', icon: 'mdi:checkbox-marked-circle-outline' },
  { id: 'announcements', label: 'Announcements', icon: 'mdi:bullhorn-outline' },
  { id: 'next', label: 'Next meeting', icon: 'mdi:calendar-arrow-right' },
  { id: 'closing', label: 'Closing', icon: 'mdi:door-closed' },
]

const counts = computed<Record<string, number>>(() => ({
  attendance: draft.value.present.length,
  arising: draft.value.mattersArising.length,
  reports: draft.value.reports.length,
  business: draft.value.agendaItems.length,
  aob: draft.value.otherBusiness.length,
  actions: draft.value.actionPoints.length,
}))

function jump(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const meetingTypeOptions = MEETING_TYPES.map((t) => ({ label: t.label, value: t.value }))

// ── Bring forward from the previous meeting ───────────────────────────────
/** The most recent meeting before this one, whose open action points become matters arising. */
const previousMeeting = computed(
  () =>
    store.meetings
      .filter((m) => m.id !== draft.value.id && m.date && m.date < (draft.value.date || '9999'))
      .sort((a, b) => b.date.localeCompare(a.date))[0]
)
const carryable = computed(
  () => previousMeeting.value?.actionPoints.filter((a) => !a.done && a.task.trim()) ?? []
)
function bringForward() {
  const existing = new Set(draft.value.mattersArising.map((i) => i.title.trim().toLowerCase()))
  let added = 0
  for (const a of carryable.value) {
    if (existing.has(a.task.trim().toLowerCase())) continue
    draft.value.mattersArising.push({
      ...newMinuteItem('ma'),
      title: a.task,
      presentedBy: a.assignedTo,
    })
    added++
  }
  useToast().success(
    added ? `Added ${added} open item${added === 1 ? '' : 's'}` : 'Already brought forward'
  )
}

// ── Action points ──────────────────────────────────────────────────────────
function addActionPoint() {
  draft.value.actionPoints.push(newActionPoint())
}
function removeActionPoint(i: number) {
  draft.value.actionPoints.splice(i, 1)
}

// ── Save ───────────────────────────────────────────────────────────────────
const dateError = ref('')

async function save() {
  dateError.value = draft.value.date ? '' : 'The meeting date is required'
  if (dateError.value) {
    useToast().error('Add the meeting date')
    jump('details')
    return
  }
  try {
    if (isNew.value) {
      const { id: _id, ...body } = draft.value
      const created = await store.create(body)
      draft.value = clone(created)
      markClean()
      await navigateTo(`/admin/business-meetings/${created.id}`, { replace: true })
    } else {
      draft.value = clone(await store.save(draft.value))
      markClean()
    }
  } catch {
    // The store has already shown the error.
  }
}

function discard() {
  resetDraft()
  if (!isNew.value) markClean()
}

// ── Approve / reopen ───────────────────────────────────────────────────────
const approveOpen = ref(false)
const approvedOn = ref(todayIso())

function openApprove() {
  approvedOn.value = todayIso()
  approveOpen.value = true
}

async function approve() {
  if (!stored.value) return
  try {
    // Saves any last edits together with the approval.
    draft.value = clone(await store.approve(draft.value, approvedOn.value))
    markClean()
    approveOpen.value = false
  } catch {
    // Store surfaced it.
  }
}

const { confirm } = useConfirm()
async function reopen() {
  if (!stored.value) return
  const ok = await confirm({
    title: 'Reopen these minutes?',
    message:
      'Approved minutes are the adopted record. Reopen them only to make a correction the meeting agreed to; they return to draft until approved again.',
    confirmLabel: 'Reopen',
  })
  if (!ok) return
  try {
    draft.value = clone(await store.reopen(stored.value))
    markClean()
  } catch {
    // Store surfaced it.
  }
}

// ── Leaving with unsaved work ──────────────────────────────────────────────
function onBeforeUnload(e: BeforeUnloadEvent) {
  if (!isDirty.value || readOnly.value) return
  e.preventDefault()
  e.returnValue = ''
}
function onSaveShortcut(e: KeyboardEvent) {
  if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 's') return
  e.preventDefault()
  if (!readOnly.value && isDirty.value && !store.saving) void save()
}
onMounted(() => {
  window.addEventListener('beforeunload', onBeforeUnload)
  window.addEventListener('keydown', onSaveShortcut)
})
onUnmounted(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
  window.removeEventListener('keydown', onSaveShortcut)
})
onBeforeRouteLeave((to) => {
  // Saving a new meeting replaces /new with its real address; that is not leaving.
  if (to.path.startsWith('/admin/business-meetings/') && isNew.value && !isDirty.value) return true
  if (readOnly.value || !isDirty.value) return true
  return window.confirm('These minutes have unsaved changes. Leave without saving?')
})
</script>

<template>
  <div>
    <datalist :id="NAMES">
      <option v-for="name in suggestionNames" :key="name" :value="name"></option>
    </datalist>

    <Teleport defer to="#admin-header-actions">
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" @click="navigateTo('/admin/business-meetings')">
          <template #icon-left><Icon icon="mdi:arrow-left" /></template>
          All meetings
        </Button>
        <NuxtLink
          v-if="!isNew && stored"
          :to="`/admin/business-meetings/${id}/print`"
          target="_blank"
          class="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-rule-strong bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-muted"
        >
          <Icon icon="mdi:printer-outline" />
          Print / PDF
        </NuxtLink>
        <Button
          v-if="canEdit && stored?.status === 'draft'"
          size="sm"
          :disabled="store.saving"
          @click="openApprove"
        >
          <template #icon-left><Icon icon="mdi:check-decagram-outline" /></template>
          Approve
        </Button>
        <Button
          v-if="canManage && stored?.status === 'approved'"
          variant="secondary"
          size="sm"
          :disabled="store.saving"
          @click="reopen"
        >
          <template #icon-left><Icon icon="mdi:lock-open-outline" /></template>
          Reopen
        </Button>
      </div>
    </Teleport>

    <LoadingState v-if="store.loading && !store.loaded" title="Loading minutes…" />

    <EmptyState
      v-else-if="notFound"
      icon="mdi:file-question-outline"
      title="Meeting not found"
      description="It may have been deleted, or the link is wrong."
    >
      <template #action>
        <Button variant="secondary" @click="navigateTo('/admin/business-meetings')">
          Back to all meetings
        </Button>
      </template>
    </EmptyState>

    <!-- ── Read view: approved minutes, or staff without write access ── -->
    <div v-else-if="readOnly" class="space-y-4">
      <div
        v-if="stored?.status === 'approved'"
        class="flex items-start gap-3 rounded-sm border border-success/30 bg-success-soft px-4 py-3 text-sm text-ink"
      >
        <Icon icon="mdi:lock-outline" class="mt-0.5 shrink-0 text-success" />
        <p>
          Approved<template v-if="stored.approvedOn">
            on {{ formatMeetingDate(stored.approvedOn) }}</template
          >
          and locked.
          <template v-if="canManage">Use <strong>Reopen</strong> to make a correction.</template>
          <template v-else-if="canEdit">Only an Admin can reopen approved minutes.</template>
        </p>
      </div>
      <div class="rounded-sm border border-rule bg-surface px-6 py-10 sm:px-12">
        <MinutesDocument :meeting="draft" :church-name="settingsStore.settings.name" />
      </div>
    </div>

    <!-- ── Editor ── -->
    <div v-else class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <!-- Section index -->
      <nav
        aria-label="Minutes sections"
        class="hidden w-52 shrink-0 self-start lg:sticky lg:top-0 lg:block"
      >
        <p class="px-3 pb-1.5 text-2xs font-semibold tracking-[0.08em] text-ink-subtle uppercase">
          Order of business
        </p>
        <ul class="space-y-0.5">
          <li v-for="(s, i) in sections" :key="s.id">
            <button
              type="button"
              class="flex min-h-9 w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
              @click="jump(s.id)"
            >
              <span class="num w-4 shrink-0 text-xs text-ink-subtle">{{ i + 1 }}</span>
              <span class="min-w-0 flex-1 truncate">{{ s.label }}</span>
              <span v-if="counts[s.id]" class="num text-xs text-ink-subtle">{{
                counts[s.id]
              }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="flex min-w-0 max-w-3xl flex-1 flex-col gap-5">
        <!-- 1. Details -->
        <SettingsSection
          id="details"
          class="scroll-mt-4"
          title="1. Meeting details"
          description="What kind of meeting, when and where, and who led it."
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <Input v-model="draft.title" label="Title" placeholder="Monthly Business Meeting" />
            </div>
            <Select v-model="draft.meetingType" label="Type" :options="meetingTypeOptions" />
            <Input v-model="draft.venue" label="Venue" placeholder="Church auditorium" />
            <Input v-model="draft.date" type="date" label="Date" required :error="dateError" />
            <Input v-model="draft.startTime" type="time" label="Called to order at" />
            <Input
              v-model="draft.chairperson"
              label="Chairperson"
              :list="NAMES"
              placeholder="Who presided"
            />
            <Input
              v-model="draft.secretary"
              label="Minutes taken by"
              :list="NAMES"
              placeholder="Secretary"
            />
          </div>
        </SettingsSection>

        <!-- 2. Attendance -->
        <SettingsSection
          id="attendance"
          class="scroll-mt-4"
          title="2. Attendance"
          description="Names come from the nominal roll as you type; anyone else can be typed in full."
        >
          <div class="flex flex-col gap-4">
            <NameListInput
              v-model="draft.present"
              label="Present"
              :list="NAMES"
              helper="Paste a comma-separated list to add many at once."
            />
            <div class="grid gap-4 sm:grid-cols-2">
              <NameListInput v-model="draft.apologies" label="Absent with apology" :list="NAMES" />
              <NameListInput v-model="draft.absent" label="Absent without apology" :list="NAMES" />
            </div>
            <NameListInput
              v-model="draft.inAttendance"
              label="In attendance (visitors, guests)"
              :list="NAMES"
            />
            <label class="flex min-h-10 items-center gap-2.5 text-sm text-ink">
              <input
                v-model="draft.quorumPresent"
                type="checkbox"
                class="size-4 rounded-sm accent-primary"
              />
              The chair declared a quorum present
            </label>
          </div>
        </SettingsSection>

        <!-- 3. Opening -->
        <SettingsSection
          id="opening"
          class="scroll-mt-4"
          title="3. Opening"
          description="Opening prayer and the chairperson's welcome."
        >
          <div class="flex flex-col gap-4">
            <Input
              v-model="draft.openingPrayerBy"
              label="Opening prayer by"
              :list="NAMES"
              placeholder="Name"
            />
            <Textarea
              v-model="draft.openingRemarks"
              label="Opening remarks"
              :rows="3"
              placeholder="Welcome, scripture reading, the purpose of the meeting…"
            />
          </div>
        </SettingsSection>

        <!-- 4. Previous minutes -->
        <SettingsSection
          id="previous"
          class="scroll-mt-4"
          title="4. Minutes of the previous meeting"
          description="Reading, corrections and adoption of the last meeting's minutes."
        >
          <div class="flex flex-col gap-4">
            <Input
              v-model="draft.previousMinutes.readBy"
              label="Read by"
              :list="NAMES"
              placeholder="Name"
            />
            <Textarea
              v-model="draft.previousMinutes.corrections"
              label="Corrections or amendments"
              :rows="2"
              placeholder="Leave empty if there were none."
            />
            <label class="flex min-h-10 items-center gap-2.5 text-sm text-ink">
              <input
                v-model="draft.previousMinutes.adopted"
                type="checkbox"
                class="size-4 rounded-sm accent-primary"
              />
              Adopted as a true record
            </label>
            <div v-if="draft.previousMinutes.adopted" class="grid gap-4 sm:grid-cols-2">
              <Input
                v-model="draft.previousMinutes.movedBy"
                label="Moved by"
                :list="NAMES"
                placeholder="Name"
              />
              <Input
                v-model="draft.previousMinutes.secondedBy"
                label="Seconded by"
                :list="NAMES"
                placeholder="Name"
              />
            </div>
          </div>
        </SettingsSection>

        <!-- 5. Matters arising -->
        <SettingsSection
          id="arising"
          class="scroll-mt-4"
          title="5. Matters arising"
          description="Follow-ups on what the previous meeting decided."
        >
          <template v-if="carryable.length" #actions>
            <Button variant="secondary" size="sm" @click="bringForward">
              <template #icon-left><Icon icon="mdi:arrow-down-bold-box-outline" /></template>
              Bring forward {{ carryable.length }} open
            </Button>
          </template>
          <MinuteItemsEditor
            v-model:items="draft.mattersArising"
            noun="Matter"
            id-prefix="ma"
            title-placeholder="e.g. Repairs to the church roof"
            presenter-label="Reported by"
            :names="NAMES"
          />
        </SettingsSection>

        <!-- 6. Reports -->
        <SettingsSection
          id="reports"
          class="scroll-mt-4"
          title="6. Reports"
          description="Treasurer's report, ministry and committee reports."
        >
          <MinuteItemsEditor
            v-model:items="draft.reports"
            noun="Report"
            id-prefix="rp"
            title-placeholder="e.g. Treasurer's report"
            presenter-label="Presented by"
            :names="NAMES"
          />
        </SettingsSection>

        <!-- 7. New business -->
        <SettingsSection
          id="business"
          class="scroll-mt-4"
          title="7. New business"
          description="Each item on the agenda: the discussion, what was resolved, and the motion."
        >
          <MinuteItemsEditor
            v-model:items="draft.agendaItems"
            noun="Agenda item"
            id-prefix="ag"
            title-placeholder="e.g. Planning the year-end gospel meeting"
            presenter-label="Raised by"
            :names="NAMES"
            motions-open
          />
        </SettingsSection>

        <!-- 8. AOB -->
        <SettingsSection
          id="aob"
          class="scroll-mt-4"
          title="8. Any other business"
          description="Matters raised from the floor that were not on the agenda."
        >
          <MinuteItemsEditor
            v-model:items="draft.otherBusiness"
            noun="Item"
            id-prefix="ob"
            title-placeholder="Subject"
            presenter-label="Raised by"
            :names="NAMES"
          />
        </SettingsSection>

        <!-- 9. Action points -->
        <SettingsSection
          id="actions"
          class="scroll-mt-4"
          title="9. Action points"
          description="Who will do what, and by when. Open items are listed on the meetings page until marked done."
          density="sm"
        >
          <template #actions>
            <Button variant="secondary" size="sm" @click="addActionPoint">
              <template #icon-left><Icon icon="mdi:plus" /></template>
              Add Action
            </Button>
          </template>
          <SettingsRepeater
            :items="draft.actionPoints"
            :columns="['Done', 'Action', 'Responsible', 'Due']"
            grid-class="grid-cols-1 sm:grid-cols-[2.5rem_1fr_11rem_9.5rem_auto]"
            empty="No action points recorded."
            noun="action point"
            @remove="removeActionPoint"
          >
            <template #default="{ item }">
              <label class="flex min-h-9 items-center gap-2 text-sm sm:justify-center">
                <input
                  v-model="item.done"
                  type="checkbox"
                  class="size-4 rounded-sm accent-primary"
                />
                <span class="sm:sr-only">Done</span>
              </label>
              <Input
                v-model="item.task"
                label="Action"
                label-class="sm:sr-only"
                placeholder="What needs doing"
              />
              <Input
                v-model="item.assignedTo"
                label="Responsible"
                label-class="sm:sr-only"
                :list="NAMES"
                placeholder="Name"
              />
              <Input v-model="item.dueDate" type="date" label="Due" label-class="sm:sr-only" />
            </template>
          </SettingsRepeater>
        </SettingsSection>

        <!-- 10. Announcements -->
        <SettingsSection id="announcements" class="scroll-mt-4" title="10. Announcements">
          <Textarea
            v-model="draft.announcements"
            label="Announcements"
            label-class="sr-only"
            :rows="3"
            placeholder="Anything announced to the meeting."
          />
        </SettingsSection>

        <!-- 11. Next meeting -->
        <SettingsSection id="next" class="scroll-mt-4" title="11. Next meeting">
          <div class="grid gap-4 sm:grid-cols-3">
            <Input v-model="draft.nextMeeting.date" type="date" label="Date" />
            <Input v-model="draft.nextMeeting.time" type="time" label="Time" />
            <Input v-model="draft.nextMeeting.venue" label="Venue" placeholder="Same venue" />
          </div>
        </SettingsSection>

        <!-- 12. Closing -->
        <SettingsSection id="closing" class="scroll-mt-4" title="12. Closing">
          <div class="grid gap-4 sm:grid-cols-2">
            <Input v-model="draft.adjournedAt" type="time" label="Adjourned at" />
            <Input
              v-model="draft.closingPrayerBy"
              label="Closing prayer by"
              :list="NAMES"
              placeholder="Name"
            />
          </div>
        </SettingsSection>

        <p v-if="stored?.updatedAt" class="text-xs text-ink-subtle">
          Last saved {{ new Date(stored.updatedAt).toLocaleString() }}
          <template v-if="stored.updatedBy"> by {{ stored.updatedBy }}</template>
        </p>

        <SettingsSaveBar
          :dirty="isDirty"
          :saving="store.saving"
          @save="save"
          @discard="isNew ? navigateTo('/admin/business-meetings') : discard()"
        />
      </div>
    </div>

    <!-- Approve -->
    <Modal v-model="approveOpen" title="Approve these minutes" size="sm">
      <div class="flex flex-col gap-4 text-sm text-ink">
        <p class="text-ink-muted">
          Approved minutes are locked as the adopted record. Afterwards only an Admin can reopen
          them.
        </p>
        <Input v-model="approvedOn" type="date" label="Adopted on" />
      </div>
      <template #footer>
        <Button variant="secondary" @click="approveOpen = false">Cancel</Button>
        <Button :loading="store.saving" :disabled="!approvedOn" @click="approve">
          Approve & Lock
        </Button>
      </template>
    </Modal>
  </div>
</template>
