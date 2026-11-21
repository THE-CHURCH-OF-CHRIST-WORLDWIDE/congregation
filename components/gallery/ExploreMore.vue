<script setup lang="ts">
const route = useRoute()
const { galleries } = useGalleryData('')

/**
 * Every category except the one being viewed. The tile art is the category's
 * first photo, so tiles show a real image or a neutral placeholder block —
 * never a stock image standing in for church content.
 */
const categories = computed(() =>
  Object.entries(galleries)
    .filter(([slug]) => slug !== route.params.category)
    .map(([slug, gallery]) => ({
      slug,
      label: gallery.title,
      src: gallery.images[0]?.src ?? '',
    }))
)
</script>

<template>
  <div class="border-t border-rule bg-surface-muted">
    <div class="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
      <h2 class="mb-6 font-display text-2xl leading-tight font-bold text-secondary md:text-3xl">
        Explore More Images
      </h2>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/gallery/${cat.slug}`"
          class="explore-card group"
          :aria-label="`${cat.label} gallery`"
        >
          <img
            v-if="cat.src"
            :src="displayableImageUrl(cat.src)"
            :alt="cat.label"
            class="explore-img absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div v-else class="absolute inset-0 bg-surface-sunken"></div>
          <div class="explore-overlay group-hover:bg-black/15"></div>
          <span class="explore-label">{{ cat.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.explore-card {
  position: relative;
  aspect-ratio: 3 / 2;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  display: block;
  text-decoration: none;
  background: var(--c-surface-sunken);
}

.explore-img {
  transition: transform 0.4s var(--ease-out-expo);
}

.explore-card:hover .explore-img,
.explore-card:focus-visible .explore-img {
  transform: scale(1.03);
}

.explore-overlay {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(to top, rgb(14 20 28 / 0.75), rgb(14 20 28 / 0.1) 60%);
  z-index: 1;
  transition: background-color 0.2s ease;
}

.explore-label {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 2;
  padding: 12px 14px;
  color: white;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
  text-shadow: 0 1px 3px rgb(0 0 0 / 0.4);
}
</style>
