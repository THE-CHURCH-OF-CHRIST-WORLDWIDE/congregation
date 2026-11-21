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
type FieldErrors = Partial<Record<keyof RegistrationForm, string>>
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
  const blank = (v: string | undefined) => !v?.trim()

  if (!form.avatar) next.avatar = 'A passport photograph is required'

  if (blank(form.name)) next.name = 'Your full name is required'

  // Uniqueness is deliberately NOT checked here. This is an unauthenticated
  // page, and comparing against the roll would mean granting anonymous read
  // access to every member's record. Duplicates are cheap for the secretary to
  // spot on the nominal roll; leaked member data is not. Enforce it in
  // Firestore rules or a Cloud Function if it needs to be automatic.
  const email = form.email.trim().toLowerCase()
  if (!email) next.email = 'Email address is required'
  else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address'

  if (blank(form.phone)) next.phone = 'Phone number is required'
  else if (!PHONE_RE.test(form.phone.trim())) next.phone = 'Enter a valid phone number'

  if (!form.gender) next.gender = 'Gender is required'
  if (!form.maritalStatus) next.maritalStatus = 'Marital status is required'

  if (!form.dob) next.dob = 'Date of birth is required'
  else if (form.dob > today) next.dob = 'Date of birth cannot be in the future'

  if (blank(form.occupation)) next.occupation = 'Occupation is required'

  // Baptism date is optional — leave blank if not yet baptised.
  if (form.dateOfBaptism && form.dateOfBaptism > today)
    next.dateOfBaptism = 'Date of baptism cannot be in the future'

  if (!form.dateJoined) next.dateJoined = 'Date of registration is required'
  else if (form.dateJoined > today) next.dateJoined = 'Date of registration cannot be in the future'

  // Previous congregation and the minister's phone are optional (transfers only);
  // the phone is still format-checked when given.
  const ministerPhone = form.previousMinisterPhone?.trim()
  if (ministerPhone && !PHONE_RE.test(ministerPhone))
    next.previousMinisterPhone = 'Enter a valid phone number'

  if (blank(form.country)) next.country = 'Country is required'
  if (blank(form.state)) next.state = 'State of origin is required'
  if (blank(form.localGovernment)) next.localGovernment = 'Local government area is required'
  if (blank(form.village)) next.village = 'Village is required'

  if (blank(form.address)) next.address = 'Residential address is required'

  if (blank(form.ecName)) next.ecName = 'Emergency contact name is required'
  if (blank(form.ecRelationship)) next.ecRelationship = 'Relationship is required'
  if (blank(form.ecPhone)) next.ecPhone = 'Emergency contact phone is required'
  else if (!PHONE_RE.test(form.ecPhone.trim())) next.ecPhone = 'Enter a valid phone number'
  if (blank(form.ecAddress)) next.ecAddress = 'Emergency contact address is required'

  errors.value = next
  return Object.keys(next).length === 0
}

// Errors are inserted in validate() in page order, so the first key is the topmost.
const firstErrorField = computed(() => Object.keys(errors.value)[0])

const inputError = (key: keyof FieldErrors) =>
  errors.value[key] ? 'border-error focus:border-error' : ''

