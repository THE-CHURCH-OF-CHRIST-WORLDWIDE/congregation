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
  <div class="lectureship-form min-h-screen bg-surface-muted pb-20">
    <!-- ── Hero ───────────────────────────────────────────────────────────────── -->
    <section class="bookcloth relative pt-6 pb-14 sm:pt-8 sm:pb-20">
      <div class="relative mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
        <div class="mb-8 flex items-center gap-1.5 text-sm text-white/65">
          <NuxtLink to="/" class="rounded-sm py-1 transition-colors duration-150 hover:text-white"
            >Home</NuxtLink
          >
          <Icon icon="mdi:chevron-right" class="size-4" aria-hidden="true" />
          <span class="text-white/85">Lectureship</span>
        </div>

        <div class="flex flex-col items-center text-center">
          <div
            class="hero-animate flex size-14 items-center justify-center rounded-full border border-white/20"
            style="animation-delay: 0ms"
          >
            <Icon
              icon="mdi:book-open-page-variant-outline"
              class="size-6 text-[#e8c372]"
              aria-hidden="true"
            />
          </div>
          <p
            class="hero-animate mt-3 text-xs font-semibold tracking-[0.2em] text-white/70 uppercase"
            style="animation-delay: 60ms"
          >
            Church of Christ &middot; University of Ibadan
          </p>

          <p
            class="hero-animate mt-6 max-w-lg font-display text-lg leading-relaxed text-white/90 italic sm:text-xl"
            style="animation-delay: 120ms"
          >
            &ldquo;Be not conformed to this world&hellip; but be transformed by the renewing of your
            mind.&rdquo;
          </p>
          <p
            class="hero-animate mt-2 text-sm font-semibold tracking-wide text-[#e8c372]"
            style="animation-delay: 180ms"
          >
            &mdash; Romans 12:2
          </p>

          <div class="hero-animate mt-8 h-px w-16 bg-white/25" style="animation-delay: 220ms"></div>

          <p
            class="hero-animate mt-8 text-xs font-semibold tracking-[0.2em] text-white/65 uppercase"
            style="animation-delay: 260ms"
          >
            Theme
          </p>
          <h1
            class="hero-animate mt-3 font-display text-[2rem] leading-[1.12] font-bold text-white sm:text-4xl md:text-5xl"
            style="animation-delay: 320ms"
          >
            Navigating Faith<br class="hidden sm:block" />
            in a Changing World
          </h1>
          <p
            class="hero-animate mt-4 text-sm font-semibold tracking-[0.14em] text-[#e8c372] uppercase sm:text-base"
            style="animation-delay: 380ms"
          >
            1st Annual Bible Lectureship 2026
          </p>

          <div
            class="hero-animate mt-8 flex w-full max-w-md flex-col items-stretch divide-y divide-white/15 border-y border-white/15 text-left text-base text-white/90 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:divide-y-0 sm:border-y-0 sm:text-center sm:text-sm"
            style="animation-delay: 440ms"
          >
            <span class="flex items-center gap-2 py-2.5 sm:px-3 sm:py-1">
              <Icon
                icon="mdi:calendar-outline"
                class="size-4 shrink-0 text-[#e8c372]"
                aria-hidden="true"
              />
              Sat. 3rd &amp; Sun. 4th October, 2026
            </span>
            <span class="hidden h-1 w-1 self-center rounded-full bg-white/35 sm:block"></span>
            <span class="flex items-center gap-2 py-2.5 sm:px-3 sm:py-1">
              <Icon
                icon="mdi:clock-outline"
                class="size-4 shrink-0 text-[#e8c372]"
                aria-hidden="true"
              />
              Sat. 9:00am prompt &middot; Sun. 9:00am&ndash;12pm (with worship service)
            </span>
            <span class="hidden h-1 w-1 self-center rounded-full bg-white/35 sm:block"></span>
            <span class="flex items-center gap-2 py-2.5 sm:px-3 sm:py-1">
              <Icon
                icon="mdi:map-marker-outline"
                class="size-4 shrink-0 text-[#e8c372]"
                aria-hidden="true"
              />
              15 Alafia Estate, Ajibode, Ibadan
            </span>
          </div>

          <!-- Registered-so-far nudge -->
          <div
            v-if="lectureshipStore.registeredCount > 0"
            class="hero-animate mt-6 inline-flex items-center gap-2 rounded-md border border-white/20 bg-black/10 px-3 py-1.5 text-sm font-medium text-white/90"
            style="animation-delay: 480ms"
          >
            <Icon
              icon="mdi:account-group-outline"
              class="size-4 text-[#e8c372]"
              aria-hidden="true"
            />
            <span class="num">{{ lectureshipStore.registeredCount }}</span>
            {{ lectureshipStore.registeredCount === 1 ? 'person has' : 'people have' }} already
            registered
          </div>

          <!-- Countdown -->
          <div
            v-if="!countdown.isPast.value"
            class="hero-animate mt-8 grid grid-cols-4 gap-2 sm:gap-3"
            style="animation-delay: 520ms"
          >
            <div
              v-for="unit in countdownUnits"
              :key="unit.label"
              class="flex min-w-16 flex-col items-center rounded-md border border-white/20 bg-black/15 px-3 py-2.5 sm:min-w-20 sm:px-5 sm:py-3"
            >
              <span class="num font-display text-2xl leading-none font-bold text-white sm:text-3xl">
                {{ String(unit.value).padStart(2, '0') }}
              </span>
              <span class="mt-1.5 text-[11px] tracking-wide text-white/70 uppercase sm:text-xs">
                {{ unit.label }}
              </span>
            </div>
          </div>
          <p
            v-else
            class="hero-animate mt-8 text-sm font-semibold tracking-[0.2em] text-[#e8c372] uppercase"
            style="animation-delay: 520ms"
          >
            Happening now
          </p>
        </div>
      </div>
    </section>

    <!-- ── Speakers, Officiating Ministers, Song Leaders & Moderators ──────── -->
    <template v-for="role in LECTURESHIP_ROLE_ORDER" :key="role">
      <section
        v-if="speakersByRole(role).length"
        class="mx-auto max-w-5xl px-4 pt-14 sm:px-6 md:pt-16 lg:px-8"
      >
        <div class="mb-6 flex items-end justify-between gap-4 border-b border-rule pb-4">
          <div class="margin-rule">
            <h2 class="font-display text-2xl leading-tight font-bold text-secondary sm:text-3xl">
              Meet the {{ LECTURESHIP_ROLES[role].plural }}
            </h2>
            <p class="citation mt-2">
              {{ LECTURESHIP_ROLES[role].publicEyebrow }}
            </p>
          </div>
          <p class="num hidden text-sm text-ink-muted sm:block">
            {{ speakersByRole(role).length }}
            {{
              speakersByRole(role).length === 1
                ? LECTURESHIP_ROLES[role].label.toLowerCase()
                : LECTURESHIP_ROLES[role].plural.toLowerCase()
            }}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <LectureshipSpeakerCard v-for="s in speakersByRole(role)" :key="s.id" :speaker="s" />
        </div>
      </section>
    </template>

    <div class="mx-auto max-w-2xl px-4 pt-14 sm:px-6 md:pt-16">
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
            Thank you for registering for the 1st Annual Bible Lectureship 2026. We look forward to
            seeing you there.
          </p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
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
      <form v-else class="flex flex-col gap-5" novalidate @submit.prevent="submit">
        <Card padding="lg">
          <section>
            <header class="mb-6 border-b border-rule pb-4">
              <h2
                class="flex items-center gap-2 font-display text-xl font-semibold text-ink sm:text-2xl"
              >
                <Icon
                  icon="mdi:book-open-page-variant-outline"
                  class="size-5 shrink-0 text-primary-ink sm:size-6"
                  aria-hidden="true"
                />
                Lectureship Registration
              </h2>
              <p class="mt-1 text-sm leading-relaxed text-ink-muted">
                Fields marked <span class="font-bold text-error">*</span> are required.
              </p>
            </header>

            <div class="flex flex-col gap-5">
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
          class="flex flex-col-reverse items-stretch gap-3 border-t border-rule pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <p class="flex items-start gap-1.5 text-sm text-ink-muted">
            <Icon icon="mdi:lock-outline" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Your details are used only to plan for the lectureship only.
          </p>
          <Button
            type="submit"
            size="lg"
            :loading="lectureshipStore.submitting"
            class="min-h-13 w-full text-base sm:min-h-12 sm:w-auto"
          >
            <template #icon-left><Icon icon="mdi:book-check-outline" /></template>
            Submit Registration
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Phones first: 16px fields (no iOS zoom), 44px targets, clearer labels. */
.lectureship-form :deep(.edit-field-slot input) {
  min-height: 2.75rem;
  font-size: 1rem;
  line-height: 1.5rem;
}
.lectureship-form :deep(label > span:first-child) {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--c-ink);
}
@media (min-width: 640px) {
  .lectureship-form :deep(.edit-field-slot input) {
    min-height: 2.625rem;
    font-size: 0.9375rem;
  }
}
</style>
