<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.worshipThisSunday)
</script>

<template>
  <section class="section bg-surface">
    <div class="site-container">
      <!-- Heading -->
      <div class="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end">
        <h2 class="t-h1 text-secondary md:col-span-8">
          <SplitReveal :text="cfg.heading" />
        </h2>
        <p
          v-if="cfg.eyebrow"
          v-reveal.150
          class="t-label text-ink-subtle md:col-span-4 md:text-right"
        >
          {{ cfg.eyebrow }}
        </p>
      </div>

      <div class="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <!-- Left: the order of service, as a printed programme -->
        <div class="lg:col-span-6">
          <!-- Church seal + name -->
          <div v-reveal class="flex items-center gap-4 border-t border-ink/80 pt-6">
            <div
              class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-rule-strong bg-surface"
            >
              <svg viewBox="0 0 100 100" class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" fill="#FAF8F3" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#22211D" stroke-width="0.8" />
                <g transform="translate(50,50)">
                  <path
                    d="M-18,-12 Q-18,-15 -12,-15 L0,-15 L0,15 L-12,15 Q-18,15 -18,12 Z"
                    fill="#FAF8F3"
                    stroke="#8A6A3B"
                    stroke-width="1.2"
                  />
                  <path
                    d="M18,-12 Q18,-15 12,-15 L0,-15 L0,15 L12,15 Q18,15 18,12 Z"
                    fill="#FAF8F3"
                    stroke="#8A6A3B"
                    stroke-width="1.2"
                  />
                  <rect x="-1.5" y="-15" width="3" height="30" fill="#8A6A3B" />
                  <line x1="-15" y1="-6" x2="-3" y2="-6" stroke="#8A6A3B" stroke-width="0.8" />
                  <line x1="-15" y1="-1" x2="-3" y2="-1" stroke="#8A6A3B" stroke-width="0.8" />
                  <line x1="-15" y1="4" x2="-3" y2="4" stroke="#8A6A3B" stroke-width="0.8" />
                  <line x1="3" y1="-6" x2="15" y2="-6" stroke="#8A6A3B" stroke-width="0.8" />
                  <line x1="3" y1="-1" x2="15" y2="-1" stroke="#8A6A3B" stroke-width="0.8" />
                  <line x1="3" y1="4" x2="15" y2="4" stroke="#8A6A3B" stroke-width="0.8" />
                </g>
                <text
                  x="50"
                  y="82"
                  text-anchor="middle"
                  font-size="6.5"
                  fill="#22211D"
                  font-family="Georgia, serif"
                  letter-spacing="0.5"
                >
                  CHURCH OF CHRIST
                </text>
              </svg>
            </div>
            <div>
              <p class="font-display text-[1.5rem] leading-tight text-ink">
                {{ cfg.cardChurchName }}
              </p>
              <p class="t-label mt-1 text-ink-subtle">{{ cfg.cardChurchSubtitle }}</p>
            </div>
          </div>

          <!-- Service details: ruled entries -->
          <ul class="mt-6 border-t border-rule-strong">
            <li
              v-for="(detail, i) in cfg.details"
              :key="detail.id"
              v-reveal="{ delay: 80 + Math.min(i, 6) * 80 }"
              class="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-5 border-b border-rule-strong py-6"
            >
              <Icon :icon="detail.icon" class="mt-2 size-5 text-accent" aria-hidden="true" />
              <div class="min-w-0">
                <p
                  class="num font-display text-[1.75rem] leading-[1.1] break-words text-ink md:text-[2.125rem]"
                >
                  {{ detail.primary }}
                </p>
                <p class="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
                  {{ detail.secondary }}
                </p>
              </div>
            </li>
          </ul>

          <!-- CTA -->
          <div v-if="cfg.directionsUrl" v-reveal class="mt-10">
            <a
              :href="cfg.directionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-outline min-h-14 px-7"
            >
              <Icon icon="mdi:directions" class="size-5" aria-hidden="true" />
              Get directions
              <Icon icon="mdi:arrow-top-right" class="btn-arrow size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <!-- Right: Map embed -->
        <div
          v-reveal="{ type: 'unveil', delay: 200 }"
          class="map-frame h-[320px] lg:col-span-6 lg:h-auto lg:min-h-[34rem]"
        >
          <MapEmbed :address="cfg.mapAddress" height="100%" />
          <!-- Fallback visible if iframe is blocked -->
          <noscript>
            <div
              class="flex h-[280px] flex-col items-center justify-center border border-rule bg-surface-muted text-ink-subtle"
            >
              <Icon icon="mdi:map-marker-outline" class="mb-2 size-10" />
              <p class="text-sm">{{ cfg.mapAddress }}</p>
            </div>
          </noscript>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Square the shared map frame so it sits in the printed page */
.map-frame :deep(> div) {
  border-radius: 0;
  border-color: var(--c-rule-strong);
}
</style>
