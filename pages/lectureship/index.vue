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
  <div class="min-h-screen bg-stone-50 pb-16">
    <!-- ── Hero ───────────────────────────────────────────────────────────────── -->
    <section class="relative overflow-hidden bg-[#1E3A5F] pb-14 pt-8 sm:pb-20 sm:pt-10">
      <!-- Warm glow behind the headline, echoing the flier's gradient theme text -->
      <div
        class="pointer-events-none absolute left-1/2 top-32 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/20 blur-3xl"
      ></div>

      <div class="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div class="mb-8 flex items-center gap-2 text-xs font-medium text-white/40">
          <NuxtLink to="/" class="transition-colors hover:text-white/70">Home</NuxtLink>
          <Icon icon="mdi:chevron-right" class="h-3.5 w-3.5" />
          <span class="text-white/60">Lectureship</span>
        </div>

        <div class="flex flex-col items-center text-center">
          <div
            class="hero-animate flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-sm"
            style="animation-delay: 0ms"
          >
            <Icon icon="mdi:book-open-page-variant-outline" class="h-6 w-6 text-amber-300" />
          </div>
          <p
            class="hero-animate mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/50"
            style="animation-delay: 60ms"
          >
            Church of Christ &middot; University of Ibadan
          </p>

          <p
            class="hero-animate mt-6 max-w-lg font-serif text-lg italic leading-relaxed text-white/85 sm:text-xl"
            style="animation-delay: 120ms"
          >
            &ldquo;Be not conformed to this world&hellip; but be transformed by the renewing of your
            mind.&rdquo;
          </p>
          <p
            class="hero-animate mt-2 text-sm font-semibold tracking-wide text-amber-300"
            style="animation-delay: 180ms"
          >
            &mdash; Romans 12:2
          </p>

          <div class="hero-animate mt-8 h-px w-16 bg-white/15" style="animation-delay: 220ms"></div>

          <p
            class="hero-animate mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-white/40"
            style="animation-delay: 260ms"
          >
            Theme
          </p>
          <h1
            class="hero-animate mt-3 bg-gradient-to-r from-orange-400 via-red-400 to-amber-300 bg-clip-text font-serif text-3xl font-bold leading-tight text-transparent sm:text-4xl md:text-5xl"
            style="animation-delay: 320ms"
          >
            Navigating Faith<br class="hidden sm:block" />
            in a Changing World
          </h1>
          <p
            class="hero-animate mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-base"
            style="animation-delay: 380ms"
          >
            1st Annual Bible Lectureship 2026
          </p>

          <div
            class="hero-animate mt-8 flex flex-col items-center gap-3 text-sm text-white/70 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6"
            style="animation-delay: 440ms"
          >
            <span class="flex items-center gap-2">
              <Icon icon="mdi:calendar-outline" class="h-4 w-4 text-amber-300" />
              Sat. 3rd &amp; Sun. 4th October, 2026
            </span>
            <span class="hidden h-1 w-1 rounded-full bg-white/30 sm:block"></span>
            <span class="flex items-center gap-2">
              <Icon icon="mdi:clock-outline" class="h-4 w-4 text-amber-300" />
              Sat. 9:00am prompt &middot; Sun. 9:00am&ndash;12pm (with worship service)
            </span>
            <span class="hidden h-1 w-1 rounded-full bg-white/30 sm:block"></span>
            <span class="flex items-center gap-2">
              <Icon icon="mdi:map-marker-outline" class="h-4 w-4 text-amber-300" />
              15 Alafia Estate, Ajibode, Ibadan
            </span>
          </div>
        </div>
      </div>

      <!-- Torn-paper edge, echoing the flier's ripped-paper divider -->
      <div
        class="absolute inset-x-0 bottom-0 h-6 bg-stone-50 sm:h-8"
        style="
          clip-path: polygon(
            0% 100%,
            6% 30%,
            12% 70%,
            18% 15%,
            24% 55%,
            30% 10%,
            36% 65%,
            42% 25%,
            48% 80%,
            54% 20%,
            60% 60%,
            66% 15%,
            72% 75%,
            78% 30%,
            84% 90%,
            90% 20%,
            96% 65%,
            100% 100%
          );
        "
      ></div>
    </section>

    <div class="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
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
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100"
              >
                <Icon icon="mdi:book-open-page-variant-outline" class="text-lg text-amber-600" />
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
            Your details are used only to plan for the lectureship only.
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
