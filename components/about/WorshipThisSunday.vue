<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.worshipThisSunday)
</script>

<template>
  <section class="bg-surface py-16 md:py-24">
    <div class="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <!-- Heading -->
      <div class="mb-10 md:mb-12">
        <h2
          class="font-display text-[1.875rem] leading-[1.15] font-bold text-secondary md:text-[2.5rem]"
        >
          {{ cfg.heading }}
        </h2>
        <p v-if="cfg.eyebrow" class="citation mt-3">
          {{ cfg.eyebrow }}
        </p>
      </div>

      <!-- Two-column layout -->
      <div class="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-8">
        <!-- Left: service info card -->
        <div
          class="flex flex-1 flex-col rounded-lg border border-rule bg-surface p-6 shadow-xs md:p-8"
        >
          <!-- Church seal + name -->
          <div class="flex items-center gap-4">
            <!-- Church seal SVG (same as navbar, scaled to 48px) -->
            <div
              class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-secondary bg-surface"
            >
              <svg viewBox="0 0 100 100" class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" fill="white" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#24364F" stroke-width="0.8" />
                <g transform="translate(50,50)">
                  <path
                    d="M-18,-12 Q-18,-15 -12,-15 L0,-15 L0,15 L-12,15 Q-18,15 -18,12 Z"
                    fill="#FFFFFF"
                    stroke="#8A5D0F"
                    stroke-width="1.2"
                  />
                  <path
                    d="M18,-12 Q18,-15 12,-15 L0,-15 L0,15 L12,15 Q18,15 18,12 Z"
                    fill="#FFFFFF"
                    stroke="#8A5D0F"
                    stroke-width="1.2"
                  />
                  <rect x="-1.5" y="-15" width="3" height="30" fill="#8A5D0F" />
                  <line x1="-15" y1="-6" x2="-3" y2="-6" stroke="#8A5D0F" stroke-width="0.8" />
                  <line x1="-15" y1="-1" x2="-3" y2="-1" stroke="#8A5D0F" stroke-width="0.8" />
                  <line x1="-15" y1="4" x2="-3" y2="4" stroke="#8A5D0F" stroke-width="0.8" />
                  <line x1="3" y1="-6" x2="15" y2="-6" stroke="#8A5D0F" stroke-width="0.8" />
                  <line x1="3" y1="-1" x2="15" y2="-1" stroke="#8A5D0F" stroke-width="0.8" />
                  <line x1="3" y1="4" x2="15" y2="4" stroke="#8A5D0F" stroke-width="0.8" />
                </g>
                <text
                  x="50"
                  y="82"
                  text-anchor="middle"
                  font-size="6.5"
                  font-weight="bold"
                  fill="#24364F"
                  font-family="Georgia, serif"
                  letter-spacing="0.5"
                >
                  CHURCH OF CHRIST
                </text>
              </svg>
            </div>
            <div>
              <p class="font-display text-lg leading-snug font-semibold text-ink">
                {{ cfg.cardChurchName }}
              </p>
              <p class="text-sm text-ink-muted">{{ cfg.cardChurchSubtitle }}</p>
            </div>
          </div>

          <!-- Service details: ruled entries -->
          <ul class="mt-6 divide-y divide-rule border-y border-rule">
            <li v-for="detail in cfg.details" :key="detail.id" class="flex items-start gap-4 py-4">
              <Icon
                :icon="detail.icon"
                class="mt-0.5 size-5 shrink-0 text-primary-ink"
                aria-hidden="true"
              />
              <div class="min-w-0">
                <p class="num font-display text-base font-semibold text-ink">
                  {{ detail.primary }}
                </p>
                <p class="mt-0.5 text-sm leading-relaxed text-ink-muted">{{ detail.secondary }}</p>
              </div>
            </li>
          </ul>

          <!-- CTA -->
          <div v-if="cfg.directionsUrl" class="mt-6">
            <a
              :href="cfg.directionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-rule-strong bg-surface px-4 text-sm font-semibold text-ink shadow-xs transition-colors duration-150 hover:border-ink-subtle hover:bg-surface-muted"
            >
              <Icon icon="mdi:directions" class="size-4 text-primary-ink" aria-hidden="true" />
              Get directions
            </a>
          </div>
        </div>

        <!-- Right: Map embed -->
        <div class="h-[280px] flex-1 md:h-auto md:min-h-[320px]">
          <MapEmbed :address="cfg.mapAddress" height="100%" />
          <!-- Fallback visible if iframe is blocked -->
          <noscript>
            <div
              class="flex h-[280px] flex-col items-center justify-center rounded-lg border border-rule bg-surface-muted text-ink-subtle"
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
