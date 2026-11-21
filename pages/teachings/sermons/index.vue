<script setup lang="ts">
definePageMeta({ layout: 'default' })

const store = usePublicTeachingsStore()
const activeFilter = ref('All Sermons')
const searchQuery = ref('')

const fallbackTags = [
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

// Filters come from the categories actually used on published sermons; until anything is
// published the original list stands in, so the bar never renders empty.
const filterTags = computed(() => {
  const used = [...new Set(store.sermons.flatMap((t) => t.tags))].sort((a, b) => a.localeCompare(b))
  return used.length ? ['All Sermons', ...used] : fallbackTags
})

onMounted(() => store.load())

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
  ogImage: '/images/hero-cover.jpg',
})
</script>

<template>
  <div>
    <!-- Library header: ivory, an oversized title, the intro set to the right -->
    <section class="bg-surface">
      <div class="site-container pt-16 pb-14 md:pt-24 md:pb-20">
        <div class="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h1 class="t-display text-ink lg:col-span-7">
            <SplitReveal text="Sermons" immediate :delay="100" />
          </h1>
          <p v-reveal.300 class="t-lede max-w-md lg:col-span-4 lg:col-start-9">
            Biblical preaching that exalts Christ and proclaims the whole counsel of God.
          </p>
        </div>
        <div
          v-reveal="{ type: 'rule', delay: 200 }"
          class="mt-12 h-px bg-rule-strong md:mt-16"
        ></div>
      </div>
    </section>

    <div class="site-container pb-24 md:pb-32">
      <!-- Filter bar: text tabs and an underlined search -->
      <div
        class="mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between lg:gap-12"
      >
        <div class="min-w-0 border-b border-rule lg:flex-1">
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
            class="pointer-events-none absolute top-1/2 left-0 size-5 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search sermons…"
            class="field-input min-h-11 py-2 pl-8 text-base"
            aria-label="Search sermons"
          />
        </div>
      </div>

      <!-- The lead entry as a feature, the rest as a ruled index in the same order -->
      <div v-if="paginated.length">
        <article v-reveal class="group grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <NuxtLink
            :to="`/teachings/sermons/${paginated[0]!.slug}`"
            class="img-zoom relative block aspect-[4/3] bg-surface-sunken lg:col-span-7 lg:aspect-[16/10]"
            tabindex="-1"
            aria-hidden="true"
          >
            <img
              v-if="paginated[0]!.thumbnailSrc"
              :src="displayableImageUrl(paginated[0]!.thumbnailSrc)"
              :alt="paginated[0]!.title"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-end bg-primary p-8 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] text-on-night/35 italic"
            >
              {{ paginated[0]!.title }}
            </div>
          </NuxtLink>
          <div class="lg:col-span-5 lg:pt-2">
            <NuxtLink :to="`/teachings/sermons/${paginated[0]!.slug}`">
              <h2 class="t-h2 text-ink transition-colors duration-300 group-hover:text-primary-ink">
                {{ paginated[0]!.title }}
              </h2>
            </NuxtLink>
            <p class="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-ink-muted">
              <span>{{ paginated[0]!.preacher }}</span>
              <template v-if="paginated[0]!.date">
                <span aria-hidden="true" class="text-ink-subtle">/</span>
                <span class="num">{{ paginated[0]!.date }}</span>
              </template>
              <template v-if="paginated[0]!.tags.length">
                <span aria-hidden="true" class="text-ink-subtle">&middot;</span>
                <span class="text-ink-subtle">{{ paginated[0]!.tags.slice(0, 2).join(', ') }}</span>
              </template>
            </p>
            <NuxtLink
              :to="`/teachings/sermons/${paginated[0]!.slug}`"
              class="link-line mt-7 text-sm text-ink"
            >
              <span class="link-text">Read more</span>
              <Icon icon="mdi:arrow-right" class="link-arrow h-4 w-4" />
            </NuxtLink>
          </div>
        </article>

        <ol v-if="paginated.length > 1" class="mt-16 border-b border-rule md:mt-24">
          <li
            v-for="(sermon, i) in paginated.slice(1)"
            :key="sermon.id"
            v-reveal="{ delay: Math.min(i % 6, 5) * 60 }"
            class="border-t border-rule"
          >
            <NuxtLink
              :to="`/teachings/sermons/${sermon.slug}`"
              class="group grid grid-cols-[1fr_auto] items-center gap-x-5 gap-y-2 py-6 md:grid-cols-12 md:gap-x-8 md:py-8"
            >
              <span class="num hidden text-sm text-ink-muted md:col-span-2 md:block">
                {{ sermon.date }}
              </span>
              <span class="flex min-w-0 items-center gap-5 md:col-span-5">
                <span
                  class="img-zoom relative hidden aspect-[4/3] w-24 shrink-0 bg-surface-sunken sm:block"
                  aria-hidden="true"
                >
                  <img
                    v-if="sermon.thumbnailSrc"
                    :src="displayableImageUrl(sermon.thumbnailSrc)"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    class="h-full w-full object-cover"
                  />
                  <span v-else class="block h-full w-full bg-primary"></span>
                </span>
                <span
                  class="min-w-0 font-display text-[1.625rem] leading-[1.1] text-ink transition-colors duration-300 group-hover:text-primary-ink md:text-[2rem]"
                >
                  {{ sermon.title }}
                </span>
              </span>
              <span
                class="col-start-1 flex flex-wrap gap-x-2 text-sm text-ink-muted md:col-span-2 md:col-start-auto md:block"
              >
                <span>{{ sermon.preacher }}</span>
                <span v-if="sermon.date" class="text-ink-subtle md:hidden" aria-hidden="true"
                  >/</span
                >
                <span v-if="sermon.date" class="num md:hidden">{{ sermon.date }}</span>
                <span v-if="sermon.tags.length" class="text-ink-subtle md:hidden" aria-hidden="true"
                  >&middot;</span
                >
                <span v-if="sermon.tags.length" class="text-ink-subtle md:hidden">{{
                  sermon.tags.slice(0, 2).join(', ')
                }}</span>
              </span>
              <span class="hidden text-sm text-ink-subtle md:col-span-2 md:block">
                {{ sermon.tags.slice(0, 2).join(', ') }}
              </span>
              <span
                class="col-start-2 row-span-2 row-start-1 flex justify-end md:col-span-1 md:col-start-auto md:row-span-1 md:row-start-auto"
                aria-hidden="true"
              >
                <Icon
                  icon="mdi:arrow-right"
                  class="size-5 text-ink-subtle transition-[transform,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-primary-ink"
                />
              </span>
            </NuxtLink>
          </li>
        </ol>
      </div>
      <p
        v-else-if="store.loading && !store.loaded"
        class="t-label py-10 text-ink-subtle"
        role="status"
      >
        Loading sermons…
      </p>
      <EditorialNote
        v-else-if="store.error"
        title="Sermons could not be loaded"
        :description="store.error"
      />
      <EditorialNote
        v-else-if="store.sermons.length"
        title="No sermons match your search"
        description="Try a different filter or search term."
      />
      <EditorialNote
        v-else
        title="No sermons published yet"
        description="Sermons will appear here as they are published."
      />

      <!-- Load more -->
      <div v-if="hasMore" class="mt-14 flex justify-center">
        <button
          class="btn btn-outline min-h-14 w-full px-8 sm:w-auto"
          aria-label="Load more sermons"
          @click="loadMore"
        >
          Load More Sermons
          <Icon icon="mdi:arrow-down" class="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Closing invitation: the forest field -->
    <section class="field-forest section-tight">
      <div class="site-container grid gap-10 lg:grid-cols-12 lg:items-end">
        <h2 class="t-h1 text-on-night lg:col-span-7">
          <SplitReveal text="Want to Study the Bible?" />
        </h2>
        <div v-reveal.150 class="lg:col-span-4 lg:col-start-9">
          <p class="text-lg leading-relaxed text-on-night-muted">
            Our Sunday School lessons offer in-depth, structured Bible study for every level of
            maturity in the faith.
          </p>
          <NuxtLink
            to="/teachings/sunday-school"
            class="btn btn-light mt-8 min-h-14 px-7"
            aria-label="View Sunday School lessons"
          >
            View Sunday School Lessons
            <Icon icon="mdi:arrow-right" class="btn-arrow size-5" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
