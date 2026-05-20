<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.worshipThisSunday)
</script>

<template>
  <section class="bg-white py-16">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Heading -->
      <div class="mb-10 text-center">
        <p
          v-if="cfg.eyebrow"
          class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400"
        >
          {{ cfg.eyebrow }}
        </p>
        <h2 class="mt-2 font-serif text-3xl font-bold text-gray-900">{{ cfg.heading }}</h2>
      </div>

      <!-- Two-column layout -->
      <div class="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-8">
        <!-- Left: service info card -->
        <div class="flex flex-1 flex-col rounded-xl border border-gray-100 bg-white p-7 shadow-sm">
          <!-- Church seal + name -->
          <div class="flex items-center gap-4">
            <!-- Church seal SVG (same as navbar, scaled to 48px) -->
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#1E3A5F]"
            >
              <svg viewBox="0 0 100 100" class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" fill="white" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#1E3A5F" stroke-width="0.8" />
                <g transform="translate(50,50)">
                  <path
                    d="M-18,-12 Q-18,-15 -12,-15 L0,-15 L0,15 L-12,15 Q-18,15 -18,12 Z"
                    fill="#f5e6c8"
                    stroke="#8B6914"
                    stroke-width="1.2"
                  />
                  <path
                    d="M18,-12 Q18,-15 12,-15 L0,-15 L0,15 L12,15 Q18,15 18,12 Z"
                    fill="#f5e6c8"
                    stroke="#8B6914"
                    stroke-width="1.2"
                  />
                  <rect x="-1.5" y="-15" width="3" height="30" fill="#8B6914" />
                  <line x1="-15" y1="-6" x2="-3" y2="-6" stroke="#8B6914" stroke-width="0.8" />
                  <line x1="-15" y1="-1" x2="-3" y2="-1" stroke="#8B6914" stroke-width="0.8" />
                  <line x1="-15" y1="4" x2="-3" y2="4" stroke="#8B6914" stroke-width="0.8" />
                  <line x1="3" y1="-6" x2="15" y2="-6" stroke="#8B6914" stroke-width="0.8" />
                  <line x1="3" y1="-1" x2="15" y2="-1" stroke="#8B6914" stroke-width="0.8" />
                  <line x1="3" y1="4" x2="15" y2="4" stroke="#8B6914" stroke-width="0.8" />
                </g>
                <text
                  x="50"
                  y="82"
                  text-anchor="middle"
                  font-size="6.5"
                  font-weight="bold"
                  fill="#1E3A5F"
                  font-family="serif"
                  letter-spacing="0.5"
                >
                  CHURCH OF CHRIST
                </text>
              </svg>
            </div>
            <div>
              <p class="font-bold text-gray-900">{{ cfg.cardChurchName }}</p>
              <p class="text-sm text-gray-500">{{ cfg.cardChurchSubtitle }}</p>
            </div>
          </div>

          <hr class="my-5 border-gray-100" />

          <!-- Service details -->
          <ul class="space-y-4">
            <li v-for="detail in cfg.details" :key="detail.id" class="flex items-start gap-3">
              <Icon :icon="detail.icon" class="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p class="text-sm font-medium text-gray-900">{{ detail.primary }}</p>
                <p class="text-xs text-gray-500">{{ detail.secondary }}</p>
              </div>
            </li>
          </ul>

          <!-- CTA -->
          <div v-if="cfg.directionsUrl" class="mt-6 pt-5 border-t border-gray-100">
            <a
              :href="cfg.directionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              <Icon icon="mdi:directions" class="h-4 w-4" />
              Get directions
            </a>
          </div>
        </div>

        <!-- Right: Map embed -->
        <div class="flex-1">
          <MapEmbed :address="cfg.mapAddress" height="100%" />
          <!-- Fallback visible if iframe is blocked -->
          <noscript>
            <div
              class="flex h-[280px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400"
            >
              <Icon icon="mdi:map-marker-outline" class="mb-2 h-10 w-10" />
              <p class="text-sm">{{ cfg.mapAddress }}</p>
            </div>
          </noscript>
        </div>
      </div>
    </div>
  </section>
</template>
