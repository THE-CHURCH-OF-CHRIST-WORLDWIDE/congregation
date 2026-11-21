<script setup lang="ts">
import type { Member } from '~/types'
import type { ChartData } from 'chart.js'

import { MEMBER_STATUSES } from '~/constants'
import { chartAlpha, chartPalette } from '~/utils/chartTheme'
definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Youth', description: 'Youth members management.' })

const { setHeader } = usePageHeader()
const membersStore = useMembersStore()
const { exportCSV } = useExportCSV()

onMounted(() => {
  setHeader('Youth', 'Managing youth members aged 13–35')
})

// ─── Local filter state (independent from nominal-roll store filters) ────────
const search = ref('')
const activeTab = ref<'all' | 'boys' | 'girls' | 'active' | 'inactive'>('all')

const tabs = [
  { label: 'All Youth', value: 'all' },
  { label: 'Boys', value: 'boys' },
  { label: 'Girls', value: 'girls' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

// ─── Youth computed list ─────────────────────────────────────────────────────
const filteredYouth = computed(() => {
  let result = [...membersStore.youthMembers]

  if (activeTab.value === 'boys') result = result.filter((m) => m.gender === 'Male')
  else if (activeTab.value === 'girls') result = result.filter((m) => m.gender === 'Female')
  else if (activeTab.value === 'active') result = result.filter((m) => m.status === 'Active')
  else if (activeTab.value === 'inactive') result = result.filter((m) => m.status !== 'Active')

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.phone.includes(q)
    )
  }

  return result
})

// ─── Stats cards ─────────────────────────────────────────────────────────────
const statCards = computed(() => [
  {
    label: 'Total Youth',
    value: membersStore.youthMembers.length,
    subtitle: 'Ages 13–35',
    change: 12,
    tab: 'all' as const,
  },
  {
    label: 'Youth Girls',
    value: membersStore.youthGirlsCount,
    subtitle: `${membersStore.youthMembers.length - membersStore.youthGirlsCount} boys`,
    change: 8,
    tab: 'girls' as const,
  },
  {
    label: 'Youth Boys',
    value: membersStore.youthBoysCount,
    subtitle: `${membersStore.youthMembers.length - membersStore.youthBoysCount} girls`,
    change: 15,
    tab: 'boys' as const,
  },
  {
    label: 'Active Youth',
    value: membersStore.youthActiveCount,
    subtitle: `${membersStore.youthMembers.length - membersStore.youthActiveCount} inactive`,
    change: 10,
    tab: 'active' as const,
  },
])

const tableRef = ref<HTMLElement | null>(null)

