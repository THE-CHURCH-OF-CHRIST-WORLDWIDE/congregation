<script setup lang="ts">
import type { Member } from '~/types'

interface Props {
  member: Member | null
  modelValue: boolean
  autoEdit?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  'delete': [member: Member]
}>()

const membersStore = useMembersStore()

// ─── mode ────────────────────────────────────────────────────────────────────
const mode = ref<'view' | 'edit'>('view')

// ─── Edit form state ─────────────────────────────────────────────────────────
const ef = reactive<Partial<Member> & { ecName: string; ecRelationship: string; ecPhone: string; ecAddress: string }>({
  name: '', gender: 'Male', phone: '', email: '', dob: '',
  status: 'Active', maritalStatus: '', dateOfBaptism: '', dateJoined: '',
  country: '', state: '', localGovernment: '', village: '',
  address: '', occupation: '',
  ecName: '', ecRelationship: '', ecPhone: '', ecAddress: '',
})

function startEdit() {
  if (!props.member) return
  const m = props.member
  Object.assign(ef, {
    name: m.name ?? '', gender: m.gender ?? 'Male', phone: m.phone ?? '',
    email: m.email ?? '', dob: m.dob ?? '', status: m.status ?? 'Active',
    maritalStatus: m.maritalStatus ?? '', dateOfBaptism: m.dateOfBaptism ?? '',
    dateJoined: m.dateJoined ?? '', country: m.country ?? '',
    state: m.state ?? '', localGovernment: m.localGovernment ?? '',
    village: m.village ?? '', address: m.address ?? '', occupation: m.occupation ?? '',
    ecName: m.emergencyContact?.name ?? '',
    ecRelationship: m.emergencyContact?.relationship ?? '',
    ecPhone: m.emergencyContact?.phone ?? '',
    ecAddress: m.emergencyContact?.address ?? '',
  })
  mode.value = 'edit'
}

function saveEdit() {
  if (!props.member) return
  membersStore.updateMember(props.member.id, {
    name: ef.name, gender: ef.gender, phone: ef.phone, email: ef.email,
    dob: ef.dob, status: ef.status, maritalStatus: ef.maritalStatus,
    dateOfBaptism: ef.dateOfBaptism, dateJoined: ef.dateJoined,
    country: ef.country, state: ef.state,
    localGovernment: ef.localGovernment, village: ef.village,
    address: ef.address, occupation: ef.occupation,
    emergencyContact: {
      name: ef.ecName ?? '',
      relationship: ef.ecRelationship ?? '',
      phone: ef.ecPhone ?? '',
      address: ef.ecAddress ?? '',
    },
  })
  mode.value = 'view'
}

function cancelEdit() { mode.value = 'view' }

// Reset to view when panel closes; jump to edit when autoEdit is set
watch(() => props.modelValue, (open) => {
  if (!open) {
    mode.value = 'view'
  } else if (props.autoEdit) {
    nextTick(() => startEdit())
  }
})

// ─── View helpers ─────────────────────────────────────────────────────────────
function close() { emit('update:modelValue', false) }

function onDelete() {
  if (!props.member) return
  membersStore.deleteMember(props.member.id)
  emit('delete', props.member)
  close()
}

function fmt(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

const statusConfig = {
  Active: { variant: 'success', label: 'Active Member' },
  Backslider: { variant: 'danger', label: 'Backslider' },
  Weak: { variant: 'warning', label: 'Weak Brethren' },
  Distant: { variant: 'info', label: 'Distant Member' },
  Withdrawal: { variant: 'neutral', label: 'Withdrawal' },
  Disfellowshipped: { variant: 'danger', label: 'Disfellowshipped' },
  Transfer: { variant: 'info', label: 'Transfer' },
  Late: { variant: 'warning', label: 'Late Brethren' },
} as const

const memberStatus = computed(() =>
  statusConfig[props.member?.status ?? 'Active'] ?? statusConfig.Active
)

onMounted(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
  document.addEventListener('keydown', handler)
  onUnmounted(() => document.removeEventListener('keydown', handler))
})

