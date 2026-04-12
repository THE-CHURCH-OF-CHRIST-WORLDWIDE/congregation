<script setup lang="ts">
import type { Member, EmergencyContact } from '~/types'

interface Props {
  modelValue: boolean
  title?: string
  /** Show the DOB age hint for youth */
  youthMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Add New Member',
  youthMode: false,
})

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  'save': [member: Omit<Member, 'id' | 'absenceCount'>]
}>()

// ─── Form state ───────────────────────────────────────────────────────────────
const form = reactive<Omit<Member, 'id' | 'absenceCount'> & {
  ecName: string; ecRelationship: string; ecPhone: string; ecAddress: string
}>({
  // Personal
  name: '', gender: 'Male', phone: '', email: '', dob: '',
  status: 'Active', maritalStatus: '', dateOfBaptism: '', dateJoined: '',
  occupation: '',
  // Place of origin
  country: '', state: '', localGovernment: '', village: '',
  // Residential
  address: '',
  // Emergency contact (flat)
  ecName: '', ecRelationship: '', ecPhone: '', ecAddress: '',
})

const errors = reactive({ name: '', email: '', phone: '' })

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

const maritalOptions = [
  { label: 'Single', value: 'Single' },
  { label: 'Married', value: 'Married' },
  { label: 'Widowed', value: 'Widowed' },
  { label: 'Divorced', value: 'Divorced' },
]

// ─── Save ─────────────────────────────────────────────────────────────────────
function save() {
  errors.name = form.name.trim() ? '' : 'Name is required'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : 'Valid email required'
  errors.phone = form.phone.trim() ? '' : 'Phone is required'

  if (errors.name || errors.email || errors.phone) return

  const emergencyContact: EmergencyContact | undefined =
    form.ecName || form.ecPhone
      ? { name: form.ecName, relationship: form.ecRelationship, phone: form.ecPhone, address: form.ecAddress }
      : undefined

  emit('save', {
    name: form.name, gender: form.gender, phone: form.phone, email: form.email,
    dob: form.dob, status: form.status, maritalStatus: form.maritalStatus,
    dateOfBaptism: form.dateOfBaptism, dateJoined: form.dateJoined,
    occupation: form.occupation, country: form.country, state: form.state,
    localGovernment: form.localGovernment, village: form.village,
    address: form.address, emergencyContact,
  })
  close()
}

function close() {
  emit('update:modelValue', false)
  // reset after transition
  setTimeout(reset, 300)
}

function reset() {
  Object.assign(form, {
    name: '', gender: 'Male', phone: '', email: '', dob: '',
    status: 'Active', maritalStatus: '', dateOfBaptism: '', dateJoined: '',
    occupation: '', country: '', state: '', localGovernment: '', village: '',
    address: '', ecName: '', ecRelationship: '', ecPhone: '', ecAddress: '',
  })
  Object.assign(errors, { name: '', email: '', phone: '' })
}

// Reset when closed externally
watch(() => props.modelValue, (v) => { if (!v) setTimeout(reset, 300) })
</script>

