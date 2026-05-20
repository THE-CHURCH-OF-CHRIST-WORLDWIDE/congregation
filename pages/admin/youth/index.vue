<script setup lang="ts">
import type { Member } from '~/types'
import type { ChartData } from 'chart.js'

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
const donutData = computed<ChartData<'doughnut'>>(() => {
  const youth = membersStore.youthMembers
  const total = youth.length || 1

  const active = youth.filter((m) => m.status === 'Active').length
  const backsliders = youth.filter((m) => m.status === 'Backslider').length
  const distant = youth.filter((m) => m.status === 'Distant').length
  const withdrawal = youth.filter((m) => m.status === 'Withdrawal').length
  const weak = youth.filter((m) => m.status === 'Weak').length

  return {
    labels: ['Active', 'Backsliders', 'Distant', 'Withdrawal', 'Weak'],
    datasets: [
      {
        data: [
          Math.round((active / total) * 100),
          Math.round((backsliders / total) * 100),
          Math.round((distant / total) * 100),
          Math.round((withdrawal / total) * 100),
          Math.round((weak / total) * 100),
        ],
        backgroundColor: ['#3b82f6', '#f59e0b', '#6366f1', '#ef4444', '#22c55e'],
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

function onMemberSaved(member: Omit<Member, 'id' | 'absenceCount'>) {
  membersStore.addMember({ ...member, absenceCount: 0 })
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
    })),
    'youth-members'
  )
}

const showImport = ref(false)

function onImport(members: Omit<Member, 'id' | 'absenceCount'>[]) {
  for (const m of members) {
    membersStore.addMember({ ...m, absenceCount: 0 })
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div></div>
      <Button @click="showAddModal = true">
        <template #icon-left><Icon icon="mdi:plus" /></template>
        Add Youth Member
      </Button>
    </div>

    <!-- Stats + Chart row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <!-- Stats 2×2 grid -->
      <div class="xl:col-span-2 grid grid-cols-2 gap-4">
        <Card v-for="card in statCards" :key="card.label">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs text-gray-500 font-medium">{{ card.label }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ card.value }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ card.subtitle }}</p>
            </div>
            <Badge :variant="card.change >= 0 ? 'success' : 'danger'" size="sm">
              <template #icon>
                <Icon
                  :icon="card.change >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'"
                  class="text-[10px]"
                />
              </template>
              {{ Math.abs(card.change) }}%
            </Badge>
          </div>
          <button
            class="mt-3 text-xs text-blue-600 hover:underline cursor-pointer"
            @click="viewList(card.tab)"
          >
            View List
          </button>
        </Card>
      </div>

      <!-- Donut chart -->
      <div class="bg-slate-800 rounded-xl p-4 flex flex-col">
        <h3 class="text-sm font-semibold text-white mb-3">Youth Summary</h3>
        <DonutChart :data="donutData" :height="180" />
      </div>
    </div>

    <!-- Filter bar -->
    <div ref="tableRef" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <Tabs v-model="activeTab" :tabs="tabs" />
      <div class="flex gap-2 shrink-0">
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
    <div class="flex gap-2">
      <div class="relative flex-1">
        <Icon
          icon="mdi:magnify"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search youth members..."
          class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          aria-label="Search youth"
        />
      </div>
      <Button variant="secondary" size="sm">
        <template #icon-left><Icon icon="mdi:filter-outline" /></template>
        Filter
      </Button>
    </div>

    <!-- Table — passes filtered youth as items prop -->
    <MemberTable :items="filteredYouth" @select="openPanel" @edit="openPanelEdit" />

    <!-- Empty state when no youth at all -->
    <div
      v-if="!membersStore.youthMembers.length"
      class="flex flex-col items-center justify-center py-20 text-gray-400"
    >
      <div class="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <Icon icon="mdi:account-star-outline" class="text-3xl text-blue-400" />
      </div>
      <p class="text-base font-medium text-gray-500">No youth members yet</p>
      <p class="text-sm mt-1">Add youth members aged 13–35 to get started.</p>
      <Button class="mt-4" @click="showAddModal = true">
        <template #icon-left><Icon icon="mdi:plus" /></template>
        Add Youth Member
      </Button>
    </div>

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
