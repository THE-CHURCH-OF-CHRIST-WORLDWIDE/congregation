<script setup lang="ts">
import type { Activity } from '~/repositories/churchSettingsRepository'

const props = defineProps<{
  churchName?: string
  address?: string
  buildingImage?: string
  activities?: Activity[]
}>()

const settingsStore = useChurchSettingsStore()

onMounted(() => {
  settingsStore.load()
})

const name = computed(() => props.churchName ?? settingsStore.settings.name)
const addr = computed(() => props.address ?? settingsStore.settings.address)
const image = computed(
  () => props.buildingImage ?? (settingsStore.settings.heroImageUrl || '/images/heroImg.png')
)
const eyebrow = computed(() => settingsStore.settings.heroEyebrow)
const tagline = computed(() => settingsStore.settings.heroTagline)
const primaryCtaLabel = computed(() => settingsStore.settings.heroPrimaryCtaLabel)
const primaryCtaHref = computed(() => settingsStore.settings.heroPrimaryCtaHref)
const secondaryCtaLabel = computed(() => settingsStore.settings.heroSecondaryCtaLabel)
const secondaryCtaHref = computed(() => settingsStore.settings.heroSecondaryCtaHref)
</script>

<template>
  <!-- The cover: the church's own photograph, its name set like a masthead -->
  <section
    class="field-night relative isolate flex h-[100svh] min-h-[38rem] flex-col justify-end overflow-hidden"
    aria-labelledby="cover-title"
  >
    <!-- Photograph -->
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <div v-parallax="0.18" class="absolute -inset-y-[8%] inset-x-0">
        <img
          :src="displayableImageUrl(image)"
          :alt="`${name} building`"
          class="cover-img h-full w-full object-cover pointer-events-none select-none"
          loading="eager"
          fetchpriority="high"
        />
      </div>
      <!-- Veil, then a floor shade so the masthead always reads -->
      <div class="absolute inset-0 bg-night/35"></div>
      <div
        class="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-night/90 via-night/45 to-transparent"
      ></div>
    </div>

    <div class="site-container pb-10 sm:pb-14 lg:pb-16">
      <h1 id="cover-title" class="max-w-[62rem] text-on-night">
        <SplitReveal
          v-if="eyebrow"
          :text="eyebrow"
          immediate
          :delay="250"
          class="t-turn mb-3 block text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight text-champagne"
        />
        <SplitReveal :text="name" immediate :delay="400" :stagger="70" class="t-display block" />
      </h1>

      <div
        class="mt-10 grid gap-8 border-t border-on-night/20 pt-7 md:grid-cols-12 md:items-end lg:mt-14"
      >
        <div class="hero-animate md:col-span-6 lg:col-span-5" style="animation-delay: 900ms">
          <p class="flex items-start gap-2.5 text-base leading-relaxed text-on-night sm:text-lg">
            <Icon
              icon="mdi:map-marker-outline"
              class="mt-1 h-5 w-5 shrink-0 text-champagne"
              aria-hidden="true"
            />
            <span>{{ addr }}</span>
          </p>
          <p
            v-if="tagline"
            class="mt-3 font-display text-xl leading-snug text-on-night-muted italic sm:text-2xl"
          >
            {{ tagline }}
          </p>
        </div>

        <div
          class="hero-animate flex flex-col gap-3 sm:flex-row sm:flex-wrap md:col-span-6 md:justify-end lg:col-span-7"
          style="animation-delay: 1050ms"
        >
          <a
            v-if="primaryCtaLabel"
            :href="primaryCtaHref || '#'"
            class="btn btn-light min-h-14 px-7"
            :aria-label="primaryCtaLabel"
          >
            {{ primaryCtaLabel }}
            <Icon icon="mdi:arrow-right" class="btn-arrow h-5 w-5" />
          </a>
          <a
            v-if="secondaryCtaLabel"
            :href="secondaryCtaHref || '#'"
            class="btn btn-ghost-light min-h-14 px-7"
            :aria-label="secondaryCtaLabel"
          >
            {{ secondaryCtaLabel }}
          </a>
        </div>
      </div>
    </div>

    <!-- Scroll indicator: a hairline drawing downward -->
    <div
      class="hero-animate pointer-events-none absolute right-[var(--site-gutter)] bottom-[14.75rem] hidden flex-col items-center gap-4 lg:flex"
      style="animation-delay: 1400ms"
      aria-hidden="true"
    >
      <span class="t-label text-on-night-muted [writing-mode:vertical-rl]">Scroll</span>
      <span class="relative block h-16 w-px overflow-hidden bg-on-night/20">
        <span class="scroll-line absolute inset-0 bg-champagne"></span>
      </span>
    </div>
  </section>
</template>

<style scoped>
.cover-img {
  animation: cover-settle 2.6s var(--ease-out-expo) both;
}
.scroll-line {
  animation: scroll-line 2.4s var(--ease-in-out-quint) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .cover-img,
  .scroll-line {
    animation: none;
  }
}
</style>
