<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Events — Church of Christ',
  description:
    'Upcoming and past church events including Bible studies, gospel meetings, and special seminars.',
  ogTitle: 'Events — Church of Christ',
  ogDescription: 'Browse upcoming and past events at the Church of Christ, Ekot Ekpene.',
})

const route = useRoute()
const eventsStore = useEventsStore()

// Sync URL → store on mount
onMounted(() => {
  eventsStore.load()
  const tab = route.query.tab as string
  if (tab === 'past' || tab === 'upcoming') {
    eventsStore.setTab(tab)
  }
})

// Sync store → URL (replace so no new history entry)
watch(
  () => eventsStore.activeTab,
  async (tab) => {
    await navigateTo({ query: { tab } }, { replace: true })
  }
)

const activeTab = computed({
  get: () => eventsStore.activeTab,
  set: (v: 'upcoming' | 'past') => eventsStore.setTab(v),
})
</script>

<template>
  <div class="min-h-screen bg-surface pb-24 md:pb-32">
    <!-- Page header: an editorial title page on ivory -->
    <header class="site-container pt-14 sm:pt-20 lg:pt-24">
      <nav aria-label="Breadcrumb" class="t-label flex items-center gap-2 text-ink-subtle">
        <NuxtLink to="/" class="rounded-sm transition-colors duration-300 hover:text-ink"
          >Home</NuxtLink
        >
        <Icon icon="mdi:chevron-right" class="size-3.5" aria-hidden="true" />
        <span class="text-ink-muted">Events</span>
      </nav>

      <div class="mt-8 grid gap-8 pb-12 md:grid-cols-12 md:items-end md:pb-16 lg:mt-10">
        <h1 class="t-display text-secondary md:col-span-7">
          <SplitReveal text="Events" immediate :delay="150" />
        </h1>
        <p
          class="hero-animate t-lede max-w-[34ch] md:col-span-4 md:col-start-9 md:pb-3"
          style="animation-delay: 450ms"
        >
          Explore upcoming gatherings and revisit our past programmes.
        </p>
      </div>
      <div v-reveal="'rule'" class="h-px bg-ink/80" aria-hidden="true"></div>
    </header>

    <div class="site-container">
      <!-- Tab toggle -->
      <div class="pt-10 pb-12 md:pt-12 md:pb-16">
        <EventTabToggle v-model="activeTab" />
      </div>

      <!-- ─── UPCOMING EVENTS ─── -->
      <Transition name="tab-switch" mode="out-in">
        <div
          v-if="activeTab === 'upcoming'"
          key="upcoming"
          class="grid gap-12 lg:grid-cols-12 lg:gap-8"
        >
          <!-- Left: preview panel -->
          <div class="min-w-0 lg:col-span-5">
            <div class="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
              <UpcomingPreviewPanel />
            </div>
          </div>

          <!-- Right: event list -->
          <div class="min-w-0 lg:col-span-7">
            <UpcomingEventList />
          </div>
        </div>

        <!-- ─── PAST EVENTS ─── -->
        <div v-else key="past" class="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <!-- Left: featured card -->
          <div class="min-w-0 lg:col-span-5">
            <div class="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
              <PastEventFeatured />
            </div>
          </div>

          <!-- Right: past event list -->
          <div class="min-w-0 lg:col-span-7">
            <PastEventList />
          </div>
        </div>
      </Transition>
    </div>

    <!-- Gallery lightbox — always in DOM, controlled via isOpen prop -->
    <GalleryLightbox
      :is-open="eventsStore.galleryOpen"
      :images="eventsStore.galleryImages"
      :start-index="eventsStore.galleryStartIndex"
      @close="eventsStore.closeGallery()"
    />
  </div>
</template>

<style scoped>
.tab-switch-enter-active,
.tab-switch-leave-active {
  transition:
    opacity 0.45s var(--ease-out-expo),
    transform 0.45s var(--ease-out-expo);
}
.tab-switch-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.tab-switch-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
