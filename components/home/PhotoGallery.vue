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
  <section ref="sectionRef" class="bg-[#F8F9FA] py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div :class="['mb-8 flex items-end justify-between', 'reveal', isVisible && 'is-visible']">
        <SectionHeader
          title="Photo Gallery"
          subtitle="Moments from our worship, fellowship, and community life."
        />
        <NuxtLink
          to="/gallery/sunday-service"
          class="hidden shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline sm:flex"
          aria-label="View full gallery"
        >
          View Full Gallery
          <Icon icon="heroicons:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>

      <div class="columns-1 gap-4 sm:columns-2 lg:columns-4">
        <div
          v-for="(photo, i) in photos"
          :key="photo.id"
          :class="[
            'relative mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-xl group',
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
            :src="photo.src"
            :alt="photo.alt"
            loading="lazy"
            class="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            class="absolute inset-0 rounded-xl bg-black/0 transition-colors group-hover:bg-black/20"
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
            class="absolute right-4 top-4 rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
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