<template>
  <Modal :model-value="modelValue" :title="title" size="xl" @update:model-value="close" >
    <div class="flex flex-col gap-6">

      <!-- ── Personal Information ──────────────────────────────────────────── -->
      <section>
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Personal Information</h3>
        <div class="space-y-4">

          <!-- Name | Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EditField label="Full Name *">
              <input
                v-model="form.name"
                type="text"
                placeholder="Enter full name"
                :class="errors.name ? 'border-red-400 focus:border-red-400' : ''"
              />
              <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
            </EditField>
            <EditField label="Email Address *">
              <input
                v-model="form.email"
                type="email"
                placeholder="member@example.com"
                :class="errors.email ? 'border-red-400 focus:border-red-400' : ''"
              />
              <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
            </EditField>
          </div>

          <!-- Date of Baptism | Date of Registration -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EditField label="Date of Baptism">
              <input v-model="form.dateOfBaptism" type="date" />
            </EditField>
            <EditField label="Date of Registration">
              <input v-model="form.dateJoined" type="date" />
            </EditField>
          </div>

          <!-- Phone (wide) | Gender | Marital Status -->
          <div class="grid grid-cols-4 gap-3">
            <EditField label="Phone Number *" class="col-span-2">
              <input
                v-model="form.phone"
                type="tel"
                placeholder="+234 800 000 0000"
                :class="errors.phone ? 'border-red-400 focus:border-red-400' : ''"
              />
              <p v-if="errors.phone" class="text-xs text-red-500 mt-1">{{ errors.phone }}</p>
            </EditField>
            <EditField label="Gender" class="col-span-1">
              <select v-model="form.gender">
                <option v-for="o in genderOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </EditField>
            <EditField label="Marital Status" class="col-span-1">
              <select v-model="form.maritalStatus">
                <option value="">— Select —</option>
                <option v-for="o in maritalOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </EditField>
          </div>

          <!-- Date of Birth | Status | Occupation -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <EditField label="Date of Birth">
              <input v-model="form.dob" type="date" />
              <p v-if="youthMode" class="text-xs text-gray-400 mt-1">Must be 13–35 yrs to appear in Youth</p>
            </EditField>
            <EditField label="Member Status">
              <select v-model="form.status">
                <option v-for="o in statusOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </EditField>
            <EditField label="Occupation">
              <input v-model="form.occupation" type="text" placeholder="e.g. Teacher" />
            </EditField>
          </div>

        </div>
      </section>

      <hr class="border-gray-100" />

      <!-- ── Place of Origin ───────────────────────────────────────────────── -->
      <section>
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Place of Origin</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <EditField label="Country">
            <input v-model="form.country" type="text" placeholder="Nigeria" />
          </EditField>
          <EditField label="State of Origin">
            <input v-model="form.state" type="text" placeholder="Akwa Ibom State" />
          </EditField>
          <EditField label="Local Government Area">
            <input v-model="form.localGovernment" type="text" placeholder="Ibiono Ibom" />
          </EditField>
          <EditField label="Village">
            <input v-model="form.village" type="text" placeholder="Ikot Oku" />
          </EditField>
        </div>
      </section>

      <hr class="border-gray-100" />

      <!-- ── Residential Address ───────────────────────────────────────────── -->
      <section>
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Residential Address</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <EditField label="Country">
            <input v-model="form.country" type="text" placeholder="Nigeria" />
          </EditField>
          <EditField label="State">
            <input v-model="form.state" type="text" placeholder="Akwa Ibom State" />
          </EditField>
          <EditField label="Full Address" class="sm:col-span-2">
            <input v-model="form.address" type="text" placeholder="No. 8 Convent Road, Ikot Ekpene" />
          </EditField>
        </div>
      </section>

      <hr class="border-gray-100" />

      <!-- ── Emergency Contact ─────────────────────────────────────────────── -->
      <section>
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Emergency Contact <span class="text-gray-400 font-normal text-xs">(optional)</span></h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <EditField label="Name">
            <input v-model="form.ecName" type="text" placeholder="Brother John Adebayo" />
          </EditField>
          <EditField label="Relationship">
            <input v-model="form.ecRelationship" type="text" placeholder="Brother" />
          </EditField>
          <EditField label="Phone Number">
            <input v-model="form.ecPhone" type="tel" placeholder="+234 803 333 4444" />
          </EditField>
          <EditField label="Address">
            <input v-model="form.ecAddress" type="text" placeholder="Full address" />
          </EditField>
        </div>
      </section>

    </div>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <Button variant="secondary" @click="close">Cancel</Button>
        <Button @click="save">
          <template #icon-left><Icon icon="mdi:account-plus-outline" /></template>
          Add Member
        </Button>
      </div>
    </template>
  </Modal>
</template>
