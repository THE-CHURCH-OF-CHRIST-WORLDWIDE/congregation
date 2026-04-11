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
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.includes(q)
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
  },
  {
    label: 'Youth Girls',
    value: membersStore.youthGirlsCount,
    subtitle: `${membersStore.youthMembers.length - membersStore.youthGirlsCount} boys`,
    change: 8,
  },
  {
    label: 'Youth Boys',
    value: membersStore.youthBoysCount,
    subtitle: `${membersStore.youthMembers.length - membersStore.youthBoysCount} girls`,
    change: 15,
  },
  {
    label: 'Active Youth',
    value: membersStore.youthActiveCount,
    subtitle: `${membersStore.youthMembers.length - membersStore.youthActiveCount} inactive`,
    change: 10,
  },
])

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
const selectedMember = ref<Member | null>(null)

function openPanel(member: Member) {
  selectedMember.value = member
  panelOpen.value = true
}

// ─── Add modal ───────────────────────────────────────────────────────────────
const showAddModal = ref(false)

const newMember = reactive<Omit<Member, 'id' | 'absenceCount'>>({
  name: '',
  gender: 'Male',
  phone: '',
  email: '',
  dob: '',
  status: 'Active',
})

const addErrors = reactive({ name: '', email: '', phone: '' })

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
]

const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Backslider', value: 'Backslider' },
  { label: 'Weak', value: 'Weak' },
  { label: 'Distant', value: 'Distant' },
  { label: 'Withdrawal', value: 'Withdrawal' },
]

function validateAndSave() {
  addErrors.name = newMember.name ? '' : 'Name is required'
  addErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email) ? '' : 'Valid email required'
  addErrors.phone = newMember.phone ? '' : 'Phone is required'

  if (addErrors.name || addErrors.email || addErrors.phone) return

  membersStore.addMember({ ...newMember, absenceCount: 0 })
  closeModal()
}

function closeModal() {
  showAddModal.value = false
  Object.assign(newMember, { name: '', gender: 'Male', phone: '', email: '', dob: '', status: 'Active' })
  Object.assign(addErrors, { name: '', email: '', phone: '' })
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

function doImport() {
  const el = document.createElement('input')
  el.type = 'file'
  el.accept = '.csv'
  el.click()
}

// ─── Age helper ───────────────────────────────────────────────────────────────
function getAge(dob?: string) {
  if (!dob) return '—'
  const age = new Date().getFullYear() - new Date(dob).getFullYear()
  return `${age} yrs`
}
</script>

<template>
  <div class="flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div />
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
                <Icon :icon="card.change >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'" class="text-[10px]" />
              </template>
              {{ Math.abs(card.change) }}%
            </Badge>
          </div>
          <button class="mt-3 text-xs text-blue-600 hover:underline">View List</button>
        </Card>
      </div>

      <!-- Donut chart -->
      <div class="bg-slate-800 rounded-xl p-4 flex flex-col">
        <h3 class="text-sm font-semibold text-white mb-3">Youth Summary</h3>
        <DonutChart :data="donutData" :height="180" />
      </div>
    </div>

    <!-- Filter bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <Tabs :tabs="tabs" v-model="activeTab" />
      <div class="flex gap-2 shrink-0">
        <Button variant="secondary" size="sm" @click="doExport">
          <template #icon-left><Icon icon="mdi:upload-outline" /></template>
          Export CSV
        </Button>
        <Button variant="secondary" size="sm" @click="doImport">
          <template #icon-left><Icon icon="mdi:download-outline" /></template>
          Import CSV
        </Button>
      </div>
    </div>

    <!-- Search -->
    <div class="flex gap-2">
      <div class="relative flex-1">
        <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
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
    <MemberTable :items="filteredYouth" @select="openPanel" />

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
    <MemberDetailPanel
      v-model="panelOpen"
      :member="selectedMember"
    />

    <!-- Add modal -->
    <Modal
      v-model="showAddModal"
      title="Add Youth Member"
      size="lg"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          v-model="newMember.name"
          label="Full Name"
          placeholder="Enter full name"
          required
          :error="addErrors.name"
        />
        <Select
          v-model="newMember.gender"
          label="Gender"
          :options="genderOptions"
          required
        />
        <Input
          v-model="newMember.phone"
          label="Phone Number"
          placeholder="+234 800 000 0000"
          required
          :error="addErrors.phone"
        />
        <Input
          v-model="newMember.email"
          label="Email Address"
          type="email"
          placeholder="member@example.com"
          required
          :error="addErrors.email"
        />
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">
            Date of Birth<span class="text-red-500 ml-0.5">*</span>
          </label>
          <input
            v-model="newMember.dob"
            type="date"
            class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            aria-label="Date of birth"
          />
          <p class="text-xs text-gray-400">Must be between 13–35 years old to appear in Youth list</p>
        </div>
        <Select
          v-model="newMember.status"
          label="Member Status"
          :options="statusOptions"
          required
        />
      </div>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <Button variant="secondary" @click="closeModal">Cancel</Button>
          <Button @click="validateAndSave">
            Add Member
          </Button>
        </div>
      </template>
    </Modal>

  </div>
</template>
