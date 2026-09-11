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
  <div class="px-8 pb-14">
    <h2 class="mb-5 text-[22px] font-bold text-gray-900">Explore More Images</h2>

    <div class="grid grid-cols-3 gap-4 sm:grid-cols-3">
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
          class="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div v-else class="absolute inset-0 bg-gray-200"></div>
        <div class="explore-overlay group-hover:bg-black/60"></div>
        <span class="explore-label">{{ cat.label }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.explore-card {
  position: relative;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  display: block;
  text-decoration: none;
}

.explore-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
  transition: background 0.2s ease;
}

.explore-label {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 15px;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

@media (max-width: 480px) {
  .explore-card {
    height: 80px;
  }
}
</style>
