<script setup lang="ts">
import type { LectureshipSpeakerRole } from '~/types'
import { LECTURESHIP_ROLE_ORDER, LECTURESHIP_ROLES } from '~/constants'

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

onMounted(() => {
  lectureshipStore.loadSpeakers()
  lectureshipStore.loadRegisteredCount()
})

function speakersByRole(role: LectureshipSpeakerRole) {
  return lectureshipStore.speakers.filter((s) => s.role === role).sort((a, b) => a.order - b.order)
}

// Saturday 9:00am WAT, the "prompt" start time called out in the hero below.
const EVENT_START = '2026-10-03T09:00:00+01:00'
const countdown = useCountdown(EVENT_START)
const countdownUnits = computed(() => [
  { label: 'Days', value: countdown.days.value },
  { label: 'Hours', value: countdown.hours.value },
  { label: 'Minutes', value: countdown.minutes.value },
  { label: 'Seconds', value: countdown.seconds.value },
])

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
  <div class="lectureship-form min-h-screen bg-surface">
    <!-- ── Hero: a forest title page for the programme ───────────────────────── -->
    <section class="field-forest relative isolate overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-24">
      <div class="site-container">
        <!-- Breadcrumb and host, set as a running head -->
        <div
          class="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-on-night/20 pb-5"
        >
          <nav aria-label="Breadcrumb" class="t-label flex items-center gap-2 text-on-night-muted">
            <NuxtLink
              to="/"
              class="rounded-sm py-1 transition-colors duration-300 hover:text-on-night"
              >Home</NuxtLink
            >
            <Icon icon="mdi:chevron-right" class="size-3.5" aria-hidden="true" />
            <span class="text-on-night">Lectureship</span>
          </nav>
          <p class="hero-animate t-label text-on-night-muted" style="animation-delay: 60ms">
            Church of Christ &middot; University of Ibadan
          </p>
        </div>

        <!-- Theme -->
        <div class="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <p
            class="hero-animate t-label hidden pt-5 text-champagne lg:col-span-2 lg:block"
            style="animation-delay: 200ms"
            aria-hidden="true"
          >
            Theme
          </p>
          <div class="lg:col-span-10">
            <h1 class="t-display text-on-night">
              <span class="sr-only">Theme: </span>
              <SplitReveal
                text="Navigating Faith"
                immediate
                :delay="200"
                :stagger="70"
                class="block"
              />
              <SplitReveal
                text="in a Changing World"
                immediate
                :delay="340"
                :stagger="70"
                class="t-turn block text-champagne"
              />
            </h1>
            <p
              class="hero-animate mt-6 font-display text-[clamp(1.375rem,2.2vw,1.875rem)] leading-tight text-on-night-muted"
              style="animation-delay: 600ms"
            >
              1st Annual Bible Lectureship 2026
            </p>
          </div>
        </div>

        <!-- Scripture and particulars -->
        <div
          class="mt-14 grid gap-10 border-t border-on-night/20 pt-8 lg:mt-20 lg:grid-cols-12 lg:gap-8"
        >
          <figure class="hero-animate lg:col-span-5" style="animation-delay: 700ms">
            <blockquote
              class="font-display text-[1.5rem] leading-snug text-on-night italic sm:text-[1.75rem]"
            >
              &ldquo;Be not conformed to this world&hellip; but be transformed by the renewing of
              your mind.&rdquo;
            </blockquote>
            <figcaption class="stamp mt-4 text-champagne">&mdash; Romans 12:2</figcaption>
          </figure>

          <ul
            class="hero-animate border-t border-on-night/20 text-on-night lg:col-span-6 lg:col-start-7 lg:border-t-0"
            style="animation-delay: 820ms"
          >
            <li class="flex items-start gap-4 border-b border-on-night/15 py-4 lg:pt-0">
              <Icon
                icon="mdi:calendar-outline"
                class="mt-0.5 size-5 shrink-0 text-champagne"
                aria-hidden="true"
              />
              <span class="num text-base sm:text-[1.0625rem]"
                >Sat. 3rd &amp; Sun. 4th October, 2026</span
              >
            </li>
            <li class="flex items-start gap-4 border-b border-on-night/15 py-4">
              <Icon
                icon="mdi:clock-outline"
                class="mt-0.5 size-5 shrink-0 text-champagne"
                aria-hidden="true"
              />
              <span class="num text-base sm:text-[1.0625rem]"
                >Sat. 9:00am prompt &middot; Sun. 9:00am&ndash;12pm (with worship service)</span
              >
            </li>
            <li class="flex items-start gap-4 border-b border-on-night/15 py-4">
              <Icon
                icon="mdi:map-marker-outline"
                class="mt-0.5 size-5 shrink-0 text-champagne"
                aria-hidden="true"
              />
              <span class="text-base sm:text-[1.0625rem]">15 Alafia Estate, Ajibode, Ibadan</span>
            </li>
          </ul>
        </div>

        <!-- Countdown: the figures set large in serif -->
        <div class="mt-16 lg:mt-24">
          <div
            v-if="!countdown.isPast.value"
            class="hero-animate grid grid-cols-4 border-t border-on-night/40"
            style="animation-delay: 950ms"
          >
            <div
              v-for="(unit, i) in countdownUnits"
              :key="unit.label"
              :class="[
                'flex flex-col pt-5 sm:pt-7',
                i > 0 ? 'border-l border-on-night/15 pl-3 sm:pl-6 lg:pl-8' : '',
              ]"
            >
              <span
                class="num font-display text-[clamp(2.75rem,9.5vw,8.5rem)] leading-[0.85] text-on-night"
              >
                {{ String(unit.value).padStart(2, '0') }}
              </span>
              <span class="t-label mt-3 text-on-night-muted sm:mt-4">
                {{ unit.label }}
              </span>
            </div>
          </div>
          <p
            v-else
            class="hero-animate t-turn border-t border-on-night/40 pt-6 text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-champagne"
            style="animation-delay: 950ms"
          >
            Happening now
          </p>

          <!-- Registered-so-far nudge -->
          <p
            v-if="lectureshipStore.registeredCount > 0"
            class="hero-animate mt-8 flex items-center gap-2.5 text-[0.9375rem] text-on-night-muted"
            style="animation-delay: 1050ms"
          >
            <Icon
              icon="mdi:account-group-outline"
              class="size-5 text-champagne"
              aria-hidden="true"
            />
            <span
              ><span class="num font-semibold text-on-night">{{
                lectureshipStore.registeredCount
              }}</span>
              {{ lectureshipStore.registeredCount === 1 ? 'person has' : 'people have' }} already
              registered</span
            >
          </p>
        </div>
      </div>
    </section>

    <!-- ── Speakers, Officiating Ministers, Song Leaders & Moderators ──────── -->
    <template v-for="role in LECTURESHIP_ROLE_ORDER" :key="role">
      <section v-if="speakersByRole(role).length" class="site-container pt-20 md:pt-28">
        <div
          class="mb-10 grid gap-4 border-b border-ink/80 pb-6 md:mb-14 md:grid-cols-12 md:items-end"
        >
          <div class="md:col-span-9">
            <h2 class="t-h2 text-secondary">
              <SplitReveal :text="`Meet the ${LECTURESHIP_ROLES[role].plural}`" />
            </h2>
            <p class="t-label mt-4 text-ink-subtle">
              {{ LECTURESHIP_ROLES[role].publicEyebrow }}
            </p>
          </div>
          <p class="num hidden text-sm text-ink-muted sm:block md:col-span-3 md:text-right">
            {{ speakersByRole(role).length }}
            {{
              speakersByRole(role).length === 1
                ? LECTURESHIP_ROLES[role].label.toLowerCase()
                : LECTURESHIP_ROLES[role].plural.toLowerCase()
            }}
          </p>
        </div>
        <div
          class="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8"
        >
          <LectureshipSpeakerCard v-for="s in speakersByRole(role)" :key="s.id" :speaker="s" />
        </div>
      </section>
    </template>

    <!-- ── Registration ───────────────────────────────────────────────────── -->
    <!-- Breathing room after the speaker index, only when it is shown -->
    <div v-if="lectureshipStore.speakers.length" class="h-20 md:h-28" aria-hidden="true"></div>

    <section class="section field-stone">
      <div class="site-container">
        <!-- ── Success state ──────────────────────────────────────────────── -->
        <div
          v-if="submitted"
          class="mx-auto flex max-w-2xl flex-col items-center border-y border-rule-strong py-16 text-center"
        >
          <div
            class="flex size-14 items-center justify-center rounded-full border border-success/40 text-success"
          >
            <Icon icon="mdi:check" class="text-2xl" aria-hidden="true" />
          </div>
          <h2 class="t-h2 mt-6 text-secondary">Registration received</h2>
          <p class="t-lede mt-4 max-w-md">
            Thank you for registering for the 1st Annual Bible Lectureship 2026. We look forward to
            seeing you there.
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" @click="registerAnother">
              <template #icon-left><Icon icon="mdi:account-plus-outline" /></template>
              Register another person
            </Button>
            <NuxtLink to="/">
              <Button>Back to Home</Button>
            </NuxtLink>
          </div>
        </div>

        <!-- ── Form ───────────────────────────────────────────────────────── -->
        <div v-else class="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <header class="lg:col-span-5">
            <h2 class="t-h1 max-w-[12ch] text-secondary">
              <SplitReveal text="Lectureship Registration" />
            </h2>
            <p v-reveal.150 class="mt-6 text-sm leading-relaxed text-ink-muted">
              Fields marked <span class="font-bold text-error">*</span> are required.
            </p>
          </header>

          <form
            v-reveal.150
            class="flex flex-col gap-10 lg:col-span-6 lg:col-start-7"
            novalidate
            @submit.prevent="submit"
          >
            <section class="flex flex-col gap-8">
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
            </section>

            <!-- Submit -->
            <div
              class="flex flex-col-reverse items-stretch gap-5 border-t border-rule-strong pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <p class="flex items-start gap-1.5 text-sm text-ink-muted">
                <Icon icon="mdi:lock-outline" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Your details are used only to plan for the lectureship only.
              </p>
              <Button
                type="submit"
                size="lg"
                :loading="lectureshipStore.submitting"
                class="min-h-14 w-full shrink-0 px-7 text-base sm:w-auto"
              >
                <template #icon-left><Icon icon="mdi:book-check-outline" /></template>
                Submit Registration
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Public registration fields take the editorial underline (EditField stays the shared control). */
.lectureship-form :deep(.edit-field-slot input) {
  min-height: 3rem;
  border: 0;
  border-bottom: 1px solid var(--c-rule-strong);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  padding: 0.75rem 0;
  font-size: 1.0625rem;
  line-height: 1.5rem;
}
.lectureship-form :deep(.edit-field-slot input:hover) {
  border-bottom-color: var(--c-ink-subtle);
}
.lectureship-form :deep(.edit-field-slot input:focus) {
  border-bottom-color: var(--c-primary);
  box-shadow: 0 1px 0 0 var(--c-primary);
}
.lectureship-form :deep(.edit-field-invalid .edit-field-slot input),
.lectureship-form :deep(.edit-field-invalid .edit-field-slot input:focus) {
  border-bottom-color: var(--c-error);
  box-shadow: 0 1px 0 0 var(--c-error);
}
.lectureship-form :deep(label > span:first-child) {
  font-size: 0.6875rem;
  line-height: 1rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--c-ink-muted);
}
</style>
