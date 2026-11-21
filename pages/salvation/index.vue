<script setup lang="ts">
definePageMeta({
  layout: 'default',
  pageTransition: { name: 'fade', mode: 'out-in' },
})

useSeoMeta({
  title: "God's Plan for Salvation — Church of Christ",
  description:
    'The steps the New Testament sets out for salvation: hearing the gospel, believing it, repenting of sin, confessing Christ, and being baptised. Taught at the Church of Christ, Ikot Ekpene.',
  ogTitle: "God's Plan for Salvation",
})

/**
 * SCAFFOLD — the structure and anchors are final, the wording is not.
 *
 * The footer has always linked to /salvation#hear … #baptized; this page gives those
 * links a destination. Every `body` string below is placeholder text and should be
 * replaced with the congregation's own teaching before this page is announced. The
 * scripture references are the ones conventionally cited for each step; confirm them
 * against what the congregation actually teaches rather than trusting them as-is.
 *
 * Anchors must keep their current ids — TheFooter links to them by name.
 */
interface Step {
  id: string
  order: string
  title: string
  scripture: string
  body: string
}

const PLACEHOLDER = 'Replace this paragraph with the congregation’s own teaching on this step.'

const steps: Step[] = [
  {
    id: 'hear',
    order: 'One',
    title: 'Hear the Gospel',
    scripture: 'Romans 10:17',
    body: PLACEHOLDER,
  },
  {
    id: 'believe',
    order: 'Two',
    title: 'Believe the Gospel',
    scripture: 'Mark 16:16',
    body: PLACEHOLDER,
  },
  {
    id: 'repent',
    order: 'Three',
    title: 'Repent of your sins',
    scripture: 'Acts 2:38',
    body: PLACEHOLDER,
  },
  {
    id: 'confess',
    order: 'Four',
    title: 'Confess Christ',
    scripture: 'Romans 10:9-10',
    body: PLACEHOLDER,
  },
  {
    id: 'baptized',
    order: 'Five',
    title: 'Get Baptized',
    scripture: 'Acts 22:16',
    body: PLACEHOLDER,
  },
]

const settingsStore = useChurchSettingsStore()

onMounted(() => settingsStore.load())
</script>

<template>
  <div>
    <!-- Page title: calm, ruled, no photograph needed -->
    <div class="border-b border-rule bg-canvas">
      <div class="mx-auto max-w-3xl px-5 py-12 sm:px-6 md:py-16">
        <div class="margin-rule hero-animate">
          <h1 class="font-display text-4xl leading-[1.1] font-bold text-secondary md:text-5xl">
            God's Plan for Salvation
          </h1>
          <p class="citation num mt-3">Acts 2:36-38</p>
          <p class="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
            What the New Testament sets out for anyone who would be saved
          </p>
        </div>
      </div>
    </div>

    <section class="py-16 md:py-20">
      <div class="mx-auto max-w-3xl px-5 sm:px-6">
        <ol class="salvation-steps flex flex-col">
          <li
            v-for="step in steps"
            :id="step.id"
            :key="step.id"
            class="relative scroll-mt-24 pb-12 before:absolute before:top-14 before:bottom-2 before:left-[1.375rem] before:w-px before:bg-rule last:pb-0 last:before:hidden md:pb-14"
          >
            <div class="flex items-start gap-5 md:gap-7">
              <span
                class="step-num flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary-soft font-display text-lg font-semibold text-primary-ink"
                aria-hidden="true"
              ></span>
              <div class="min-w-0 pt-1">
                <h2
                  class="font-display text-2xl leading-tight font-bold text-secondary md:text-[1.75rem]"
                >
                  {{ step.title }}
                </h2>
                <p class="citation num mt-1.5">Step {{ step.order }} · {{ step.scripture }}</p>
                <p class="mt-3 max-w-[62ch] text-lg leading-relaxed text-ink">{{ step.body }}</p>
              </div>
            </div>
          </li>
        </ol>

        <div class="bookcloth mt-16 rounded-lg px-6 py-8 shadow-xs md:px-10 md:py-10">
          <h2 class="font-display text-2xl font-bold text-white md:text-[1.75rem]">
            Want to talk this through?
          </h2>
          <p class="mt-3 max-w-xl text-lg leading-relaxed text-white/85">
            Reach the congregation at {{ settingsStore.settings.phone }} or
            {{ settingsStore.settings.email }}, or worship with us at
            {{ settingsStore.settings.address }}.
          </p>
          <NuxtLink
            to="/#contact"
            class="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-primary shadow-xs transition-colors duration-150 hover:bg-white/90"
          >
            <Icon icon="mdi:email-outline" aria-hidden="true" />
            Contact us
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Steps are numbered by the list itself, so the sequence always matches the order shown. */
.salvation-steps {
  counter-reset: salvation-step;
}
.salvation-steps > li {
  counter-increment: salvation-step;
}
.step-num::before {
  content: counter(salvation-step);
  font-variant-numeric: tabular-nums lining-nums;
}
</style>
