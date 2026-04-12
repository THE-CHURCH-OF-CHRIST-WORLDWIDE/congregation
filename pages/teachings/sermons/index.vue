<script setup lang="ts">
definePageMeta({ layout: 'default' })

const store = usePublicTeachingsStore()
const activeFilter = ref('All Sermons')
const searchQuery = ref('')

const filterTags = ['All Sermons', 'Church', 'Faith', 'Foundation', 'Baptism', 'Salvation', 'Scripture', 'Gospel', 'Grace']

const normalisedFilter = computed(() =>
  activeFilter.value === 'All Sermons' ? 'All' : activeFilter.value,
)

const storeFilter = computed({
  get: () => store.activeFilter,
  set: (v: string) => store.setFilter(v),
})

watch(activeFilter, v => {
  store.setFilter(v === 'All Sermons' ? 'All' : v)
})

watch(searchQuery, v => store.setSearch(v))

const displayedCount = ref(9)
const paginated = computed(() => store.filteredSermons.slice(0, displayedCount.value))
const hasMore = computed(() => store.filteredSermons.length > displayedCount.value)

function loadMore() {
  displayedCount.value += 6
}

useSeoMeta({
  title: 'Sermons — Church of Christ',
  description: 'Browse our full library of biblical sermons preached at the Church of Christ. Topics include faith, baptism, salvation, gospel, and more.',
  ogTitle: 'Sermons — Church of Christ',
  ogDescription: 'Biblical preaching that exalts Christ and proclaims the whole counsel of God.',
  ogImage: '/images/heroImg.png',
})
</script>

<template>
  <div class="pt-16">
    <!-- Banner -->
    <section class="relative bg-[#1E3A5F] py-20 overflow-hidden">
      <img
        src="https://picsum.photos/seed/sermons-banner/1920/600"
        alt="Sermons banner"
        class="absolute inset-0 h-full w-full object-cover opacity-20"
        loading="lazy"
      />
      <div class="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        <h1 class="font-serif text-5xl font-bold drop-shadow-lg md:text-6xl">Sermons</h1>
        <p class="mt-4 text-white/70 text-lg max-w-2xl mx-auto">
          Biblical preaching that exalts Christ and proclaims the whole counsel of God.
        </p>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Filter bar -->
      <div class="mb-3">
        <TagFilterBar :tags="filterTags" :active="activeFilter" @update:active="activeFilter = $event" />
      </div>

      <!-- Search -->
      <div class="mb-8 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm max-w-md">
        <Icon icon="heroicons:magnifying-glass" class="h-5 w-5 shrink-0 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search sermons…"
          class="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          aria-label="Search sermons"
        />
      </div>

      <!-- Grid -->
      <div v-if="paginated.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ContentCard
          v-for="sermon in paginated"
          :key="sermon.id"
          :thumbnail="sermon.thumbnailSrc"
          :tags="sermon.tags"
          :title="sermon.title"
          :author="sermon.preacher"
          :date="sermon.date"
          :slug="sermon.slug"
          type="sermon"
        />
      </div>
      <div v-else class="py-16 text-center text-gray-400">
        <Icon icon="heroicons:microphone-slash" class="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No sermons found. Try a different filter or search term.</p>
      </div>

      <!-- Load more -->
      <div v-if="hasMore" class="mt-10 text-center">
        <button
          @click="loadMore"
          class="rounded-full border border-[#2563EB] px-8 py-3 text-sm font-semibold text-[#2563EB] hover:bg-blue-50 transition-colors"
          aria-label="Load more sermons"
        >
          Load More Sermons
        </button>
      </div>
    </div>

    <!-- CTA banner -->
    <section class="bg-[#1E3A5F] py-14">
      <div class="mx-auto max-w-4xl px-6 text-center text-white">
        <h2 class="font-serif text-3xl font-bold mb-3">Want to Study the Bible?</h2>
        <p class="text-white/70 mb-8 max-w-xl mx-auto">
          Our Sunday School lessons offer in-depth, structured Bible study for every level of maturity in the faith.
        </p>
        <NuxtLink
          to="/teachings/sunday-school"
          class="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-8 py-3.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
          aria-label="View Sunday School lessons"
        >
          View Sunday School Lessons
          <Icon icon="heroicons:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
