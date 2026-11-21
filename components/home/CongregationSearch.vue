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

const { el: sectionRef, isVisible } = useScrollReveal()
</script>

<template>
  <section id="congregations" ref="sectionRef" class="scroll-mt-20 bg-canvas py-16 md:py-24">
    <div class="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
      <div :class="['reveal', isVisible && 'is-visible']">
        <SectionHeader
          title="Find a Congregation Near You"
          subtitle="Search for a Church of Christ congregation in your city or state."
          centered
        />
      </div>

      <!-- Search bar -->
      <div
        :class="[
          'mb-10 flex items-center gap-2 rounded-md border border-rule-strong bg-surface py-1.5 pr-1.5 pl-4 shadow-xs transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15 hover:border-ink-subtle',
          'reveal',
          'delay-150',
          isVisible && 'is-visible',
        ]"
      >
        <Icon icon="mdi:magnify" class="h-6 w-6 shrink-0 text-ink-subtle" />
        <input
          v-model="query"
          type="text"
          placeholder="Search for a congregation near you…"
          class="min-h-11 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-subtle"
          aria-label="Search for a congregation"
        />
        <button
          class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-primary px-5 text-base font-semibold text-on-primary shadow-xs transition-colors duration-150 hover:bg-primary-hover"
          aria-label="Show matching congregations"
          @click="showResults"
        >
          Search
        </button>
      </div>

      <!-- Results: a ruled directory, one congregation per entry -->
      <div
        v-if="results.length"
        ref="resultsRef"
        class="scroll-mt-24 divide-y divide-rule rounded-lg border border-rule bg-surface shadow-xs"
      >
        <div
          v-for="(cg, i) in results"
          :key="cg.id"
          :class="['reveal-scale', isVisible && 'is-visible']"
          :style="{ transitionDelay: `${200 + i * 60}ms` }"
        >
          <div
            class="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <div class="min-w-0">
              <h3 class="font-display text-lg leading-snug font-semibold text-ink">
                {{ cg.name }}
              </h3>
              <p class="mt-1 text-base leading-relaxed text-ink-muted">{{ cg.address }}</p>
              <div class="num mt-1.5 flex items-center gap-1.5 text-base text-ink-muted">
                <Icon icon="mdi:clock-outline" class="h-5 w-5 shrink-0 text-ink-subtle" />
                {{ cg.serviceTime }}
              </div>
            </div>
            <a
              :href="directionsUrl(cg)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-rule-strong bg-surface px-4 text-base font-semibold text-ink shadow-xs transition-colors duration-150 hover:border-ink-subtle hover:bg-surface-muted"
              :aria-label="`Get directions to ${cg.name}`"
            >
              <Icon icon="mdi:directions" class="h-5 w-5 text-primary-ink" />
              Get Directions
            </a>
          </div>
        </div>
      </div>

      <LoadingState v-else-if="settingsStore.loading" title="Loading congregations…" />
      <EmptyState
        v-else-if="query"
        icon="mdi:church-outline"
        title="No congregations found"
        :description="`Nothing matched &quot;${query}&quot;. Try a different city or name.`"
      />
      <EmptyState
        v-else
        icon="mdi:church-outline"
        title="No congregations listed yet"
        description="Our list of sister congregations is coming soon. Please check back."
      />
    </div>
  </section>
</template>
