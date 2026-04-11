<script setup lang="ts">
import type { Member } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Nominal Roll', description: 'Church member nominal roll management.' })

const { setHeader } = usePageHeader()
const membersStore = useMembersStore()

onMounted(() => {
  setHeader('Church Nominal Roll', 'Showing summary and member details for all categories')
})

const showAddModal = ref(false)
const panelOpen = ref(false)
const selectedMember = ref<Member | null>(null)

function openPanel(member: Member) {
  selectedMember.value = member
  panelOpen.value = true
}

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

function validateAndAdd() {
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

const statCards = computed(() => [
  { label: 'Active Members', value: membersStore.activeCount, change: 10, subtitle: `${membersStore.members.length - membersStore.activeCount} inactive` },
  { label: 'Sisters', value: membersStore.sisterCount, change: -10, subtitle: '300 last year' },
  { label: 'Brothers', value: membersStore.brotherCount, change: 10, subtitle: '250 last year' },
  { label: 'Weak Brethren', value: membersStore.weakCount, change: 10, subtitle: '23 last year' },
])
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div />
      <Button @click="showAddModal = true">
        <template #icon-left><Icon icon="mdi:plus" /></template>
        Add New Member
      </Button>
    </div>

    <!-- Stats row + Donut chart -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
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
      <RoleSummaryChart />
    </div>

    <!-- Filters -->
    <MemberFilters />

    <!-- Table -->
    <MemberTable @select="openPanel" />

    <!-- Member detail panel -->
    <MemberDetailPanel
      v-model="panelOpen"
      :member="selectedMember"
    />

    <!-- Add Member Modal -->
    <Modal v-model="showAddModal" title="Add New Member" size="lg">
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
          placeholder="08012345678"
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
          <label class="text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            v-model="newMember.dob"
            type="date"
            class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
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
          <Button @click="validateAndAdd">Add Member</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>