// ─── Submit ───────────────────────────────────────────────────────────────────
async function submit() {
  if (!validate()) {
    toast.error('Please correct the highlighted fields')
    const el = document.getElementById(`field-${firstErrorField.value}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  submitting.value = true

  const emergencyContact: EmergencyContact = {
    name: form.ecName.trim(),
    relationship: form.ecRelationship.trim(),
    phone: form.ecPhone.trim(),
    address: form.ecAddress.trim(),
  }

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
  <div class="register-form min-h-screen bg-surface-muted pb-20">
    <!-- Page header -->
    <div class="border-b border-rule bg-surface">
      <div class="mx-auto max-w-3xl px-5 py-8 sm:px-6 md:py-12">
        <div class="mb-4 flex items-center gap-1.5 text-sm text-ink-subtle">
          <NuxtLink
            to="/"
            class="rounded-sm py-1 transition-colors duration-150 hover:text-primary-ink"
            >Home</NuxtLink
          >
          <Icon icon="mdi:chevron-right" class="size-4" aria-hidden="true" />
          <span class="text-ink-muted">Register</span>
        </div>
        <div class="margin-rule">
          <h1
            class="font-display text-[2rem] leading-[1.15] font-bold text-secondary md:text-[2.5rem]"
          >
            Member Registration
          </h1>
          <p class="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
            Fill in your details to be added to the church nominal roll. All fields marked
            <span class="font-bold text-error">*</span> are required.
          </p>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-3xl px-4 pt-6 sm:px-6 md:pt-8">
      <!-- ── Success state ──────────────────────────────────────────────────── -->
      <Card v-if="submitted" padding="lg">
        <div class="flex flex-col items-center py-8 text-center">
          <div class="flex size-14 items-center justify-center rounded-full bg-success-soft">
            <Icon
              icon="mdi:check-circle-outline"
              class="text-3xl text-success"
              aria-hidden="true"
            />
          </div>
          <h2 class="mt-4 font-display text-2xl font-bold text-secondary">Registration received</h2>
          <p class="mt-2 max-w-md text-base leading-relaxed text-ink-muted">
            Thank you{{ registeredName ? `, ${registeredName}` : '' }}. Your details have been
            submitted to the church secretary. You will be contacted once your record is confirmed
            on the nominal roll.
          </p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
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
      <form v-else class="flex flex-col gap-5" novalidate @submit.prevent="submit">
        <!-- Personal Information -->
        <Card padding="lg">
          <section>
            <header class="mb-6 border-b border-rule pb-4">
              <h2
                class="flex flex-wrap items-center gap-x-2 font-display text-lg font-semibold text-ink sm:text-xl"
              >
                <Icon
                  icon="mdi:account-outline"
                  class="size-5 shrink-0 text-primary-ink"
                  aria-hidden="true"
                />Personal Information
              </h2>
              <p class="mt-1 text-sm leading-relaxed text-ink-muted">
                How the church can identify and reach you.
              </p>
            </header>

            <div class="space-y-5">
              <div
                id="field-avatar"
                class="flex flex-col items-start gap-4 rounded-md border border-rule bg-surface-muted p-4 sm:flex-row sm:items-center"
              >
                <div :class="errors.avatar ? 'rounded-full ring-2 ring-error' : ''">
                  <ImageUpload
                    v-model="form.avatar"
                    shape="circle"
                    folder="members"
                    :max-bytes="2 * 1024 * 1024"
                  />
                </div>
                <div>
                  <p class="text-sm leading-relaxed text-ink-muted">
                    <span class="font-semibold text-ink">Passport photograph</span>
                    <span class="font-bold text-error">*</span><br />
                    JPG or PNG. Large photos are compressed automatically.
                  </p>
                  <p v-if="errors.avatar" class="mt-1.5 text-sm font-medium text-error">
                    {{ errors.avatar }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                <EditField id="field-name" label="Full Name *">
                  <input
                    v-model="form.name"
                    type="text"
                    autocomplete="name"
                    placeholder="Enter your full name"
                    :class="errors.name ? 'border-error focus:border-error' : ''"
                  />
                  <p v-if="errors.name" class="mt-1.5 text-sm font-medium text-error">
                    {{ errors.name }}
                  </p>
                </EditField>
                <EditField id="field-email" label="Email Address *">
                  <input
                    v-model="form.email"
                    type="email"
                    autocomplete="email"
                    placeholder="you@example.com"
                    :class="errors.email ? 'border-error focus:border-error' : ''"
                  />
                  <p v-if="errors.email" class="mt-1.5 text-sm font-medium text-error">
                    {{ errors.email }}
                  </p>
                </EditField>
              </div>

              <div class="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-4">
                <EditField id="field-phone" label="Phone Number *" class="sm:col-span-2">
                  <input
                    v-model="form.phone"
                    type="tel"
                    autocomplete="tel"
                    placeholder="+234 800 000 0000"
                    :class="errors.phone ? 'border-error focus:border-error' : ''"
                  />
                  <p v-if="errors.phone" class="mt-1.5 text-sm font-medium text-error">
                    {{ errors.phone }}
                  </p>
                </EditField>
                <EditField id="field-gender" label="Gender *">
                  <select v-model="form.gender" :class="inputError('gender')">
                    <option v-for="g in genderOptions" :key="g" :value="g">{{ g }}</option>
                  </select>
                  <p v-if="errors.gender" class="mt-1.5 text-sm font-medium text-error">
                    {{ errors.gender }}
                  </p>
                </EditField>
                <EditField id="field-maritalStatus" label="Marital Status *">
                  <select v-model="form.maritalStatus" :class="inputError('maritalStatus')">
                    <option value="">— Select —</option>
                    <option v-for="m in maritalOptions" :key="m" :value="m">{{ m }}</option>
                  </select>
                  <p v-if="errors.maritalStatus" class="mt-1.5 text-sm font-medium text-error">
                    {{ errors.maritalStatus }}
                  </p>
                </EditField>
              </div>

              <div class="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                <EditField id="field-dob" label="Date of Birth *">
                  <input
                    v-model="form.dob"
                    type="date"
                    :max="today"
                    :class="errors.dob ? 'border-error focus:border-error' : ''"
                  />
                  <p v-if="errors.dob" class="mt-1.5 text-sm font-medium text-error">
                    {{ errors.dob }}
                  </p>
                </EditField>
                <EditField id="field-occupation" label="Occupation *">
                  <input
                    v-model="form.occupation"
                    type="text"
                    placeholder="e.g. Teacher"
                    :class="inputError('occupation')"
                  />
                  <p v-if="errors.occupation" class="mt-1.5 text-sm font-medium text-error">
                    {{ errors.occupation }}
                  </p>
                </EditField>
              </div>
            </div>
          </section>
        </Card>

        <!-- Church Information -->
        <Card padding="lg">
          <section>
            <header class="mb-6 border-b border-rule pb-4">
              <h2
                class="flex flex-wrap items-center gap-x-2 font-display text-lg font-semibold text-ink sm:text-xl"
              >
                <Icon
                  icon="mdi:church"
                  class="size-5 shrink-0 text-primary-ink"
                  aria-hidden="true"
                />Church Information
              </h2>
              <p class="mt-1 text-sm leading-relaxed text-ink-muted">
                Leave the baptism date blank if you have not yet been baptised.
              </p>
            </header>

            <div class="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
              <EditField id="field-dateOfBaptism" label="Date of Baptism">
                <input
                  v-model="form.dateOfBaptism"
                  type="date"
                  :max="today"
                  :class="inputError('dateOfBaptism')"
                />
                <p v-if="errors.dateOfBaptism" class="mt-1.5 text-sm font-medium text-error">
                  {{ errors.dateOfBaptism }}
                </p>
              </EditField>
              <EditField id="field-dateJoined" label="Date of Registration *">
                <input
                  v-model="form.dateJoined"
                  type="date"
                  :max="today"
                  :class="inputError('dateJoined')"
                />
                <p v-if="errors.dateJoined" class="mt-1.5 text-sm font-medium text-error">
                  {{ errors.dateJoined }}
                </p>
              </EditField>
            </div>
          </section>
        </Card>

        <!-- Previous Congregation -->
        <Card padding="lg">
          <section>
            <header class="mb-6 border-b border-rule pb-4">
              <h2
                class="flex flex-wrap items-center gap-x-2 font-display text-lg font-semibold text-ink sm:text-xl"
              >
                <Icon
                  icon="mdi:account-switch-outline"
                  class="size-5 shrink-0 text-primary-ink"
                  aria-hidden="true"
                />
                Previous Congregation
                <span class="font-sans text-sm font-normal text-ink-subtle">(optional)</span>
              </h2>
              <p class="mt-1 text-sm leading-relaxed text-ink-muted">
                If you are transferring from another congregation, tell us where you worshipped and
                how we can reach the minister there.
              </p>
            </header>

            <div class="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
              <EditField id="field-previousCongregation" label="Previous Congregation">
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
                  :class="errors.previousMinisterPhone ? 'border-error focus:border-error' : ''"
                />
                <p
                  v-if="errors.previousMinisterPhone"
                  class="mt-1.5 text-sm font-medium text-error"
                >
                  {{ errors.previousMinisterPhone }}
                </p>
              </EditField>
            </div>
          </section>
        </Card>

        <!-- Place of Origin -->
        <Card padding="lg">
          <section>
            <header class="mb-6 border-b border-rule pb-4">
              <h2
                class="flex flex-wrap items-center gap-x-2 font-display text-lg font-semibold text-ink sm:text-xl"
              >
                <Icon
                  icon="mdi:map-marker-outline"
                  class="size-5 shrink-0 text-primary-ink"
                  aria-hidden="true"
                />Place of Origin
              </h2>
              <p class="mt-1 text-sm leading-relaxed text-ink-muted">Where you hail from.</p>
            </header>

            <div class="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
              <EditField id="field-country" label="Country *">
                <input
                  v-model="form.country"
                  type="text"
                  placeholder="Nigeria"
                  :class="inputError('country')"
                />
                <p v-if="errors.country" class="mt-1.5 text-sm font-medium text-error">
                  {{ errors.country }}
                </p>
              </EditField>
              <EditField id="field-state" label="State of Origin *">
                <input
                  v-model="form.state"
                  type="text"
                  placeholder="Akwa Ibom State"
                  :class="inputError('state')"
                />
                <p v-if="errors.state" class="mt-1.5 text-sm font-medium text-error">
                  {{ errors.state }}
                </p>
              </EditField>
              <EditField id="field-localGovernment" label="Local Government Area *">
                <input
                  v-model="form.localGovernment"
                  type="text"
                  placeholder="Ibiono Ibom"
                  :class="inputError('localGovernment')"
                />
                <p v-if="errors.localGovernment" class="mt-1.5 text-sm font-medium text-error">
                  {{ errors.localGovernment }}
                </p>
              </EditField>
              <EditField id="field-village" label="Village *">
                <input
                  v-model="form.village"
                  type="text"
                  placeholder="Ikot Oku"
                  :class="inputError('village')"
                />
                <p v-if="errors.village" class="mt-1.5 text-sm font-medium text-error">
                  {{ errors.village }}
                </p>
              </EditField>
            </div>
          </section>
        </Card>

        <!-- Residential Address -->
        <Card padding="lg">
          <section>
            <header class="mb-6 border-b border-rule pb-4">
              <h2
                class="flex flex-wrap items-center gap-x-2 font-display text-lg font-semibold text-ink sm:text-xl"
              >
                <Icon
                  icon="mdi:home-outline"
                  class="size-5 shrink-0 text-primary-ink"
                  aria-hidden="true"
                />Residential Address
              </h2>
              <p class="mt-1 text-sm leading-relaxed text-ink-muted">Where you currently live.</p>
            </header>

            <EditField id="field-address" label="Full Address *">
              <input
                v-model="form.address"
                type="text"
                autocomplete="street-address"
                placeholder="No. 8 Convent Road, Ikot Ekpene"
                :class="errors.address ? 'border-error focus:border-error' : ''"
              />
              <p v-if="errors.address" class="mt-1.5 text-sm font-medium text-error">
                {{ errors.address }}
              </p>
            </EditField>
          </section>
        </Card>

        <!-- Emergency Contact -->
        <Card padding="lg">
          <section>
            <header class="mb-6 border-b border-rule pb-4">
              <h2
                class="flex flex-wrap items-center gap-x-2 font-display text-lg font-semibold text-ink sm:text-xl"
              >
                <Icon
                  icon="mdi:phone-alert-outline"
                  class="size-5 shrink-0 text-primary-ink"
                  aria-hidden="true"
                />Emergency Contact
              </h2>
              <p class="mt-1 text-sm leading-relaxed text-ink-muted">
                Someone we can reach on your behalf.
              </p>
            </header>

            <div class="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
              <EditField id="field-ecName" label="Name *">
                <input
                  v-model="form.ecName"
                  type="text"
                  placeholder="Brother John Adebayo"
                  :class="inputError('ecName')"
                />
                <p v-if="errors.ecName" class="mt-1.5 text-sm font-medium text-error">
                  {{ errors.ecName }}
                </p>
              </EditField>
              <EditField id="field-ecRelationship" label="Relationship *">
                <input
                  v-model="form.ecRelationship"
                  type="text"
                  placeholder="Brother"
                  :class="inputError('ecRelationship')"
                />
                <p v-if="errors.ecRelationship" class="mt-1.5 text-sm font-medium text-error">
                  {{ errors.ecRelationship }}
                </p>
              </EditField>
              <EditField id="field-ecPhone" label="Phone Number *">
                <input
                  v-model="form.ecPhone"
                  type="tel"
                  placeholder="+234 803 333 4444"
                  :class="inputError('ecPhone')"
                />
                <p v-if="errors.ecPhone" class="mt-1.5 text-sm font-medium text-error">
                  {{ errors.ecPhone }}
                </p>
              </EditField>
              <EditField id="field-ecAddress" label="Address *">
                <input
                  v-model="form.ecAddress"
                  type="text"
                  placeholder="Full address"
                  :class="inputError('ecAddress')"
                />
                <p v-if="errors.ecAddress" class="mt-1.5 text-sm font-medium text-error">
                  {{ errors.ecAddress }}
                </p>
              </EditField>
            </div>
          </section>
        </Card>

        <!-- Submit -->
        <div
          class="flex flex-col-reverse items-stretch gap-3 border-t border-rule pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <p class="flex items-start gap-1.5 text-sm text-ink-muted">
            <Icon icon="mdi:lock-outline" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Your details are used only for church records and are never shared publicly.
          </p>
          <Button
            type="submit"
            size="lg"
            :loading="submitting"
            class="min-h-13 w-full text-base sm:min-h-12 sm:w-auto"
          >
            <template #icon-left><Icon icon="mdi:account-check-outline" /></template>
            Submit Registration
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Long form for phones and older readers: 16px fields (no iOS zoom), 44px targets, larger labels. */
.register-form :deep(.edit-field-slot input),
.register-form :deep(.edit-field-slot select) {
  min-height: 2.75rem;
  font-size: 1rem;
  line-height: 1.5rem;
}
.register-form :deep(label > span:first-child) {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--c-ink);
}
.register-form :deep(.edit-field-slot input.border-error),
.register-form :deep(.edit-field-slot select.border-error) {
  border-color: var(--c-error);
}
.register-form :deep(.edit-field-slot input.border-error:focus),
.register-form :deep(.edit-field-slot select.border-error:focus) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-error) 15%, transparent);
}
@media (min-width: 640px) {
  .register-form :deep(.edit-field-slot input),
  .register-form :deep(.edit-field-slot select) {
    min-height: 2.625rem;
    font-size: 0.9375rem;
  }
}
</style>
