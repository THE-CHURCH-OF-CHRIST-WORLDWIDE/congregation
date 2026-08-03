<script setup lang="ts">
import type { EmergencyContact, Member } from '~/types'

definePageMeta({
  layout: 'default',
  pageTransition: { name: 'fade', mode: 'out-in' },
})

useSeoMeta({
  title: 'Member Registration — Church of Christ',
  description:
    'Register as a member of the Church of Christ, Ikot Ekpene. Fill in your personal, origin and contact details to be added to the nominal roll.',
  ogTitle: 'Member Registration — Church of Christ',
  ogDescription: 'Join the nominal roll of the Church of Christ, Ikot Ekpene.',
})

const membersStore = useMembersStore()
const toast = useToast()

/**
 * Self-registration collects the same fields the admin nominal roll holds, minus
 * the ones the church assigns: `status`, `absenceCount` and `churchNumber` are
 * set by the secretary after the record is reviewed.
 */
type RegistrationForm = Omit<Member, 'id' | 'absenceCount' | 'status' | 'churchNumber'> & {
  ecName: string
  ecRelationship: string
  ecPhone: string
  ecAddress: string
}

const today = new Date().toISOString().slice(0, 10)

function emptyForm(): RegistrationForm {
  return {
    // Personal
    name: '',
    gender: 'Male',
    phone: '',
    email: '',
    dob: '',
    maritalStatus: '',
    occupation: '',
    avatar: '',
    // Church
    dateOfBaptism: '',
    dateJoined: today,
    // Place of origin
    country: 'Nigeria',
    state: '',
    localGovernment: '',
    village: '',
    // Residence
    address: '',
    // Previous congregation
    previousCongregation: '',
    previousMinisterPhone: '',
    // Emergency contact (flat while editing)
    ecName: '',
    ecRelationship: '',
    ecPhone: '',
    ecAddress: '',
  }
}

const form = reactive<RegistrationForm>(emptyForm())

const genderOptions: Member['gender'][] = ['Male', 'Female']
const maritalOptions = ['Single', 'Married', 'Widowed', 'Divorced']

// ─── Validation ───────────────────────────────────────────────────────────────
type FieldErrors = Partial<
  Record<
    'avatar' | 'name' | 'email' | 'phone' | 'dob' | 'address' | 'previousMinisterPhone',
    string
  >
>
const errors = ref<FieldErrors>({})
const submitting = ref(false)
const submitted = ref(false)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Accepts local (08012345678) and international (+234 801 234 5678) formats.
const PHONE_RE = /^\+?[\d\s-]{7,20}$/

function validate(): boolean {
  // Checked in the order the fields appear on the page, so scrolling to the
  // first error lands on the topmost one.
  const next: FieldErrors = {}

  if (!form.avatar) next.avatar = 'A passport photograph is required'

  if (!form.name.trim()) next.name = 'Your full name is required'

  // Email is optional — many members register with a phone number only.
  //
  // Uniqueness is deliberately NOT checked here. This is an unauthenticated
  // page, and comparing against the roll would mean granting anonymous read
  // access to every member's record. Duplicates are cheap for the secretary to
  // spot on the nominal roll; leaked member data is not. Enforce it in
  // Firestore rules or a Cloud Function if it needs to be automatic.
  const email = form.email.trim().toLowerCase()
  if (email && !EMAIL_RE.test(email)) next.email = 'Enter a valid email address'

  if (!form.phone.trim()) next.phone = 'Phone number is required'
  else if (!PHONE_RE.test(form.phone.trim())) next.phone = 'Enter a valid phone number'

  if (form.dob && form.dob > today) next.dob = 'Date of birth cannot be in the future'

  if (!form.address?.trim()) next.address = 'Residential address is required'

  const ministerPhone = form.previousMinisterPhone?.trim()
  if (ministerPhone && !PHONE_RE.test(ministerPhone))
    next.previousMinisterPhone = 'Enter a valid phone number'

  errors.value = next
  return Object.keys(next).length === 0
}

const firstErrorField = computed(() => Object.keys(errors.value)[0])

