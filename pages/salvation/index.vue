<script setup lang="ts">
definePageMeta({
  layout: 'default',
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
  <div class="bg-surface">
    <!-- Page title: a calm editorial header on ivory -->
    <header class="site-container pt-16 pb-14 md:pt-24 md:pb-20 lg:pt-32">
      <h1 class="t-display max-w-5xl text-secondary">
        <SplitReveal text="God's Plan for" immediate :delay="100" />
        {{ ' ' }}
        <SplitReveal text="Salvation" immediate :delay="320" class="t-turn text-primary-ink" />
      </h1>
      <div class="mt-12 grid gap-6 md:mt-16 md:grid-cols-12 md:gap-8">
        <p
          class="hero-animate num font-display text-2xl text-accent italic md:col-span-4"
          style="animation-delay: 500ms"
        >
          Acts 2:36-38
        </p>
        <p
          class="hero-animate t-lede max-w-xl md:col-span-6 md:col-start-6"
          style="animation-delay: 620ms"
        >
          What the New Testament sets out for anyone who would be saved
        </p>
      </div>
      <div v-reveal="'rule'" class="mt-14 h-px bg-rule md:mt-20"></div>
    </header>

    <!-- The five steps: a vertical journey, one section per step -->
    <ol class="salvation-steps site-container pb-8 md:pb-16">
      <li
        v-for="step in steps"
        :id="step.id"
        :key="step.id"
        class="relative grid scroll-mt-28 gap-6 border-b border-rule py-16 last:border-b-0 md:grid-cols-12 md:gap-8 md:py-24 lg:py-28"
      >
        <!-- Step marker: the large serif numeral with the bronze thread below it -->
        <div
          v-reveal="'fade'"
          class="flex items-end gap-5 md:col-span-3 md:flex-col md:items-start"
        >
          <span
            class="step-num font-display text-[clamp(4.5rem,9vw,8rem)] leading-[0.8] text-accent"
            aria-hidden="true"
          ></span>
          <span class="t-label pb-2 text-ink-subtle md:pb-0">Step {{ step.order }}</span>
        </div>

        <div class="min-w-0 md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-5">
          <h2 class="t-h1 text-secondary">
            <SplitReveal :text="step.title" />
          </h2>
          <p v-reveal.150 class="num mt-5 font-display text-2xl text-accent italic">
            {{ step.scripture }}
          </p>
          <p v-reveal.250 class="t-lede mt-6 max-w-[62ch]">{{ step.body }}</p>
        </div>
      </li>
    </ol>

    <!-- The invitation: a forest field to close, set apart from the night footer -->
    <section class="field-forest section">
      <div class="site-container grid gap-12 md:grid-cols-12 md:gap-8">
        <h2 class="t-h1 text-on-night md:col-span-6">
          <SplitReveal text="Want to talk this through?" />
        </h2>
        <div v-reveal.200 class="md:col-span-5 md:col-start-8 md:pt-3">
          <p class="t-lede text-on-night-muted">
            Reach the congregation at
            <span class="num whitespace-nowrap text-on-night">{{
              settingsStore.settings.phone
            }}</span>
            or
            <span class="[overflow-wrap:anywhere] text-on-night">{{
              settingsStore.settings.email
            }}</span
            >, or worship with us at {{ settingsStore.settings.address }}.
          </p>
          <NuxtLink to="/#contact" class="btn btn-light mt-10 min-h-14 px-7">
            <Icon icon="mdi:email-outline" class="h-5 w-5" aria-hidden="true" />
            Contact us
            <Icon icon="mdi:arrow-right" class="btn-arrow h-5 w-5" aria-hidden="true" />
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
