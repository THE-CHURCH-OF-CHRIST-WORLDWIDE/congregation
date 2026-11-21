<script setup lang="ts">
// No page-level `mode: 'out-in'` here: it races Nuxt's Suspense page resolution (see the note
// in nuxt.config.ts) and left this page blank when navigated to from another route.
definePageMeta({
  layout: 'default',
  navOverlay: true,
})

const route = useRoute()
const slug = computed(() => route.params.category as string)

const { gallery, galleries, loading: galleryLoading } = useGalleryData(() => slug.value)

// An unknown slug used to redirect to /404, but no such route (or error.vue)
// exists, so the page hung on a navigation that never resolved. Render the
// not-found state below instead — same outcome for the reader, no dead end.

useSeoMeta({
  title: () => `${gallery.value?.title ?? 'Gallery'} — Church of Christ`,
  description: () => `Browse the ${gallery.value?.title} gallery at Church of Christ, Ikot Ekpene.`,
})

// Preview thumbnails for hero (first 2 images)
const previewImages = computed(() => (gallery.value?.images ?? []).slice(0, 2).map((i) => i.src))

// Lightbox
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const lightboxImages = computed(() => (gallery.value?.images ?? []).map((i) => i.src))

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}
</script>

<template>
  <div v-if="gallery" class="w-full bg-surface">
    <!-- 1. Hero -->
    <GalleryHero :category-title="gallery.title" :preview-images="previewImages" />

    <!-- Category switching: quiet text tabs, the current room marked by a bronze hairline -->
    <nav class="border-b border-rule bg-surface" aria-label="Gallery categories">
      <div class="site-container">
        <ul class="no-scrollbar -mb-px flex gap-8 overflow-x-auto sm:gap-10">
          <li v-for="(g, key) in galleries" :key="key" class="shrink-0">
            <NuxtLink
              :to="`/gallery/${key}`"
              class="relative inline-flex min-h-16 items-center text-[0.9375rem] font-semibold whitespace-nowrap transition-colors duration-300 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)]"
              :class="
                key === slug
                  ? 'text-ink after:scale-x-100 after:bg-accent'
                  : 'text-ink-subtle after:scale-x-0 after:bg-ink-subtle hover:text-ink hover:after:scale-x-100'
              "
              :aria-current="key === slug ? 'page' : undefined"
            >
              {{ g.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- 2. Masonry gallery -->
    <section class="section-tight">
      <div class="site-container">
        <div
          class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2"
          :class="gallery.images.length ? 'mb-10 border-b border-rule pb-5 md:mb-14' : 'mb-4'"
        >
          <h2 class="t-h3 text-secondary">
            {{ gallery.title }}
          </h2>
          <p v-if="gallery.images.length" class="stamp num">
            {{ gallery.images.length }}
            {{ gallery.images.length === 1 ? 'photograph' : 'photographs' }}
          </p>
        </div>
        <p
          v-if="!gallery.images.length && galleryLoading"
          class="t-label py-10 text-ink-subtle"
          role="status"
        >
          Loading photographs…
        </p>
        <EditorialNote
          v-else-if="!gallery.images.length"
          title="No photos in this gallery yet"
          description="Photographs from this category will appear here once they are uploaded."
        />
        <MasonryGrid v-else :images="gallery.images" @image-click="openLightbox" />
      </div>
    </section>

    <!-- 3. "The End" divider -->
    <div class="site-container flex items-center gap-6 pb-16 md:pb-24" aria-hidden="true">
      <span v-reveal="'rule'" class="h-px flex-1 bg-rule"></span>
      <span class="font-display text-lg whitespace-nowrap text-ink-subtle italic">— The End —</span>
      <span v-reveal="'rule'" class="h-px flex-1 bg-rule"></span>
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
  <div v-else class="field-night min-h-[70svh] pt-[calc(var(--nav-h)+4rem)] pb-24">
    <div class="site-container max-w-3xl">
      <h1 class="t-h1 text-on-night">Gallery not found</h1>
      <p class="t-lede mt-5 text-on-night-muted">That gallery category does not exist.</p>
      <NuxtLink to="/" class="btn btn-light mt-10 min-h-14 px-7">
        Back to Home
        <Icon icon="mdi:arrow-right" class="btn-arrow h-5 w-5" />
      </NuxtLink>
    </div>
  </div>
</template>
