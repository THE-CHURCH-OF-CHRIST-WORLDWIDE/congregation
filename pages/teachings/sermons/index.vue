<script setup lang="ts">
definePageMeta({ layout: 'default' })

const store = usePublicTeachingsStore()
const activeFilter = ref('All Sermons')
const searchQuery = ref('')

const filterTags = [
  'All Sermons',
  'Church',
  'Faith',
  'Foundation',
  'Baptism',
  'Salvation',
  'Scripture',
  'Gospel',
  'Grace',
]

watch(activeFilter, (v) => {
  store.setFilter(v === 'All Sermons' ? 'All' : v)
})

watch(searchQuery, (v) => store.setSearch(v))

const displayedCount = ref(9)
const paginated = computed(() => store.filteredSermons.slice(0, displayedCount.value))
const hasMore = computed(() => store.filteredSermons.length > displayedCount.value)

function loadMore() {
  displayedCount.value += 6
}

useSeoMeta({
  title: 'Sermons — Church of Christ',
  description:
    'Browse our full library of biblical sermons preached at the Church of Christ. Topics include faith, baptism, salvation, gospel, and more.',
  ogTitle: 'Sermons — Church of Christ',
  ogDescription: 'Biblical preaching that exalts Christ and proclaims the whole counsel of God.',
  ogImage: '/images/heroImg.png',
})
</script>

<template>
  <div>
    <!-- Library header -->
    <section class="border-b border-rule bg-canvas">
      <div class="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
        <div class="hero-animate margin-rule">
          <h1
            class="font-display text-[2.25rem] leading-[1.1] font-bold text-secondary md:text-[3rem]"
          >
            Sermons
          </h1>
          <p class="mt-3 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Biblical preaching that exalts Christ and proclaims the whole counsel of God.
          </p>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
      <!-- Filter bar -->
      <div
        class="mb-8 flex flex-col gap-4 border-b border-rule pb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6"
      >
        <div class="min-w-0 lg:flex-1">
          <TagFilterBar
            :tags="filterTags"
            :active="activeFilter"
            @update:active="activeFilter = $event"
          />
        </div>

        <!-- Search -->
        <div class="relative w-full lg:max-w-xs">
          <Icon
            icon="mdi:magnify"
            class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search sermons…"
            class="min-h-11 w-full rounded-md border border-rule-strong bg-surface py-2 pr-3 pl-10 text-base text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15 sm:text-[15px]"
            aria-label="Search sermons"
          />
        </div>
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
      <EmptyState
        v-else-if="store.sermons.length"
        icon="mdi:microphone-off"
        title="No sermons match your search"
        description="Try a different filter or search term."
      />
      <EmptyState
        v-else
        icon="mdi:microphone-off"
        title="No sermons published yet"
        description="Sermons will appear here as they are published."
      />

      <!-- Load more -->
      <div v-if="hasMore" class="mt-12 flex justify-center border-t border-rule pt-8">
        <button
          class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-rule-strong bg-surface px-6 text-sm font-semibold text-ink shadow-xs transition-colors duration-150 hover:border-ink-subtle hover:bg-surface-muted sm:w-auto"
          aria-label="Load more sermons"
          @click="loadMore"
        >
          Load More Sermons
          <Icon icon="mdi:chevron-down" class="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- CTA banner -->
    <section class="bookcloth py-16 md:py-20">
      <div class="mx-auto max-w-3xl px-5 text-center sm:px-6">
        <h2 class="font-display text-3xl leading-tight font-bold text-white md:text-4xl">
          Want to Study the Bible?
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-white/80">
          Our Sunday School lessons offer in-depth, structured Bible study for every level of
          maturity in the faith.
        </p>
        <NuxtLink
          to="/teachings/sunday-school"
          class="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-surface px-6 text-base font-semibold text-primary-ink shadow-xs transition-colors duration-150 hover:bg-primary-soft"
          aria-label="View Sunday School lessons"
        >
          View Sunday School Lessons
          <Icon icon="mdi:arrow-right" class="size-5" aria-hidden="true" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
