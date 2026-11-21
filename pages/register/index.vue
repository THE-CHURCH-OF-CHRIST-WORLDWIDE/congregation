<script setup lang="ts">
import type { EmergencyContact, Member } from '~/types'

definePageMeta({
  layout: 'default',
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
  <div class="register-form bg-surface pb-24 md:pb-32">
    <div class="site-container grid gap-10 pt-12 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pt-24">
      <!-- ── Intro column: the invitation, sticky beside the form on desktop ── -->
      <aside class="lg:col-span-4">
        <div class="lg:sticky lg:top-[calc(var(--nav-h)+2.5rem)]">
          <nav class="hero-animate" aria-label="Breadcrumb">
            <ol class="t-label flex items-center gap-3 text-ink-subtle">
              <li>
                <NuxtLink
                  to="/"
                  class="inline-flex min-h-8 items-center transition-colors duration-300 hover:text-primary-ink"
                  >Home</NuxtLink
                >
              </li>
              <li class="text-rule-strong" aria-hidden="true">/</li>
              <li class="text-ink-muted" aria-current="page">Register</li>
            </ol>
          </nav>

          <h1 class="t-h1 mt-8 text-secondary lg:mt-12">
            <SplitReveal text="Member" immediate :delay="100" />
            {{ ' ' }}
            <SplitReveal text="Registration" immediate :delay="220" class="t-turn" />
          </h1>
          <p class="hero-animate t-lede mt-6 max-w-md" style="animation-delay: 450ms">
            Fill in your details to be added to the church nominal roll. All fields marked
            <span class="font-semibold text-error">*</span> are required.
          </p>

          <ol
            v-if="!submitted"
            class="hero-animate mt-12 hidden border-t border-rule lg:block"
            style="animation-delay: 600ms"
            aria-label="Form sections"
          >
            <li>
              <a
                href="#reg-personal"
                class="group flex min-h-11 items-center gap-4 border-b border-rule text-sm font-medium text-ink-muted transition-colors duration-300 hover:text-ink"
                ><span class="num w-6 text-xs text-accent">01</span
                ><span>Personal Information</span></a
              >
            </li>
            <li>
              <a
                href="#reg-church"
                class="group flex min-h-11 items-center gap-4 border-b border-rule text-sm font-medium text-ink-muted transition-colors duration-300 hover:text-ink"
                ><span class="num w-6 text-xs text-accent">02</span
                ><span>Church Information</span></a
              >
            </li>
            <li>
              <a
                href="#reg-previous"
                class="group flex min-h-11 items-center gap-4 border-b border-rule text-sm font-medium text-ink-muted transition-colors duration-300 hover:text-ink"
                ><span class="num w-6 text-xs text-accent">03</span
                ><span>Previous Congregation</span></a
              >
            </li>
            <li>
              <a
                href="#reg-origin"
                class="group flex min-h-11 items-center gap-4 border-b border-rule text-sm font-medium text-ink-muted transition-colors duration-300 hover:text-ink"
                ><span class="num w-6 text-xs text-accent">04</span><span>Place of Origin</span></a
              >
            </li>
            <li>
              <a
                href="#reg-residence"
                class="group flex min-h-11 items-center gap-4 border-b border-rule text-sm font-medium text-ink-muted transition-colors duration-300 hover:text-ink"
                ><span class="num w-6 text-xs text-accent">05</span
                ><span>Residential Address</span></a
              >
            </li>
            <li>
              <a
                href="#reg-emergency"
                class="group flex min-h-11 items-center gap-4 border-b border-rule text-sm font-medium text-ink-muted transition-colors duration-300 hover:text-ink"
                ><span class="num w-6 text-xs text-accent">06</span
                ><span>Emergency Contact</span></a
              >
            </li>
          </ol>
        </div>
      </aside>

      <div class="lg:col-span-7 lg:col-start-6">
        <!-- ── Success state ──────────────────────────────────────────────────── -->
        <div v-if="submitted" class="border-t border-rule py-14 md:py-20" role="status">
          <span
            class="flex size-14 items-center justify-center rounded-full border border-success/40 text-success"
          >
            <Icon icon="mdi:check" class="size-7" aria-hidden="true" />
          </span>
          <h2 class="t-h2 mt-8 text-secondary">Registration received</h2>
          <p class="t-lede mt-5 max-w-lg">
            Thank you{{ registeredName ? `, ${registeredName}` : '' }}. Your details have been
            submitted to the church secretary. You will be contacted once your record is confirmed
            on the nominal roll.
          </p>
          <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" class="btn btn-outline min-h-14 px-7" @click="registerAnother">
              <Icon icon="mdi:account-plus-outline" class="size-5" aria-hidden="true" />
              Register another member
            </button>
            <NuxtLink to="/" class="btn btn-primary min-h-14 px-7">
              Back to Home
              <Icon icon="mdi:arrow-right" class="btn-arrow size-5" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>

        <!-- ── Form ───────────────────────────────────────────────────────────── -->
        <form v-else class="flex flex-col" novalidate @submit.prevent="submit">
          <section
            id="reg-personal"
            class="reg-section scroll-mt-28 border-t border-rule py-12 md:py-16"
            aria-labelledby="reg-personal-title"
          >
            <header class="mb-10 grid gap-3 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-4">
              <span class="t-label num pt-2 text-accent" aria-hidden="true">01</span>
              <div>
                <h2 id="reg-personal-title" class="t-h3 text-secondary">Personal Information</h2>
                <p class="mt-2 max-w-xl text-base leading-relaxed text-ink-muted">
                  How the church can identify and reach you.
                </p>
              </div>
            </header>

            <div class="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 md:pl-16">
              <div
                id="field-avatar"
                class="flex flex-col items-start gap-5 sm:col-span-2 sm:flex-row sm:items-center sm:gap-7"
              >
                <div
                  :class="
                    errors.avatar
                      ? 'rounded-full ring-2 ring-error ring-offset-4 ring-offset-surface'
                      : ''
                  "
                >
                  <ImageUpload
                    v-model="form.avatar"
                    shape="circle"
                    folder="members"
                    :max-bytes="2 * 1024 * 1024"
                  />
                </div>
                <div>
                  <p class="field-label">
                    Passport photograph <span class="field-req" aria-hidden="true">*</span>
                  </p>
                  <p class="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
                    JPG or PNG. Large photos are compressed automatically.
                  </p>
                  <p v-if="errors.avatar" id="err-avatar" class="field-error" role="alert">
                    <Icon
                      icon="mdi:alert-circle-outline"
                      class="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{{ errors.avatar }}</span>
                  </p>
                </div>
              </div>

              <div id="field-name">
                <label class="field-label" for="reg-name"
                  >Full Name <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-name"
                  v-model="form.name"
                  type="text"
                  autocomplete="name"
                  placeholder="Enter your full name"
                  class="field-input"
                  :class="errors.name ? 'border-error focus:border-error' : ''"
                  :aria-invalid="errors.name ? true : undefined"
                  :aria-describedby="errors.name ? 'err-name' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.name" id="err-name" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.name }}</span>
                </p>
              </div>
              <div id="field-email">
                <label class="field-label" for="reg-email"
                  >Email Address <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                  class="field-input"
                  :class="errors.email ? 'border-error focus:border-error' : ''"
                  :aria-invalid="errors.email ? true : undefined"
                  :aria-describedby="errors.email ? 'err-email' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.email" id="err-email" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.email }}</span>
                </p>
              </div>
              <div id="field-phone" class="sm:col-span-2">
                <label class="field-label" for="reg-phone"
                  >Phone Number <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-phone"
                  v-model="form.phone"
                  type="tel"
                  autocomplete="tel"
                  placeholder="+234 800 000 0000"
                  class="field-input"
                  :class="errors.phone ? 'border-error focus:border-error' : ''"
                  :aria-invalid="errors.phone ? true : undefined"
                  :aria-describedby="errors.phone ? 'err-phone' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.phone" id="err-phone" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.phone }}</span>
                </p>
              </div>
              <div id="field-gender">
                <label class="field-label" for="reg-gender"
                  >Gender <span class="field-req" aria-hidden="true">*</span></label
                >
                <div class="relative">
                  <select
                    id="reg-gender"
                    v-model="form.gender"
                    class="field-input cursor-pointer appearance-none pr-8"
                    :class="inputError('gender')"
                    :aria-invalid="errors.gender ? true : undefined"
                    :aria-describedby="errors.gender ? 'err-gender' : undefined"
                    aria-required="true"
                  >
                    <option v-for="g in genderOptions" :key="g" :value="g">{{ g }}</option>
                  </select>
                  <Icon
                    icon="mdi:chevron-down"
                    class="pointer-events-none absolute right-0 bottom-3.5 size-5 text-ink-subtle"
                    aria-hidden="true"
                  />
                </div>
                <p v-if="errors.gender" id="err-gender" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.gender }}</span>
                </p>
              </div>
              <div id="field-maritalStatus">
                <label class="field-label" for="reg-maritalStatus"
                  >Marital Status <span class="field-req" aria-hidden="true">*</span></label
                >
                <div class="relative">
                  <select
                    id="reg-maritalStatus"
                    v-model="form.maritalStatus"
                    class="field-input cursor-pointer appearance-none pr-8"
                    :class="inputError('maritalStatus')"
                    :aria-invalid="errors.maritalStatus ? true : undefined"
                    :aria-describedby="errors.maritalStatus ? 'err-maritalStatus' : undefined"
                    aria-required="true"
                  >
                    <option value="">— Select —</option>
                    <option v-for="m in maritalOptions" :key="m" :value="m">{{ m }}</option>
                  </select>
                  <Icon
                    icon="mdi:chevron-down"
                    class="pointer-events-none absolute right-0 bottom-3.5 size-5 text-ink-subtle"
                    aria-hidden="true"
                  />
                </div>
                <p
                  v-if="errors.maritalStatus"
                  id="err-maritalStatus"
                  class="field-error"
                  role="alert"
                >
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.maritalStatus }}</span>
                </p>
              </div>
              <div id="field-dob">
                <label class="field-label" for="reg-dob"
                  >Date of Birth <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-dob"
                  v-model="form.dob"
                  type="date"
                  :max="today"
                  class="field-input"
                  :class="errors.dob ? 'border-error focus:border-error' : ''"
                  :aria-invalid="errors.dob ? true : undefined"
                  :aria-describedby="errors.dob ? 'err-dob' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.dob" id="err-dob" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.dob }}</span>
                </p>
              </div>
              <div id="field-occupation">
                <label class="field-label" for="reg-occupation"
                  >Occupation <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-occupation"
                  v-model="form.occupation"
                  type="text"
                  placeholder="e.g. Teacher"
                  class="field-input"
                  :class="inputError('occupation')"
                  :aria-invalid="errors.occupation ? true : undefined"
                  :aria-describedby="errors.occupation ? 'err-occupation' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.occupation" id="err-occupation" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.occupation }}</span>
                </p>
              </div>
            </div>
          </section>

          <section
            id="reg-church"
            class="reg-section scroll-mt-28 border-t border-rule py-12 md:py-16"
            aria-labelledby="reg-church-title"
          >
            <header class="mb-10 grid gap-3 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-4">
              <span class="t-label num pt-2 text-accent" aria-hidden="true">02</span>
              <div>
                <h2 id="reg-church-title" class="t-h3 text-secondary">Church Information</h2>
                <p class="mt-2 max-w-xl text-base leading-relaxed text-ink-muted">
                  Leave the baptism date blank if you have not yet been baptised.
                </p>
              </div>
            </header>

            <div class="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 md:pl-16">
              <div id="field-dateOfBaptism">
                <label class="field-label" for="reg-dateOfBaptism">Date of Baptism</label>
                <input
                  id="reg-dateOfBaptism"
                  v-model="form.dateOfBaptism"
                  type="date"
                  :max="today"
                  class="field-input"
                  :class="inputError('dateOfBaptism')"
                  :aria-invalid="errors.dateOfBaptism ? true : undefined"
                  :aria-describedby="errors.dateOfBaptism ? 'err-dateOfBaptism' : undefined"
                />
                <p
                  v-if="errors.dateOfBaptism"
                  id="err-dateOfBaptism"
                  class="field-error"
                  role="alert"
                >
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.dateOfBaptism }}</span>
                </p>
              </div>
              <div id="field-dateJoined">
                <label class="field-label" for="reg-dateJoined"
                  >Date of Registration <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-dateJoined"
                  v-model="form.dateJoined"
                  type="date"
                  :max="today"
                  class="field-input"
                  :class="inputError('dateJoined')"
                  :aria-invalid="errors.dateJoined ? true : undefined"
                  :aria-describedby="errors.dateJoined ? 'err-dateJoined' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.dateJoined" id="err-dateJoined" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.dateJoined }}</span>
                </p>
              </div>
            </div>
          </section>

          <section
            id="reg-previous"
            class="reg-section scroll-mt-28 border-t border-rule py-12 md:py-16"
            aria-labelledby="reg-previous-title"
          >
            <header class="mb-10 grid gap-3 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-4">
              <span class="t-label num pt-2 text-accent" aria-hidden="true">03</span>
              <div>
                <h2 id="reg-previous-title" class="t-h3 text-secondary">
                  Previous Congregation
                  <span class="ml-2 align-middle font-sans text-sm text-ink-subtle"
                    >(optional)</span
                  >
                </h2>
                <p class="mt-2 max-w-xl text-base leading-relaxed text-ink-muted">
                  If you are transferring from another congregation, tell us where you worshipped
                  and how we can reach the minister there.
                </p>
              </div>
            </header>

            <div class="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 md:pl-16">
              <div id="field-previousCongregation">
                <label class="field-label" for="reg-previousCongregation"
                  >Previous Congregation</label
                >
                <input
                  id="reg-previousCongregation"
                  v-model="form.previousCongregation"
                  type="text"
                  placeholder="e.g. Church of Christ, Uyo"
                  class="field-input"
                />
              </div>
              <div id="field-previousMinisterPhone">
                <label class="field-label" for="reg-previousMinisterPhone"
                  >Minister / Preacher's Phone</label
                >
                <input
                  id="reg-previousMinisterPhone"
                  v-model="form.previousMinisterPhone"
                  type="tel"
                  placeholder="+234 803 333 4444"
                  class="field-input"
                  :class="errors.previousMinisterPhone ? 'border-error focus:border-error' : ''"
                  :aria-invalid="errors.previousMinisterPhone ? true : undefined"
                  :aria-describedby="
                    errors.previousMinisterPhone ? 'err-previousMinisterPhone' : undefined
                  "
                />
                <p
                  v-if="errors.previousMinisterPhone"
                  id="err-previousMinisterPhone"
                  class="field-error"
                  role="alert"
                >
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.previousMinisterPhone }}</span>
                </p>
              </div>
            </div>
          </section>

          <section
            id="reg-origin"
            class="reg-section scroll-mt-28 border-t border-rule py-12 md:py-16"
            aria-labelledby="reg-origin-title"
          >
            <header class="mb-10 grid gap-3 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-4">
              <span class="t-label num pt-2 text-accent" aria-hidden="true">04</span>
              <div>
                <h2 id="reg-origin-title" class="t-h3 text-secondary">Place of Origin</h2>
                <p class="mt-2 max-w-xl text-base leading-relaxed text-ink-muted">
                  Where you hail from.
                </p>
              </div>
            </header>

            <div class="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 md:pl-16">
              <div id="field-country">
                <label class="field-label" for="reg-country"
                  >Country <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-country"
                  v-model="form.country"
                  type="text"
                  placeholder="Nigeria"
                  class="field-input"
                  :class="inputError('country')"
                  :aria-invalid="errors.country ? true : undefined"
                  :aria-describedby="errors.country ? 'err-country' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.country" id="err-country" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.country }}</span>
                </p>
              </div>
              <div id="field-state">
                <label class="field-label" for="reg-state"
                  >State of Origin <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-state"
                  v-model="form.state"
                  type="text"
                  placeholder="Akwa Ibom State"
                  class="field-input"
                  :class="inputError('state')"
                  :aria-invalid="errors.state ? true : undefined"
                  :aria-describedby="errors.state ? 'err-state' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.state" id="err-state" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.state }}</span>
                </p>
              </div>
              <div id="field-localGovernment">
                <label class="field-label" for="reg-localGovernment"
                  >Local Government Area <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-localGovernment"
                  v-model="form.localGovernment"
                  type="text"
                  placeholder="Ibiono Ibom"
                  class="field-input"
                  :class="inputError('localGovernment')"
                  :aria-invalid="errors.localGovernment ? true : undefined"
                  :aria-describedby="errors.localGovernment ? 'err-localGovernment' : undefined"
                  aria-required="true"
                />
                <p
                  v-if="errors.localGovernment"
                  id="err-localGovernment"
                  class="field-error"
                  role="alert"
                >
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.localGovernment }}</span>
                </p>
              </div>
              <div id="field-village">
                <label class="field-label" for="reg-village"
                  >Village <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-village"
                  v-model="form.village"
                  type="text"
                  placeholder="Ikot Oku"
                  class="field-input"
                  :class="inputError('village')"
                  :aria-invalid="errors.village ? true : undefined"
                  :aria-describedby="errors.village ? 'err-village' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.village" id="err-village" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.village }}</span>
                </p>
              </div>
            </div>
          </section>

          <section
            id="reg-residence"
            class="reg-section scroll-mt-28 border-t border-rule py-12 md:py-16"
            aria-labelledby="reg-residence-title"
          >
            <header class="mb-10 grid gap-3 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-4">
              <span class="t-label num pt-2 text-accent" aria-hidden="true">05</span>
              <div>
                <h2 id="reg-residence-title" class="t-h3 text-secondary">Residential Address</h2>
                <p class="mt-2 max-w-xl text-base leading-relaxed text-ink-muted">
                  Where you currently live.
                </p>
              </div>
            </header>

            <div class="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 md:pl-16">
              <div id="field-address" class="sm:col-span-2">
                <label class="field-label" for="reg-address"
                  >Full Address <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-address"
                  v-model="form.address"
                  type="text"
                  autocomplete="street-address"
                  placeholder="No. 8 Convent Road, Ikot Ekpene"
                  class="field-input"
                  :class="errors.address ? 'border-error focus:border-error' : ''"
                  :aria-invalid="errors.address ? true : undefined"
                  :aria-describedby="errors.address ? 'err-address' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.address" id="err-address" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.address }}</span>
                </p>
              </div>
            </div>
          </section>

          <section
            id="reg-emergency"
            class="reg-section scroll-mt-28 border-t border-rule py-12 md:py-16"
            aria-labelledby="reg-emergency-title"
          >
            <header class="mb-10 grid gap-3 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-4">
              <span class="t-label num pt-2 text-accent" aria-hidden="true">06</span>
              <div>
                <h2 id="reg-emergency-title" class="t-h3 text-secondary">Emergency Contact</h2>
                <p class="mt-2 max-w-xl text-base leading-relaxed text-ink-muted">
                  Someone we can reach on your behalf.
                </p>
              </div>
            </header>

            <div class="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 md:pl-16">
              <div id="field-ecName">
                <label class="field-label" for="reg-ecName"
                  >Name <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-ecName"
                  v-model="form.ecName"
                  type="text"
                  placeholder="Brother John Adebayo"
                  class="field-input"
                  :class="inputError('ecName')"
                  :aria-invalid="errors.ecName ? true : undefined"
                  :aria-describedby="errors.ecName ? 'err-ecName' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.ecName" id="err-ecName" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.ecName }}</span>
                </p>
              </div>
              <div id="field-ecRelationship">
                <label class="field-label" for="reg-ecRelationship"
                  >Relationship <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-ecRelationship"
                  v-model="form.ecRelationship"
                  type="text"
                  placeholder="Brother"
                  class="field-input"
                  :class="inputError('ecRelationship')"
                  :aria-invalid="errors.ecRelationship ? true : undefined"
                  :aria-describedby="errors.ecRelationship ? 'err-ecRelationship' : undefined"
                  aria-required="true"
                />
                <p
                  v-if="errors.ecRelationship"
                  id="err-ecRelationship"
                  class="field-error"
                  role="alert"
                >
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.ecRelationship }}</span>
                </p>
              </div>
              <div id="field-ecPhone">
                <label class="field-label" for="reg-ecPhone"
                  >Phone Number <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-ecPhone"
                  v-model="form.ecPhone"
                  type="tel"
                  placeholder="+234 803 333 4444"
                  class="field-input"
                  :class="inputError('ecPhone')"
                  :aria-invalid="errors.ecPhone ? true : undefined"
                  :aria-describedby="errors.ecPhone ? 'err-ecPhone' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.ecPhone" id="err-ecPhone" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.ecPhone }}</span>
                </p>
              </div>
              <div id="field-ecAddress">
                <label class="field-label" for="reg-ecAddress"
                  >Address <span class="field-req" aria-hidden="true">*</span></label
                >
                <input
                  id="reg-ecAddress"
                  v-model="form.ecAddress"
                  type="text"
                  placeholder="Full address"
                  class="field-input"
                  :class="inputError('ecAddress')"
                  :aria-invalid="errors.ecAddress ? true : undefined"
                  :aria-describedby="errors.ecAddress ? 'err-ecAddress' : undefined"
                  aria-required="true"
                />
                <p v-if="errors.ecAddress" id="err-ecAddress" class="field-error" role="alert">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ errors.ecAddress }}</span>
                </p>
              </div>
            </div>
          </section>

          <!-- Submit -->
          <div
            class="flex flex-col-reverse items-stretch gap-6 border-t border-rule-strong pt-10 sm:flex-row sm:items-center sm:justify-between"
          >
            <p class="flex max-w-sm items-start gap-2 text-sm leading-relaxed text-ink-muted">
              <Icon icon="mdi:lock-outline" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Your details are used only for church records and are never shared publicly.
            </p>
            <button
              type="submit"
              :disabled="submitting"
              :aria-busy="submitting || undefined"
              class="btn btn-primary min-h-14 w-full px-8 text-base sm:w-auto"
            >
              <Icon
                v-if="submitting"
                icon="mdi:loading"
                class="size-5 shrink-0 animate-spin"
                aria-hidden="true"
              />
              <Icon v-else icon="mdi:account-check-outline" class="size-5" aria-hidden="true" />
              Submit Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Long form for phones and older readers: 17px underlined fields (no iOS zoom), 48px targets. */
.field-req {
  margin-left: 0.15em;
  color: var(--c-error);
}
.field-label + .field-input,
.field-label + .relative {
  margin-top: 0.125rem;
}
.field-input[type='date'] {
  font-variant-numeric: tabular-nums;
}
.field-input.border-error {
  border-bottom-color: var(--c-error);
}
.field-input.border-error:focus {
  border-bottom-color: var(--c-error);
  box-shadow: 0 1px 0 0 var(--c-error);
}
.field-error {
  display: flex;
  align-items: flex-start;
  gap: 0.375rem;
  margin-top: 0.625rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: var(--c-error);
}
</style>
