<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const photos = computed(() => s.settings.galleryPhotos)

const selectedPhoto = ref<{ id: string; src: string; alt: string } | null>(null)

const { el: sectionRef, isVisible } = useScrollReveal({ threshold: 0.05 })

function openLightbox(photo: { id: string; src: string; alt: string }) {
  selectedPhoto.value = photo
}

function closeLightbox() {
  selectedPhoto.value = null
}

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
  }
  window.addEventListener('keydown', handler)
  onBeforeUnmount(() => window.removeEventListener('keydown', handler))
})
</script>

<template>
  <section ref="sectionRef" class="bg-canvas py-16 md:py-24">
    <div class="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <div
        :class="[
          'mb-10 flex items-end justify-between gap-6 md:mb-12',
          'reveal',
          isVisible && 'is-visible',
        ]"
      >
        <SectionHeader
          class="mb-0! md:mb-0!"
          title="Photo Gallery"
          subtitle="Moments from our worship, fellowship, and community life."
        />
        <NuxtLink
          to="/gallery/sunday-service"
          class="hidden min-h-11 shrink-0 items-center gap-1.5 text-base font-semibold text-primary-ink underline-offset-3 hover:text-primary-hover hover:underline sm:flex"
          aria-label="View full gallery"
        >
          View Full Gallery
          <Icon icon="mdi:arrow-right" class="h-5 w-5" />
        </NuxtLink>
      </div>

      <LoadingState v-if="s.loading" title="Loading photos…" />
      <EmptyState
        v-else-if="!photos.length"
        icon="mdi:image-multiple-outline"
        title="No photos yet"
        description="Photographs from our services and gatherings will appear here soon."
      />

      <div v-else class="columns-1 gap-4 sm:columns-2 lg:columns-4">
        <div
          v-for="(photo, i) in photos"
          :key="photo.id"
          :class="[
            'group relative mb-4 cursor-pointer break-inside-avoid overflow-hidden rounded-lg border border-rule bg-surface-sunken',
            'reveal-scale',
            isVisible && 'is-visible',
          ]"
          :style="{ transitionDelay: `${100 + Math.min(i, 7) * 60}ms` }"
          :aria-label="`View image: ${photo.alt}`"
          role="button"
          tabindex="0"
          @click="openLightbox(photo)"
          @keydown.enter="openLightbox(photo)"
        >
          <img
            :src="displayableImageUrl(photo.src)"
            :alt="photo.alt"
            loading="lazy"
            decoding="async"
            class="w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          />
          <div
            class="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/15"
          ></div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedPhoto"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          aria-modal="true"
          :aria-label="selectedPhoto.alt"
          @click.self="closeLightbox"
        >
          <button
            class="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-md text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white"
            aria-label="Close lightbox"
            @click="closeLightbox"
          >
            <Icon icon="mdi:close" class="h-7 w-7" />
          </button>
          <img
            :src="displayableImageUrl(selectedPhoto.src)"
            :alt="selectedPhoto.alt"
            class="max-h-[85vh] max-w-full rounded-md object-contain shadow-xl"
          />
          <p
            class="absolute bottom-6 left-1/2 max-w-[90vw] -translate-x-1/2 text-center text-base text-white/80"
          >
            {{ selectedPhoto.alt }}
          </p>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