// Gender options for edit form select
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
  { label: 'Disfellowshipped', value: 'Disfellowshipped' },
  { label: 'Transfer', value: 'Transfer' },
  { label: 'Late', value: 'Late' },
]
const img = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/25 z-40"
        aria-hidden="true"
        @click="close"
      ></div>
    </Transition>

    <!-- Panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="modelValue && member"
        :class="[
          'fixed top-0 right-0 h-full bg-white z-50 flex flex-col shadow-2xl overflow-hidden transition-[width] duration-300',
          mode === 'edit' ? 'w-full sm:w-[680px]' : 'w-200',
        ]"
        :aria-label="mode === 'edit' ? `Edit ${member.name}` : `${member.name} profile`"
      >

        <!-- ══════════════════════════════════════════════════
             VIEW MODE
        ═══════════════════════════════════════════════════ -->
        <template v-if="mode === 'view'">
          <!-- Top bar -->
          <div class="flex items-center justify-between px-4 py-3 bg-gray-100 shrink-0">
            <button
              class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
              aria-label="Close panel"
              @click="close"
            >
              <Icon icon="mdi:close" class="text-lg" />
            </button>
            <button class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors" aria-label="More options">
              <Icon icon="mdi:dots-vertical" class="text-lg" />
            </button>
          </div>

          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto px-4 pb-6 space-y-3 sidebar-scroll bg-white pt-4">
            <!-- Hero card -->
            <div class="bg-[#F0F9FF] rounded-2xl px-4 py-2 flex items-center gap-4">
              <img :src="img" alt="profile-img" class="w-30 h-30 mb-3 shadow-2xl rounded-2xl object-cover object-center" />
              <div class="space-y-1">
                <div class="flex gap-4 items-center">
                  <h2 class=" font-montserrat text-base font-bold leading-6">{{ member.name }}</h2>
                  <button class=" flex items-center justify-center hover:bg-gray-50" aria-label="Edit avatar">
                    <Icon icon="mdi:square-edit-outline" class="text-[20px] text-black" />
                  </button>
                </div>
              <p class="text-[#717680] text-base font-normal leading-6">
                Church Number: <span class="text-[#717680] text-base font-semibold leading-[145%]">{{ member.churchNumber ?? '—' }}</span>
              </p>
              <Badge :variant="memberStatus.variant" size="md">
                <template #icon><Icon icon="mdi:check" class="text-[10px]" /></template>
                {{ memberStatus.label }}
              </Badge>
              </div>
            </div>

            <!-- Members Information -->
            <div class="bg-white rounded-2xl p-4 border-[#7CD4FD] border">
              <h3 class="text-xs font-bold text-gray-700 mb-3">Members Information</h3>
              <div class="grid grid-cols-2 gap-x-3 gap-y-3">
                <InfoField icon="mdi:account-outline" label="Name" :value="member.name" />
                <InfoField icon="mdi:email-outline" label="Email Address" :value="member.email" />
                <InfoField icon="mdi:phone-outline" label="Phone Number" :value="member.phone" />
                <InfoField icon="mdi:gender-male-female" label="Gender" :value="member.gender" />
                <InfoField icon="mdi:ring" label="Marital Status" :value="member.maritalStatus ?? '—'" />
                <InfoField icon="mdi:water-outline" label="Date of Baptism" :value="fmt(member.dateOfBaptism)" />
                <InfoField icon="mdi:calendar-account-outline" label="Date Joined" :value="fmt(member.dateJoined)" />
                <InfoField v-if="member.dob" icon="mdi:cake-variant-outline" label="Date of Birth" :value="fmt(member.dob)" />
              </div>
            </div>

            <!-- Place of Origin -->
            <div class="bg-white rounded-2xl p-4 border-[#7CD4FD] border">
              <h3 class="text-xs font-bold text-gray-700 mb-3">Place of Origin</h3>
              <div class="grid grid-cols-2 gap-x-3 gap-y-3">
                <InfoField icon="mdi:earth" label="Country" :value="member.country ?? '—'" />
                <InfoField icon="mdi:map-marker-outline" label="State" :value="member.state ?? '—'" />
                <InfoField icon="mdi:city-variant-outline" label="Local Government" :value="member.localGovernment ?? '—'" />
                <InfoField icon="mdi:home-outline" label="Village" :value="member.village ?? '—'" />
              </div>
            </div>

            <!-- Place of Residence -->
            <div class="bg-white rounded-2xl p-4 border-[#7CD4FD] border">
              <h3 class="text-xs font-bold text-gray-700 mb-3">Place of Residence</h3>
              <div class="grid grid-cols-2 gap-x-3 gap-y-3">
                <InfoField icon="mdi:earth" label="Country" :value="member.country ?? '—'" />
                <InfoField icon="mdi:map-marker-outline" label="State" :value="member.state ?? '—'" />
                <InfoField icon="mdi:map-marker-radius-outline" label="Address" :value="member.address ?? '—'" class="col-span-2" />
                <InfoField icon="mdi:briefcase-outline" label="Occupation" :value="member.occupation ?? '—'" />
              </div>
            </div>

            <!-- Emergency Contact -->
            <div v-if="member.emergencyContact" class="bg-white rounded-2xl p-4 border-[#F3A218] border">
              <h3 class="text-xs font-bold text-gray-700 mb-3">Emergency Contact</h3>
              <div class="grid grid-cols-2 gap-x-3 gap-y-3">
                <InfoField icon="mdi:account-outline" label="Name" :value="member.emergencyContact.name" variant="warning"/>
                <InfoField icon="mdi:account-heart-outline" label="Relationship" :value="member.emergencyContact.relationship" variant="warning"/>
                <InfoField icon="mdi:phone-outline" label="Phone Number" :value="member.emergencyContact.phone" variant="warning"/>
                <InfoField icon="mdi:map-marker-radius-outline" label="Address" :value="member.emergencyContact.address" class="col-span-2" variant="warning"/>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-1">
              <button
                class="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                @click="startEdit"
              >
                <Icon icon="mdi:pencil-outline" class="text-base" />
                Edit Details
              </button>
              <button
                class="flex items-center justify-center gap-1.5 border border-red-500 text-red-500 hover:bg-red-50 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                @click="onDelete"
              >
                <Icon icon="mdi:trash-can-outline" class="text-base" />
                Delete
              </button>
            </div>
          </div>
        </template>

        <!-- ══════════════════════════════════════════════════
             EDIT MODE
        ═══════════════════════════════════════════════════ -->
        <template v-else>
          <!-- Edit header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <div class="flex items-center gap-3">
              <button
                class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Back to view"
                @click="cancelEdit"
              >
                <Icon icon="mdi:arrow-top-left" class="text-lg" />
              </button>
              <div>
                <h2 class="text-base font-bold text-gray-900 leading-tight">Edit Members Information</h2>
                <p class="text-xs text-gray-400 mt-0.5">Update the member information below.</p>
              </div>
            </div>
            <button
              class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              aria-label="Next section"
            >
              <Icon icon="mdi:chevron-right" class="text-xl" />
            </button>
          </div>

          <!-- Edit form (scrollable) -->
          <div class="flex-1 overflow-y-auto px-5 py-5 space-y-6 sidebar-scroll">

            <!-- ── Personal Information ─────────────────────── -->
            <section>
              <h3 class="text-base font-bold text-gray-900 mb-4">Personal Information</h3>
              <div class="space-y-4">
                <!-- Name | Email -->
                <div class="grid grid-cols-2 gap-3">
                  <EditField label="Name">
                    <input v-model="ef.name" type="text" placeholder="Full name" />
                  </EditField>
                  <EditField label="Email Address">
                    <input v-model="ef.email" type="email" placeholder="email@example.com" />
                  </EditField>
                </div>

                <!-- Date of Baptism | Date of Registration -->
                <div class="grid grid-cols-2 gap-3">
                  <EditField label="Date of Baptism">
                    <input v-model="ef.dateOfBaptism" type="date" />
                  </EditField>
                  <EditField label="Date of Registration">
                    <input v-model="ef.dateJoined" type="date" />
                  </EditField>
                </div>

                <!-- Phone | Gender | Marital Status -->
                <div class="grid grid-cols-4 gap-3">
                  <EditField label="Phone Number" class="col-span-2">
                    <input v-model="ef.phone" type="tel" placeholder="+234 800 000 0000" />
                  </EditField>
                  <EditField label="Gender" class="col-span-1">
                    <select v-model="ef.gender">
                      <option v-for="o in genderOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
                    </select>
                  </EditField>
                  <EditField label="Marital Status" class="col-span-1">
                    <input v-model="ef.maritalStatus" type="text" placeholder="Single" />
                  </EditField>
                </div>

                <!-- Status | Occupation (bonus fields) -->
                <div class="grid grid-cols-2 gap-3">
                  <EditField label="Member Status">
                    <select v-model="ef.status">
                      <option v-for="o in statusOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
                    </select>
                  </EditField>
                  <EditField label="Occupation">
                    <input v-model="ef.occupation" type="text" placeholder="e.g. Teacher" />
                  </EditField>
                </div>
              </div>
            </section>

            <!-- ── Place of Origin ─────────────────────────── -->
            <section>
              <h3 class="text-base font-bold text-gray-900 mb-4">Place of Origin</h3>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <EditField label="Country">
                    <input v-model="ef.country" type="text" placeholder="Nigeria" />
                  </EditField>
                  <EditField label="State of Origin">
                    <input v-model="ef.state" type="text" placeholder="Akwa Ibom State" />
                  </EditField>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <EditField label="Local Government Area">
                    <input v-model="ef.localGovernment" type="text" placeholder="Ibiono Ibom" />
                  </EditField>
                  <EditField label="Village">
                    <input v-model="ef.village" type="text" placeholder="Ikot Oku" />
                  </EditField>
                </div>
              </div>
            </section>

            <!-- ── Residential Address ─────────────────────── -->
            <section>
              <h3 class="text-base font-bold text-gray-900 mb-4">Residential Address</h3>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <EditField label="Country">
                    <input v-model="ef.country" type="text" placeholder="Nigeria" />
                  </EditField>
                  <EditField label="State">
                    <input v-model="ef.state" type="text" placeholder="Akwa Ibom State" />
                  </EditField>
                </div>
                <EditField label="Address">
                  <input v-model="ef.address" type="text" placeholder="No. 8 Convent Road, Ikot Ekpene" />
                </EditField>
              </div>
            </section>

            <!-- ── Save / Cancel ───────────────────────────── -->
            <div class="flex gap-3">
              <button
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                @click="saveEdit"
              >
                Save Changes
              </button>
              <button
                class="px-5 border border-gray-300 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                @click="cancelEdit"
              >
                Cancel
              </button>
            </div>

            <!-- ── Emergency Contact ───────────────────────── -->
            <section>
              <h3 class="text-base font-bold text-gray-900 mb-4">Emergency Contact</h3>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <EditField label="Name">
                    <input v-model="ef.ecName" type="text" placeholder="Brother John Adebayo" />
                  </EditField>
                  <EditField label="Relationship">
                    <input v-model="ef.ecRelationship" type="text" placeholder="Brother" />
                  </EditField>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <EditField label="Phone Number">
                    <input v-model="ef.ecPhone" type="tel" placeholder="+234 803 333 4444" />
                  </EditField>
                  <EditField label="Address">
                    <input v-model="ef.ecAddress" type="text" placeholder="Full address" />
                  </EditField>
                </div>
              </div>
            </section>

          </div>
        </template>

      </aside>
    </Transition>
  </Teleport>
</template>
