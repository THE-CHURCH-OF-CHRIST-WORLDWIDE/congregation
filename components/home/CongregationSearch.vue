<script setup lang="ts">
const settingsStore = useChurchSettingsStore()
onMounted(() => settingsStore.load())

const congregations = computed(() => settingsStore.settings.congregations)

const query = ref('')

const results = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return congregations.value
  return congregations.value.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
  )
})

/** Opens the congregation's address in the visitor's map app of choice. */
function directionsUrl(cg: { name: string; address: string; city: string }) {
  const query = [cg.name, cg.address, cg.city].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

// Results filter as you type, so the button's job is to bring them into view —
// on a phone the list sits below the fold.
const resultsRef = ref<HTMLElement | null>(null)
function showResults() {
  resultsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section id="congregations" class="field-forest section scroll-mt-20">
    <div class="site-container grid gap-14 lg:grid-cols-12 lg:gap-8">
      <!-- Left: the question, and the search -->
      <div class="lg:col-span-5">
        <div class="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
          <h2 class="t-h2 max-w-[14ch] text-on-night">
            <SplitReveal text="Find a Congregation Near You" />
          </h2>
          <p v-reveal.150 class="t-lede mt-5 max-w-md !text-on-night-muted">
            Search for a Church of Christ congregation in your city or state.
          </p>

          <!-- Search bar -->
          <div
            v-reveal.250
            class="mt-10 flex items-center gap-3 border-b border-on-night/35 pb-1 transition-[border-color] duration-300 focus-within:border-champagne"
          >
            <Icon icon="mdi:magnify" class="h-6 w-6 shrink-0 text-on-night-muted" />
            <input
              v-model="query"
              type="text"
              placeholder="City, state or congregation…"
              class="min-h-14 min-w-0 flex-1 bg-transparent text-lg text-on-night outline-none placeholder:text-on-night-muted focus-visible:outline-none"
              aria-label="Search for a congregation"
            />
            <button
              class="btn btn-light min-h-11 shrink-0 px-5 text-sm"
              aria-label="Show matching congregations"
              @click="showResults"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <!-- Right: a ruled directory, one congregation per entry -->
      <div class="lg:col-span-7 lg:col-start-6">
        <ol v-if="results.length" ref="resultsRef" class="scroll-mt-28 border-t border-on-night/25">
          <li
            v-for="(cg, i) in results"
            :key="cg.id"
            v-reveal="{ delay: 100 + Math.min(i, 6) * 70 }"
            class="border-b border-on-night/15"
          >
            <div
              class="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
            >
              <div class="min-w-0">
                <h3 class="font-display text-[1.75rem] leading-[1.1] text-on-night">
                  {{ cg.name }}
                </h3>
                <p class="mt-2 text-base leading-relaxed text-on-night-muted">{{ cg.address }}</p>
                <div class="num mt-2 flex items-center gap-2 text-[0.9375rem] text-on-night">
                  <Icon icon="mdi:clock-outline" class="h-4 w-4 shrink-0 text-champagne" />
                  {{ cg.serviceTime }}
                </div>
              </div>
              <a
                :href="directionsUrl(cg)"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-ghost-light min-h-11 shrink-0 self-start px-5 text-sm sm:self-center"
                :aria-label="`Get directions to ${cg.name}`"
              >
                Get Directions
                <Icon icon="mdi:arrow-top-right" class="btn-arrow h-4 w-4" />
              </a>
            </div>
          </li>
        </ol>

        <div v-else>
          <p v-if="settingsStore.loading" class="t-label py-10 text-on-night-muted" role="status">
            Loading congregations…
          </p>
          <EditorialNote
            v-else-if="query"
            tone="forest"
            title="No congregations found"
            :description="`Nothing matched &quot;${query}&quot;. Try a different city or name.`"
          />
          <EditorialNote
            v-else
            tone="forest"
            title="No congregations listed yet"
            description="Our list of sister congregations is coming soon. Please check back."
          />
        </div>
      </div>
    </div>
  </section>
</template>
