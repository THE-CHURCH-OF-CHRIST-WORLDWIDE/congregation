<script setup lang="ts">
import type { GalleryImage } from '~/composables/useGalleryData'

defineProps<{
  images: GalleryImage[]
}>()

const emit = defineEmits<{ 'image-click': [index: number] }>()
</script>

<template>
  <!-- A curated wall: frames hung in columns, each opening as it comes into view -->
  <div class="columns-2 gap-3 sm:gap-5 lg:columns-3 lg:gap-6 xl:columns-4">
    <div
      v-for="(img, index) in images"
      :key="img.id"
      v-reveal="{ type: 'unveil', delay: (index % 4) * 90 }"
      class="group relative mb-3 inline-block w-full cursor-pointer break-inside-avoid overflow-hidden bg-surface-sunken sm:mb-5 lg:mb-6"
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
        class="block h-auto w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045] group-focus-visible:scale-[1.045]"
      />
      <p
        class="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-night/75 to-transparent px-4 pt-10 pb-3 font-display text-base leading-snug text-on-night italic transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0 sm:text-lg"
        aria-hidden="true"
      >
        {{ img.alt }}
      </p>
    </div>
  </div>
</template>
