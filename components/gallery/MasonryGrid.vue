<script setup lang="ts">
import type { GalleryImage } from '~/composables/useGalleryData'

defineProps<{
  images: GalleryImage[]
}>()

const emit = defineEmits<{ 'image-click': [index: number] }>()
</script>

<template>
  <div class="masonry-grid">
    <div
      v-for="(img, index) in images"
      :key="img.id"
      class="masonry-item group"
      role="button"
      tabindex="0"
      :aria-label="img.alt"
      @click="emit('image-click', index)"
      @keydown.enter="emit('image-click', index)"
    >
      <img
        :src="displayableImageUrl(img.src)"
        :alt="img.alt"
        loading="lazy"
        decoding="async"
        class="masonry-img"
      />
    </div>
  </div>
</template>

<style scoped>
.masonry-grid {
  column-count: 4;
  column-gap: 12px;
}

.masonry-item {
  display: inline-block;
  width: 100%;
  margin-bottom: 12px;
  break-inside: avoid;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  background: var(--c-surface-sunken);
}

.masonry-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  transition:
    transform 0.4s var(--ease-out-expo),
    filter 0.2s ease;
}

.masonry-item:hover .masonry-img,
.masonry-item:focus-visible .masonry-img {
  transform: scale(1.02);
  filter: brightness(0.92);
}

@media (max-width: 1023px) {
  .masonry-grid {
    column-count: 3;
  }
}

@media (max-width: 639px) {
  .masonry-grid {
    column-count: 2;
    column-gap: 8px;
  }

  .masonry-item {
    margin-bottom: 8px;
  }
}
</style>