function viewList(tab: 'all' | 'boys' | 'girls' | 'active' | 'inactive') {
  activeTab.value = tab
  nextTick(() => {
    tableRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

// ─── Donut chart ─────────────────────────────────────────────────────────────
/**
 * Driven by `MEMBER_STATUSES` rather than a hand-written list: this chart previously named five
 * of the eight statuses, so any youth marked Disfellowshipped, Transfer or Late vanished from it.
 *
 * Plots counts, not percentages. Chart.js works out the arcs, tooltips then show real numbers,
 * and rounding each slice to a whole percent no longer makes them fail to add up to 100.
 */
const STATUS_COLORS: Record<string, string> = {
  Active: chartPalette.bookcloth,
  Inactive: chartPalette.slate,
  Backslider: chartPalette.gilt,
  Weak: chartPalette.clay,
  Distant: chartPalette.ink,
  Withdrawal: chartPalette.plum,
  Disfellowshipped: chartPalette.margin,
  Transfer: chartPalette.teal,
  Late: chartAlpha(chartPalette.slate, 0.5),
}

/**
 * Youth membership is derived from date of birth, so a roll with no birthdays recorded looks
 * identical to one with no youth. Say which it is — "no youth members" sends someone hunting for
 * a bug when the answer is a missing field.
 */
const emptyYouthReason = computed(() => {
  const withDob = membersStore.members.filter((m) => m.dob).length
  if (!membersStore.members.length) return 'No members on the roll yet.'
  if (!withDob) return 'No dates of birth recorded, so nobody can be identified as youth (13–35).'
  return 'No members aged 13–35 on the roll.'
})

const youthByStatus = computed(() =>
  MEMBER_STATUSES.map((status) => ({
    status,
    count: membersStore.youthMembers.filter((m) => m.status === status).length,
  })).filter((entry) => entry.count > 0)
)

const donutData = computed<ChartData<'doughnut'>>(() => {
  const entries = youthByStatus.value
  return {
    labels: entries.map((e) => e.status),
    datasets: [
      {
        data: entries.map((e) => e.count),
        backgroundColor: entries.map((e) => STATUS_COLORS[e.status] ?? chartPalette.slate),
        borderWidth: 0,
      },
    ],
  }
})

// ─── Panel ───────────────────────────────────────────────────────────────────
const panelOpen = ref(false)
const panelAutoEdit = ref(false)
const selectedMember = ref<Member | null>(null)

function openPanel(member: Member) {
  panelAutoEdit.value = false
  selectedMember.value = member
  panelOpen.value = true
}

function openPanelEdit(member: Member) {
  selectedMember.value = member
  panelAutoEdit.value = true
  panelOpen.value = true
}

// ─── Add modal ───────────────────────────────────────────────────────────────
const showAddModal = ref(false)

async function onMemberSaved(member: Omit<Member, 'id' | 'absenceCount'>) {
  await membersStore.addMember({ ...member, absenceCount: 0 }).catch(() => {})
}

// ─── Export ──────────────────────────────────────────────────────────────────
function doExport() {
  exportCSV(
    filteredYouth.value.map((m) => ({
      Name: m.name,
      Gender: m.gender,
      Phone: m.phone,
      Email: m.email,
      'Date of Birth': m.dob ?? '',
      Status: m.status,
      School: m.school ?? '',
      Department: m.department ?? '',
      'Course of Study': m.courseOfStudy ?? '',
      Programme: m.program ?? '',
      Level: m.level ?? '',
      'Hall of Residence': m.hallOfResidence ?? '',
      'Year of Entry': m.yearOfEntry ?? '',
      'Year of Exit': m.yearOfExit ?? '',
      Comment: m.comment ?? '',
    })),
    'youth-members'
  )
}

const showImport = ref(false)

async function onImport(members: Omit<Member, 'id' | 'absenceCount'>[]) {
  // Sequential so a mid-import failure stops rather than firing off dozens of
  // half-finished writes.
  for (const m of members) {
    await membersStore.addMember({ ...m, absenceCount: 0 }).catch(() => {})
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div></div>
      <Button @click="showAddModal = true">
        <template #icon-left><Icon icon="mdi:plus" /></template>
        Add Youth Member
      </Button>
    </div>

    <!-- Stats + Chart row -->
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <!-- Stats 2×2 grid -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-2">
        <Card v-for="card in statCards" :key="card.label" padding="none" class="flex flex-col p-5">
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              {{ card.label }}
            </p>
            <Badge :variant="card.change >= 0 ? 'success' : 'danger'" size="sm" class="num">
              <template #icon>
                <Icon
                  :icon="card.change >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'"
                  class="text-[10px]"
                  aria-hidden="true"
                />
              </template>
              {{ Math.abs(card.change) }}%
            </Badge>
          </div>
          <p class="num mt-2 font-display text-3xl leading-none text-ink">
            {{ card.value }}
          </p>
          <div class="mt-3 flex items-center justify-between gap-3">
            <p class="num text-xs text-ink-subtle">{{ card.subtitle }}</p>
            <button
              class="inline-flex shrink-0 cursor-pointer items-center gap-0.5 text-xs font-medium text-primary-ink underline-offset-3 hover:text-primary-hover hover:underline"
              @click="viewList(card.tab)"
            >
              View List
              <Icon icon="mdi:chevron-right" class="text-sm" aria-hidden="true" />
            </button>
          </div>
        </Card>
      </div>

      <!-- Donut chart -->
      <Card padding="none" class="flex flex-col p-5">
        <h3 class="font-sans text-base font-semibold text-ink">Youth Summary</h3>
        <div class="mt-4">
          <DonutChart v-if="youthByStatus.length" :data="donutData" :height="180" />
          <p v-else class="py-10 text-center text-xs leading-relaxed text-ink-muted">
            {{ emptyYouthReason }}
          </p>
        </div>
      </Card>
    </div>

    <!-- Filter bar -->
    <div
      ref="tableRef"
      class="flex scroll-mt-4 flex-col justify-between gap-3 sm:flex-row sm:items-center"
    >
      <Tabs v-model="activeTab" :tabs="tabs" />
      <div class="flex shrink-0 gap-2">
        <Button variant="secondary" size="sm" @click="doExport">
          <template #icon-left><Icon icon="mdi:upload-outline" /></template>
          Export CSV
        </Button>
        <Button variant="secondary" size="sm" @click="showImport = true">
          <template #icon-left><Icon icon="mdi:download-outline" /></template>
          Import CSV
        </Button>
      </div>
    </div>

    <!-- Search -->
    <div class="flex gap-2 rounded-sm border border-rule bg-surface p-3">
      <div class="relative flex-1">
        <Icon
          icon="mdi:magnify"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base text-ink-subtle"
          aria-hidden="true"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search youth members..."
          class="min-h-9 w-full rounded-md border border-rule-strong bg-surface py-1.5 pr-3 pl-9 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          aria-label="Search youth"
        />
      </div>
      <Button variant="secondary" size="sm">
        <template #icon-left><Icon icon="mdi:filter-outline" /></template>
        Filter
      </Button>
    </div>

    <!-- With no youth at all, show only the page-level empty state — the table
         renders its own "no members found" row and the two would stack. -->
    <Card v-if="!membersStore.youthMembers.length">
      <EmptyState
        icon="mdi:account-star-outline"
        title="No youth members yet"
        description="Members aged 13–35 appear here automatically once their date of birth is recorded."
      >
        <template #action>
          <Button @click="showAddModal = true">
            <template #icon-left><Icon icon="mdi:plus" /></template>
            Add Youth Member
          </Button>
        </template>
      </EmptyState>
    </Card>

    <!-- Table — passes filtered youth as items prop -->
    <MemberTable v-else :items="filteredYouth" @select="openPanel" @edit="openPanelEdit" />

    <!-- Detail panel -->
    <MemberDetailPanel v-model="panelOpen" :member="selectedMember" :auto-edit="panelAutoEdit" />

    <AddMemberModal
      v-model="showAddModal"
      title="Add Youth Member"
      :youth-mode="true"
      @save="onMemberSaved"
    />

    <ImportCsvModal v-model="showImport" @import="onImport" />
  </div>
</template>
