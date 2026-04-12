<script setup lang="ts">
const photos = [
  { id: 1, src: 'https://picsum.photos/seed/gallery1/600/800', alt: 'Church congregation gathered for worship' },
  { id: 2, src: 'https://picsum.photos/seed/gallery2/800/500', alt: 'Sunday morning worship service' },
  { id: 3, src: 'https://picsum.photos/seed/gallery3/600/600', alt: 'Bible study session' },
  { id: 4, src: 'https://picsum.photos/seed/gallery4/800/600', alt: 'Youth convention gathering' },
  { id: 5, src: 'https://picsum.photos/seed/gallery5/600/700', alt: 'Baptism ceremony' },
  { id: 6, src: 'https://picsum.photos/seed/gallery6/800/450', alt: 'Church choir performance' },
  { id: 7, src: 'https://picsum.photos/seed/gallery7/600/600', alt: 'Community outreach event' },
  { id: 8, src: 'https://picsum.photos/seed/gallery8/800/500', alt: 'Congregation fellowship' },
]

const selectedPhoto = ref<typeof photos[0] | null>(null)

function openLightbox(photo: typeof photos[0]) {
  selectedPhoto.value = photo
}

function closeLightbox() {
  selectedPhoto.value = null
}

// Close on Escape key
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
  }
  window.addEventListener('keydown', handler)
  onBeforeUnmount(() => window.removeEventListener('keydown', handler))
})
</script>

<template>
  <section class="bg-[#F8F9FA] py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeader title="Photo Gallery" subtitle="Moments from our worship, fellowship, and community life." centered />

      <!-- Masonry-style grid -->
      <div class="columns-1 gap-4 sm:columns-2 lg:columns-4">
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-xl group"
          :aria-label="`View photo: ${photo.alt}`"
          role="button"
          tabindex="0"
          @click="openLightbox(photo)"
          @keydown.enter="openLightbox(photo)"
        >
          <img
            :src="photo.src"
            :alt="photo.alt"
            loading="lazy"
            class="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" ></div>
        </div>
      </div>
    </div>

    <!-- Lightbox (teleported to body) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedPhoto"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          aria-modal="true"
          role="dialog"
          :aria-label="selectedPhoto.alt"
          @click.self="closeLightbox"
        >
          <button
            class="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
            aria-label="Close lightbox"
            @click="closeLightbox"
          >
            <Icon icon="heroicons:x-mark" class="h-7 w-7" />
          </button>
          <img
            :src="selectedPhoto.src"
            :alt="selectedPhoto.alt"
            class="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
          <p class="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/50">
            {{ selectedPhoto.alt }}
          </p>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
