<script setup lang="ts">
definePageMeta({
  layout: 'default',
  pageTransition: { name: 'fade', mode: 'out-in' },
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
  <div class="min-h-screen bg-surface pb-16 md:pb-24">
    <!-- Page header -->
    <div class="border-b border-rule bg-canvas py-10 md:py-14">
      <div class="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div class="margin-rule">
          <div class="mb-3 flex items-center gap-1.5 text-sm font-medium text-ink-subtle">
            <NuxtLink
              to="/"
              class="rounded-sm transition-colors duration-150 hover:text-primary-ink hover:underline"
              >Home</NuxtLink
            >
            <Icon icon="mdi:chevron-right" class="size-4" aria-hidden="true" />
            <span class="text-ink-muted">Events</span>
          </div>
          <h1
            class="font-display text-[1.875rem] leading-[1.15] font-bold text-secondary md:text-[2.5rem]"
          >
            Events
          </h1>
          <p class="mt-3 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Explore upcoming gatherings and revisit our past programmes.
          </p>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <!-- Tab toggle -->
      <div class="flex justify-center py-8 md:justify-start">
        <EventTabToggle v-model="activeTab" />
      </div>

      <!-- ─── UPCOMING EVENTS ─── -->
      <Transition name="tab-switch" mode="out-in">
        <div
          v-if="activeTab === 'upcoming'"
          key="upcoming"
          class="flex flex-col gap-8 md:flex-row md:gap-0"
        >
          <!-- Left: preview panel (45%) -->
          <div class="w-full md:w-[45%] md:pr-8">
            <UpcomingPreviewPanel />
          </div>

          <!-- Right: event list (55%) -->
          <div class="w-full md:w-[55%] md:border-l md:border-rule md:pl-8">
            <UpcomingEventList />
          </div>
        </div>

        <!-- ─── PAST EVENTS ─── -->
        <div v-else key="past" class="flex flex-col gap-8 md:flex-row md:gap-0">
          <!-- Left: featured card (45%) -->
          <div class="w-full md:w-[45%] md:pr-8">
            <PastEventFeatured />
          </div>

          <!-- Right: past event list (55%) -->
          <div class="w-full md:w-[55%] md:border-l md:border-rule md:pl-8">
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
    opacity 0.2s var(--ease-out-quart),
    transform 0.2s var(--ease-out-quart);
}
.tab-switch-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.tab-switch-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
