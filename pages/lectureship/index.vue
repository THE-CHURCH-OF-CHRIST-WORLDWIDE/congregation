<script setup lang="ts">
definePageMeta({
  layout: 'default',
  pageTransition: { name: 'fade', mode: 'out-in' },
})

useSeoMeta({
  title: '1st Annual Bible Lectureship 2026 — Church of Christ',
  description:
    'Register for the 1st Annual Bible Lectureship 2026, themed "Navigating Faith in a Changing World" — Saturday 3rd & Sunday 4th October, 2026 at Church of Christ, University of Ibadan.',
  ogTitle: '1st Annual Bible Lectureship 2026',
  ogDescription: 'Navigating Faith in a Changing World — Sat 3rd & Sun 4th October, 2026.',
})

const lectureshipStore = useLectureshipStore()
const toast = useToast()

const form = reactive({
  fullName: '',
  email: '',
  congregation: '',
  phone: '',
})

type FieldErrors = Partial<Record<keyof typeof form, string>>
const errors = ref<FieldErrors>({})
const submitted = ref(false)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Accepts local (08012345678) and international (+234 801 234 5678) formats.
const PHONE_RE = /^\+?[\d\s-]{7,20}$/

function validate(): boolean {
  const next: FieldErrors = {}

  if (!form.fullName.trim()) next.fullName = 'Your full name is required'

  const email = form.email.trim()
  if (!email) next.email = 'Email address is required'
  else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address'

  if (!form.congregation.trim()) next.congregation = 'Name of your congregation/church is required'

  if (!form.phone.trim()) next.phone = 'Phone / WhatsApp number is required'
  else if (!PHONE_RE.test(form.phone.trim())) next.phone = 'Enter a valid phone number'

  errors.value = next
  return Object.keys(next).length === 0
}

const firstErrorField = computed(() => Object.keys(errors.value)[0])

async function submit() {
  if (!validate()) {
    toast.error('Please correct the highlighted fields')
    const el = document.getElementById(`field-${firstErrorField.value}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  try {
    await lectureshipStore.submit({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      congregation: form.congregation.trim(),
      phone: form.phone.trim(),
    })
    submitted.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch {
    // The store already recorded the reason; surface it inline next to the form.
    toast.error(lectureshipStore.error ?? 'Failed to submit your registration')
  }
}

function registerAnother() {
  Object.assign(form, { fullName: '', email: '', congregation: '', phone: '' })
  errors.value = {}
  submitted.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <!-- Page header -->
    <div class="border-b border-gray-100 bg-white py-8">
      <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div class="mb-1 flex items-center gap-2 text-xs font-medium text-gray-400">
          <NuxtLink to="/" class="transition-colors hover:text-blue-600">Home</NuxtLink>
          <Icon icon="mdi:chevron-right" class="h-3.5 w-3.5" />
          <span class="text-gray-600">Lectureship</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
          1st Annual Bible Lectureship 2026
        </h1>
        <p class="mt-2 text-sm font-medium text-accent">Navigating Faith in a Changing World</p>
        <div
          class="mt-3 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-4"
        >
          <span class="flex items-center gap-1.5">
            <Icon icon="mdi:calendar-outline" class="h-4 w-4" />
            Sat. 3rd &amp; Sun. 4th October, 2026
          </span>
          <span class="flex items-center gap-1.5">
            <Icon icon="mdi:map-marker-outline" class="h-4 w-4" />
            15 Alafia Estate, Ajibode, Ibadan
          </span>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-2xl px-4 pt-6 sm:px-6 lg:px-8">
      <!-- ── Success state ──────────────────────────────────────────────────── -->
      <Card v-if="submitted" padding="lg">
        <div class="flex flex-col items-center py-8 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <Icon icon="mdi:check-circle-outline" class="text-3xl text-green-600" />
          </div>
          <h2 class="mt-4 text-xl font-bold text-gray-900">Registration received</h2>
          <p class="mt-1 max-w-md text-sm text-gray-500">
            Thank you for registering for the 1st Annual Bible Lectureship 2026. We look forward to
            seeing you there.
          </p>
          <div class="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="secondary" @click="registerAnother">
              <template #icon-left><Icon icon="mdi:account-plus-outline" /></template>
              Register another person
            </Button>
            <NuxtLink to="/">
              <Button>Back to Home</Button>
            </NuxtLink>
          </div>
        </div>
      </Card>

      <!-- ── Form ───────────────────────────────────────────────────────────── -->
      <form v-else class="flex flex-col gap-4" novalidate @submit.prevent="submit">
        <Card padding="lg">
          <section>
            <div class="mb-5 flex items-start gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Icon icon="mdi:book-open-page-variant-outline" class="text-lg text-accent" />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-gray-900">Lectureship Registration</h2>
                <p class="text-xs text-gray-500">
                  Fields marked <span class="text-red-500">*</span> are required.
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <EditField id="field-fullName" label="Full Name *" :error="errors.fullName">
                <input
                  v-model="form.fullName"
                  type="text"
                  autocomplete="name"
                  placeholder="Enter your full name"
                />
              </EditField>

              <EditField id="field-email" label="Email Address *" :error="errors.email">
                <input
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                />
              </EditField>

              <EditField
                id="field-congregation"
                label="Name of Congregation/Church *"
                :error="errors.congregation"
              >
                <input
                  v-model="form.congregation"
                  type="text"
                  placeholder="e.g. Church of Christ, University of Ibadan"
                />
              </EditField>

              <EditField
                id="field-phone"
                label="Phone Number / WhatsApp Number *"
                :error="errors.phone"
              >
                <input
                  v-model="form.phone"
                  type="tel"
                  autocomplete="tel"
                  placeholder="+234 800 000 0000"
                />
              </EditField>
            </div>
          </section>
        </Card>

        <!-- Submit -->
        <div
          class="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between sm:gap-4"
        >
          <p class="text-xs text-gray-400">
            Your details are used only to plan for the lectureship and are never shared publicly.
          </p>
          <Button
            type="submit"
            size="lg"
            :loading="lectureshipStore.submitting"
            class="w-full sm:w-auto"
          >
            <template #icon-left><Icon icon="mdi:book-check-outline" /></template>
            Submit Registration
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
