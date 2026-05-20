<script setup lang="ts">
definePageMeta({
  layout: 'default',
  pageTransition: { name: 'fade', mode: 'out-in' },
})

const route = useRoute()
const slug = computed(() => route.params.category as string)

const { gallery } = useGalleryData(slug.value)

if (!gallery) {
  await navigateTo('/404')
}

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
  <div v-if="gallery" class="w-full bg-white">
    <!-- 1. Hero -->
    <GalleryHero :category-title="gallery.title" :preview-images="previewImages" />

    <!-- 2. Masonry gallery -->
    <section class="px-8 py-10">
      <h2 class="mb-5 text-[20px] font-bold text-gray-900">{{ gallery.title }}</h2>
      <MasonryGrid :images="gallery.images" @image-click="openLightbox" />
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
</template>

<style scoped>
.the-end-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 32px 32px;
  max-width: 500px;
  margin: 0 auto;
}

.the-end-divider hr {
  flex: 1;
  border: none;
  border-top: 1px solid #e5e7eb;
}

.the-end-divider span {
  font-size: 13px;
  color: #9ca3af;
  white-space: nowrap;
  font-style: italic;
}
</style>
