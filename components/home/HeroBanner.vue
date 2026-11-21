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
  <!-- Bookcloth frame: the register's binding, holding the church's own photograph -->
  <section class="bookcloth relative p-2 sm:p-3 lg:p-4">
    <div
      class="relative flex flex-col overflow-hidden rounded-md bg-surface lg:min-h-[calc(100svh-6rem)] lg:justify-end"
    >
      <!-- Photograph: full-bleed inside the frame -->
      <div
        class="relative h-[42svh] min-h-64 overflow-hidden bg-primary-active sm:h-[50svh] lg:absolute lg:inset-0 lg:h-auto"
      >
        <img
          :src="displayableImageUrl(image)"
          :alt="`${name} building`"
          class="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
          loading="eager"
        />
        <!-- A quiet floor shade so the ledger panel sits on the photo, not against it -->
        <div
          class="absolute inset-0 hidden bg-gradient-to-t from-black/40 via-black/5 to-transparent lg:block"
          aria-hidden="true"
        ></div>

        <!-- Scroll indicator -->
        <div
          class="absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-md bg-black/35 text-white/85 lg:right-8 lg:bottom-8"
        >
          <Icon icon="mdi:chevron-down" class="h-6 w-6" />
        </div>
      </div>

      <!-- Ledger panel: the welcome entry -->
      <div
        class="relative z-10 bg-surface px-5 py-8 sm:px-8 sm:py-10 lg:m-8 lg:max-w-2xl lg:rounded-md lg:px-10 lg:py-10 lg:shadow-lg xl:m-12"
      >
        <div class="margin-rule">
          <h1
            class="hero-animate font-display text-[2.25rem] leading-[1.1] font-bold text-secondary sm:text-5xl lg:text-[3.5rem]"
            style="animation-delay: 0ms"
          >
            <span
              class="mb-2 block font-display text-xl leading-snug font-medium text-ink-muted sm:text-2xl"
            >
              {{ eyebrow }}
            </span>
            {{ name }}
          </h1>
          <p
            class="hero-animate mt-5 flex items-start gap-2 text-lg leading-relaxed text-ink"
            style="animation-delay: 120ms"
          >
            <Icon
              icon="mdi:map-marker-outline"
              class="mt-1 h-5 w-5 shrink-0 text-primary-ink"
              aria-hidden="true"
            />
            <span>{{ addr }}</span>
          </p>
          <p
            v-if="tagline"
            class="hero-animate mt-3 font-display text-lg leading-relaxed text-ink-muted italic"
            style="animation-delay: 240ms"
          >
            {{ tagline }}
          </p>

          <div
            class="hero-animate mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            style="animation-delay: 360ms"
          >
            <a
              v-if="primaryCtaLabel"
              :href="primaryCtaHref || '#'"
              class="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-semibold text-on-primary shadow-xs transition-colors duration-150 hover:bg-primary-hover active:bg-primary-active"
              :aria-label="primaryCtaLabel"
            >
              <Icon icon="mdi:weather-sunny" class="h-5 w-5" />
              {{ primaryCtaLabel }}
            </a>
            <a
              v-if="secondaryCtaLabel"
              :href="secondaryCtaHref || '#'"
              class="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-rule-strong bg-surface px-6 text-base font-semibold text-ink shadow-xs transition-colors duration-150 hover:border-ink-subtle hover:bg-surface-muted"
              :aria-label="secondaryCtaLabel"
            >
              <Icon icon="mdi:clock-outline" class="h-5 w-5" />
              {{ secondaryCtaLabel }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