// ─── Submit ───────────────────────────────────────────────────────────────────
async function submit() {
  if (!validate()) {
    toast.error('Please correct the highlighted fields')
    const el = document.getElementById(`field-${firstErrorField.value}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  submitting.value = true

  const emergencyContact: EmergencyContact | undefined =
    form.ecName.trim() || form.ecPhone.trim()
      ? {
          name: form.ecName.trim(),
          relationship: form.ecRelationship.trim(),
          phone: form.ecPhone.trim(),
          address: form.ecAddress.trim(),
        }
      : undefined

  try {
    await membersStore.addMember({
      name: form.name.trim(),
      gender: form.gender,
      phone: form.phone.trim(),
      email: form.email.trim(),
      dob: form.dob,
      status: 'Active',
      absenceCount: 0,
      avatar: form.avatar,
      maritalStatus: form.maritalStatus,
      dateOfBaptism: form.dateOfBaptism,
      dateJoined: form.dateJoined || today,
      occupation: form.occupation,
      country: form.country,
      state: form.state,
      localGovernment: form.localGovernment,
      village: form.village,
      address: form.address,
      previousCongregation: form.previousCongregation?.trim(),
      previousMinisterPhone: form.previousMinisterPhone?.trim(),
      emergencyContact,
    })
    submitted.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch {
    // The store already surfaced the reason via toast. Keep the form filled in
    // so nothing the member typed is lost to a failed write.
  } finally {
    submitting.value = false
  }
}

function registerAnother() {
  Object.assign(form, emptyForm())
  errors.value = {}
  submitted.value = false
}

// Drop the photo error the moment one is uploaded — leaving it up next to a
// visible thumbnail reads as though the upload failed.
watch(
  () => form.avatar,
  (url) => {
    if (url && errors.value.avatar) errors.value = { ...errors.value, avatar: undefined }
  }
)

const registeredName = ref('')
watch(submitted, (v) => {
  if (v) registeredName.value = form.name.trim()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <!-- Page header -->
    <div class="border-b border-gray-100 bg-white py-8">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div class="mb-1 flex items-center gap-2 text-xs font-medium text-gray-400">
          <NuxtLink to="/" class="transition-colors hover:text-blue-600">Home</NuxtLink>
          <Icon icon="mdi:chevron-right" class="h-3.5 w-3.5" />
          <span class="text-gray-600">Register</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">Member Registration</h1>
        <p class="mt-1 text-sm text-gray-500">
          Fill in your details to be added to the church nominal roll. Fields marked
          <span class="text-red-500">*</span> are required.
        </p>
      </div>
    </div>

    <div class="mx-auto max-w-3xl px-4 pt-6 sm:px-6 lg:px-8">
      <!-- ── Success state ──────────────────────────────────────────────────── -->
      <Card v-if="submitted" padding="lg">
        <div class="flex flex-col items-center py-8 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <Icon icon="mdi:check-circle-outline" class="text-3xl text-green-600" />
          </div>
          <h2 class="mt-4 text-xl font-bold text-gray-900">Registration received</h2>
          <p class="mt-1 max-w-md text-sm text-gray-500">
            Thank you{{ registeredName ? `, ${registeredName}` : '' }}. Your details have been
            submitted to the church secretary. You will be contacted once your record is confirmed
            on the nominal roll.
          </p>
          <div class="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="secondary" @click="registerAnother">
              <template #icon-left><Icon icon="mdi:account-plus-outline" /></template>
              Register another member
            </Button>
            <NuxtLink to="/">
              <Button>Back to Home</Button>
            </NuxtLink>
          </div>
        </div>
      </Card>

      <!-- ── Form ───────────────────────────────────────────────────────────── -->
      <form v-else class="flex flex-col gap-4" novalidate @submit.prevent="submit">
        <!-- Personal Information -->
        <Card padding="lg">
          <section>
            <div class="mb-5 flex items-start gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Icon icon="mdi:account-outline" class="text-lg text-accent" />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-gray-900">Personal Information</h2>
                <p class="text-xs text-gray-500">How the church can identify and reach you.</p>
              </div>
            </div>

            <div class="space-y-4">
              <div
                id="field-avatar"
                class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
              >
                <div :class="errors.avatar ? 'rounded-full ring-2 ring-red-400' : ''">
                  <ImageUpload
                    v-model="form.avatar"
                    shape="circle"
                    folder="members"
                    :max-bytes="2 * 1024 * 1024"
                  />
                </div>
                <div>
                  <p class="text-xs text-gray-500">
                    Passport photograph <span class="text-red-500">*</span><br />
                    JPG or PNG. Large photos are compressed automatically.
                  </p>
                  <p v-if="errors.avatar" class="mt-1 text-xs text-red-500">{{ errors.avatar }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <EditField id="field-name" label="Full Name *">
                  <input
                    v-model="form.name"
                    type="text"
                    autocomplete="name"
                    placeholder="Enter your full name"
                    :class="errors.name ? 'border-red-400 focus:border-red-400' : ''"
                  />
                  <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
                </EditField>
                <EditField id="field-email" label="Email Address">
                  <input
                    v-model="form.email"
                    type="email"
                    autocomplete="email"
                    placeholder="you@example.com (optional)"
                    :class="errors.email ? 'border-red-400 focus:border-red-400' : ''"
                  />
                  <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
                </EditField>
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <EditField id="field-phone" label="Phone Number *" class="sm:col-span-2">
                  <input
                    v-model="form.phone"
                    type="tel"
                    autocomplete="tel"
                    placeholder="+234 800 000 0000"
                    :class="errors.phone ? 'border-red-400 focus:border-red-400' : ''"
                  />
                  <p v-if="errors.phone" class="mt-1 text-xs text-red-500">{{ errors.phone }}</p>
                </EditField>
                <EditField label="Gender">
                  <select v-model="form.gender">
                    <option v-for="g in genderOptions" :key="g" :value="g">{{ g }}</option>
                  </select>
                </EditField>
                <EditField label="Marital Status">
                  <select v-model="form.maritalStatus">
                    <option value="">— Select —</option>
                    <option v-for="m in maritalOptions" :key="m" :value="m">{{ m }}</option>
                  </select>
                </EditField>
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <EditField id="field-dob" label="Date of Birth">
                  <input
                    v-model="form.dob"
                    type="date"
                    :max="today"
                    :class="errors.dob ? 'border-red-400 focus:border-red-400' : ''"
                  />
                  <p v-if="errors.dob" class="mt-1 text-xs text-red-500">{{ errors.dob }}</p>
                </EditField>
                <EditField label="Occupation">
                  <input v-model="form.occupation" type="text" placeholder="e.g. Teacher" />
                </EditField>
              </div>
            </div>
          </section>
        </Card>

        <!-- Church Information -->
        <Card padding="lg">
          <section>
            <div class="mb-5 flex items-start gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Icon icon="mdi:church" class="text-lg text-accent" />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-gray-900">Church Information</h2>
                <p class="text-xs text-gray-500">
                  Leave the baptism date blank if you have not yet been baptised.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <EditField label="Date of Baptism">
                <input v-model="form.dateOfBaptism" type="date" :max="today" />
              </EditField>
              <EditField label="Date of Registration">
                <input v-model="form.dateJoined" type="date" :max="today" />
              </EditField>
            </div>
          </section>
        </Card>

        <!-- Previous Congregation -->
        <Card padding="lg">
          <section>
            <div class="mb-5 flex items-start gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Icon icon="mdi:account-switch-outline" class="text-lg text-accent" />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-gray-900">
                  Previous Congregation
                  <span class="text-xs font-normal text-gray-400">(optional)</span>
                </h2>
                <p class="text-xs text-gray-500">
                  If you are transferring from another congregation, tell us where you worshipped
                  and how we can reach the minister there.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <EditField label="Previous Congregation">
                <input
                  v-model="form.previousCongregation"
                  type="text"
                  placeholder="e.g. Church of Christ, Uyo"
                />
              </EditField>
              <EditField id="field-previousMinisterPhone" label="Minister / Preacher's Phone">
                <input
                  v-model="form.previousMinisterPhone"
                  type="tel"
                  placeholder="+234 803 333 4444"
                  :class="errors.previousMinisterPhone ? 'border-red-400 focus:border-red-400' : ''"
                />
                <p v-if="errors.previousMinisterPhone" class="mt-1 text-xs text-red-500">
                  {{ errors.previousMinisterPhone }}
                </p>
              </EditField>
            </div>
          </section>
        </Card>

        <!-- Place of Origin -->
        <Card padding="lg">
          <section>
            <div class="mb-5 flex items-start gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Icon icon="mdi:map-marker-outline" class="text-lg text-accent" />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-gray-900">Place of Origin</h2>
                <p class="text-xs text-gray-500">Where you hail from.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        </Card>

        <!-- Residential Address -->
        <Card padding="lg">
          <section>
            <div class="mb-5 flex items-start gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Icon icon="mdi:home-outline" class="text-lg text-accent" />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-gray-900">Residential Address</h2>
                <p class="text-xs text-gray-500">Where you currently live.</p>
              </div>
            </div>

            <EditField id="field-address" label="Full Address *">
              <input
                v-model="form.address"
                type="text"
                autocomplete="street-address"
                placeholder="No. 8 Convent Road, Ikot Ekpene"
                :class="errors.address ? 'border-red-400 focus:border-red-400' : ''"
              />
              <p v-if="errors.address" class="mt-1 text-xs text-red-500">{{ errors.address }}</p>
            </EditField>
          </section>
        </Card>

        <!-- Emergency Contact -->
        <Card padding="lg">
          <section>
            <div class="mb-5 flex items-start gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Icon icon="mdi:phone-alert-outline" class="text-lg text-accent" />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-gray-900">
                  Emergency Contact
                  <span class="text-xs font-normal text-gray-400">(optional)</span>
                </h2>
                <p class="text-xs text-gray-500">Someone we can reach on your behalf.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        </Card>

        <!-- Submit -->
        <div
          class="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between sm:gap-4"
        >
          <p class="text-xs text-gray-400">
            Your details are used only for church records and are never shared publicly.
          </p>
          <Button type="submit" size="lg" :loading="submitting" class="w-full sm:w-auto">
            <template #icon-left><Icon icon="mdi:account-check-outline" /></template>
            Submit Registration
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
