<script setup lang="ts">
/**
 * Renders a legal page (Privacy Policy, Terms of Use) from Settings → Legal Pages.
 * Shared by /privacy-policy and /terms-of-use so both read identically.
 */
const props = defineProps<{
  page: 'privacyPolicy' | 'termsOfUse'
  /** Headline in two parts: plain, then the italic turn. */
  title: [string, string]
}>()

const settingsStore = useChurchSettingsStore()
onMounted(() => settingsStore.load())

const ready = computed(() => settingsStore.loaded || !!settingsStore.error)
const doc = computed(() => settingsStore.settings[props.page])
const fill = (text: string) => fillLegalTokens(text, settingsStore.settings)

const sections = computed(() =>
  doc.value.sections
    .filter((s) => s.heading.trim() || s.body.trim())
    .map((s) => ({ id: s.id, heading: fill(s.heading), paragraphs: toParagraphs(fill(s.body)) }))
)

const lastUpdated = computed(() => {
  if (!doc.value.lastUpdated) return ''
  const date = new Date(`${doc.value.lastUpdated}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
})
</script>

<template>
  <div class="bg-surface">
    <header class="site-container pt-16 pb-12 md:pt-24 md:pb-16 lg:pt-32">
      <h1 class="t-display max-w-5xl text-secondary">
        <SplitReveal :text="title[0]" immediate :delay="100" />
        {{ ' ' }}
        <SplitReveal :text="title[1]" immediate :delay="320" class="t-turn text-primary-ink" />
      </h1>
      <p
        v-if="lastUpdated"
        class="hero-animate t-label mt-10 text-ink-muted"
        style="animation-delay: 500ms"
      >
        Last updated {{ lastUpdated }}
      </p>
      <div v-reveal="'rule'" class="mt-10 h-px bg-rule md:mt-14"></div>
    </header>

    <div class="site-container pb-24 md:pb-32">
      <LoadingState v-if="!ready" title="Loading…" />
      <article v-else class="grid gap-10 md:grid-cols-12 md:gap-8">
        <p v-if="doc.intro.trim()" class="t-lede md:col-span-8 md:col-start-4">
          {{ fill(doc.intro) }}
        </p>

        <section
          v-for="(section, i) in sections"
          :id="`section-${i + 1}`"
          :key="section.id"
          class="grid scroll-mt-28 gap-4 border-t border-rule pt-8 md:col-span-12 md:grid-cols-12 md:gap-8"
        >
          <h2 class="t-h3 text-secondary md:col-span-3">{{ section.heading }}</h2>
          <div class="prose-register md:col-span-8 md:col-start-4">
            <p v-for="(para, j) in section.paragraphs" :key="j" class="whitespace-pre-line">
              {{ para }}
            </p>
          </div>
        </section>
      </article>
    </div>
  </div>
</template>
