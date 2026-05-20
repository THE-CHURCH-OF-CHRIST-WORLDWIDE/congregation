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
        :src="img.src"
        :alt="img.alt"
        loading="lazy"
        class="masonry-img"
      />
    </div>
  </div>
</template>

<style scoped>
.masonry-grid {
  column-count: 4;
  column-gap: 8px;
}

.masonry-item {
  display: inline-block;
  width: 100%;
  margin-bottom: 8px;
  break-inside: avoid;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}

.masonry-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.masonry-item:hover .masonry-img {
  transform: scale(1.02);
  filter: brightness(0.9);
}

@media (max-width: 1023px) {
  .masonry-grid { column-count: 3; }
}

@media (max-width: 639px) {
  .masonry-grid { column-count: 2; }
}
</style>
