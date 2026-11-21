<script setup lang="ts">
definePageMeta({
  layout: 'default',
  pageTransition: { name: 'fade', mode: 'out-in' },
})

const route = useRoute()
const slug = computed(() => route.params.category as string)

const { gallery } = useGalleryData(slug.value)

// An unknown slug used to redirect to /404, but no such route (or error.vue)
// exists, so the page hung on a navigation that never resolved. Render the
// not-found state below instead — same outcome for the reader, no dead end.

useSeoMeta({
  title: `${gallery?.title ?? 'Gallery'} — Church of Christ`,
  description: `Browse the ${gallery?.title} gallery at Church of Christ, Ikot Ekpene.`,
})

// Preview thumbnails for hero (first 2 images)
const previewImages = computed(() => (gallery?.images ?? []).slice(0, 2).map((i) => i.src))

// Lightbox
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const lightboxImages = computed(() => (gallery?.images ?? []).map((i) => i.src))

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}
</script>

<template>
  <div v-if="gallery" class="w-full bg-surface">
    <!-- 1. Hero -->
    <GalleryHero :category-title="gallery.title" :preview-images="previewImages" />

    <!-- 2. Masonry gallery -->
    <section class="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
      <h2 class="mb-6 font-display text-2xl leading-tight font-bold text-secondary md:text-3xl">
        {{ gallery.title }}
      </h2>
      <EmptyState
        v-if="!gallery.images.length"
        icon="mdi:image-multiple-outline"
        title="No photos in this gallery yet"
        description="Photographs from this category will appear here once they are uploaded."
      />
      <MasonryGrid v-else :images="gallery.images" @image-click="openLightbox" />
    </section>

    <!-- 3. "The End" divider -->
    <div class="the-end-divider">
      <hr />
      <span>— The End —</span>
      <hr />
    </div>

    <!-- 4. Explore more -->
    <ExploreMore />

    <!-- Lightbox -->
    <GalleryLightbox
      :is-open="lightboxOpen"
      :images="lightboxImages"
      :start-index="lightboxIndex"
      @close="lightboxOpen = false"
    />
  </div>

  <!-- Unknown category: navigateTo('/404') is async, so render a placeholder
       rather than a blank document while the redirect resolves. -->
  <div v-else class="mx-auto max-w-3xl px-5 py-24 sm:px-6">
    <EmptyState
      icon="mdi:image-off-outline"
      title="Gallery not found"
      description="That gallery category does not exist."
    >
      <template #action>
        <NuxtLink to="/">
          <Button variant="secondary" size="sm">Back to Home</Button>
        </NuxtLink>
      </template>
    </EmptyState>
  </div>
</template>

<style scoped>
.the-end-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px 40px;
  max-width: 500px;
  margin: 0 auto;
}

.the-end-divider hr {
  flex: 1;
  border: none;
  border-top: 1px solid var(--c-rule);
}

.the-end-divider span {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--c-ink-subtle);
  white-space: nowrap;
  font-style: italic;
}
</style>
