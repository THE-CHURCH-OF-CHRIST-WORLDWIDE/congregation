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
  ogDescription:
    'Browse upcoming and past events at the Church of Christ, Ekot Ekpene.',
})

const route = useRoute()
const eventsStore = useEventsStore()

// Sync URL → store on mount
onMounted(() => {
  const tab = route.query.tab as string
  if (tab === 'past' || tab === 'upcoming') {
    eventsStore.setTab(tab)
  }
})

// Sync store → URL (replace so no new history entry)
watch(
  () => eventsStore.activeTab,
  async tab => {
    await navigateTo({ query: { tab } }, { replace: true })
  },
)

const activeTab = computed({
  get: () => eventsStore.activeTab,
  set: (v: 'upcoming' | 'past') => eventsStore.setTab(v),
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <!-- Page header -->
    <div class="bg-white border-b border-gray-100 py-8">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-1 flex items-center gap-2 text-xs font-medium text-gray-400">
          <NuxtLink to="/" class="hover:text-blue-600 transition-colors">Home</NuxtLink>
          <Icon icon="mdi:chevron-right" class="h-3.5 w-3.5" />
          <span class="text-gray-600">Events</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">Events</h1>
        <p class="mt-1 text-sm text-gray-500">
          Explore upcoming gatherings and revisit our past programmes.
        </p>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Tab toggle -->
      <div class="flex justify-center py-6 md:justify-start">
        <EventTabToggle v-model="activeTab" />
      </div>

      <!-- ─── UPCOMING EVENTS ─── -->
      <Transition name="tab-switch" mode="out-in">
        <div
          v-if="activeTab === 'upcoming'"
          key="upcoming"
          class="flex flex-col gap-4 md:flex-row md:gap-0"
        >
          <!-- Left: preview panel (45%) -->
          <div class="w-full md:w-[45%] md:pr-6">
            <UpcomingPreviewPanel />
          </div>

          <!-- Right: event list (55%) -->
          <div class="w-full md:w-[55%] md:border-l md:border-gray-100 md:pl-6">
            <UpcomingEventList />
          </div>
        </div>

        <!-- ─── PAST EVENTS ─── -->
        <div
          v-else
          key="past"
          class="flex flex-col gap-4 md:flex-row md:gap-0"
        >
          <!-- Left: featured card (45%) -->
          <div class="w-full md:w-[45%] md:pr-6">
            <PastEventFeatured />
          </div>

          <!-- Right: past event list (55%) -->
          <div class="w-full md:w-[55%] md:border-l md:border-gray-100 md:pl-6">
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
  transition: opacity 0.2s ease, transform 0.2s ease;
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
