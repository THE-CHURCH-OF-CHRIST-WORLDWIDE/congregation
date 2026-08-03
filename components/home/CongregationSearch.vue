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
  <section id="congregations" ref="sectionRef" class="bg-[#F8F9FA] py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
          'mx-auto mb-10 flex max-w-2xl items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm',
          'reveal',
          'delay-150',
          isVisible && 'is-visible',
        ]"
      >
        <Icon icon="heroicons:magnifying-glass" class="h-5 w-5 shrink-0 text-gray-400" />
        <input
          v-model="query"
          type="text"
          placeholder="Search for a congregation near you…"
          class="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          aria-label="Search for a congregation"
        />
        <button
          class="rounded-lg bg-[#2563EB] px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          aria-label="Show matching congregations"
          @click="showResults"
        >
          Search
        </button>
      </div>

      <!-- Results grid -->
      <div v-if="results.length" ref="resultsRef" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(cg, i) in results"
          :key="cg.id"
          :class="['reveal-scale', isVisible && 'is-visible']"
          :style="{ transitionDelay: `${200 + i * 60}ms` }"
        >
          <div
            class="rounded-xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E3A5F]/10">
              <Icon icon="heroicons:building-library" class="h-5 w-5 text-[#1E3A5F]" />
            </div>
            <h3 class="font-semibold text-[#1E3A5F] text-sm leading-snug">{{ cg.name }}</h3>
            <p class="text-xs text-gray-500 leading-relaxed">{{ cg.address }}</p>
            <div class="flex items-center gap-1.5 text-xs text-gray-400">
              <Icon icon="heroicons:clock" class="h-3.5 w-3.5" />
              {{ cg.serviceTime }}
            </div>
            <a
              :href="directionsUrl(cg)"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-auto w-full rounded-lg bg-[#1E3A5F] py-2 text-center text-xs font-semibold text-white hover:bg-[#2563EB] transition-colors"
              :aria-label="`Get directions to ${cg.name}`"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>

      <LoadingState v-else-if="settingsStore.loading" title="Loading congregations…" />
      <EmptyState
        v-else-if="query"
        icon="heroicons:building-library"
        title="No congregations found"
        :description="`Nothing matched &quot;${query}&quot;. Try a different city or name.`"
      />
      <EmptyState
        v-else
        icon="heroicons:building-library"
        title="No congregations listed yet"
        description="Sister congregations are added from Settings → Congregations."
      />
    </div>
  </section>
</template>
