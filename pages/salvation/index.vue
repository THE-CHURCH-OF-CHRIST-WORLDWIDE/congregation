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
    <!-- Hero — mirrors AboutHero's proportions without needing a configured image -->
    <div class="relative h-[200px] w-full overflow-hidden bg-[#1E3A5F] md:h-[280px]">
      <div class="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-300">
          Acts 2:36-38
        </p>
        <h1 class="font-serif text-4xl font-bold text-white md:text-5xl">
          God's Plan for Salvation
        </h1>
        <p class="mt-3 text-base font-light text-white/80 md:text-lg">
          What the New Testament sets out for anyone who would be saved
        </p>
      </div>
    </div>

    <section class="py-16">
      <div class="mx-auto max-w-3xl px-4 sm:px-6">
        <ol class="flex flex-col gap-6">
          <li
            v-for="step in steps"
            :id="step.id"
            :key="step.id"
            class="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6 md:p-8"
          >
            <div class="flex items-start gap-4">
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700"
                aria-hidden="true"
              >
                {{ step.order.charAt(0) }}
              </span>
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-widest text-blue-600">
                  Step {{ step.order }} · {{ step.scripture }}
                </p>
                <h2 class="mt-1 font-serif text-2xl font-bold text-[#1E3A5F]">{{ step.title }}</h2>
                <p class="mt-3 leading-relaxed text-gray-600">{{ step.body }}</p>
              </div>
            </div>
          </li>
        </ol>

        <div class="mt-10 rounded-2xl bg-[#F8FAFC] p-6 text-center md:p-8">
          <h2 class="font-serif text-2xl font-bold text-[#1E3A5F]">Want to talk this through?</h2>
          <p class="mx-auto mt-2 max-w-xl text-gray-600">
            Reach the congregation at {{ settingsStore.settings.phone }} or
            {{ settingsStore.settings.email }}, or worship with us at
            {{ settingsStore.settings.address }}.
          </p>
          <NuxtLink
            to="/#contact"
            class="mt-5 inline-flex items-center gap-2 rounded-full bg-[#026AA2] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Icon icon="mdi:email-outline" />
            Contact us
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
