<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const photos = computed(() => s.settings.galleryPhotos)

const selectedPhoto = ref<{ id: string; src: string; alt: string } | null>(null)

// The strip scrolls sideways; the arrow buttons move it by most of a screen.
const strip = ref<HTMLElement | null>(null)
function nudge(dir: 1 | -1) {
  const el = strip.value
  if (!el) return
  el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: 'smooth' })
}

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
  <section class="section overflow-hidden bg-surface">
    <div class="site-container">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          class="mb-0! md:mb-0!"
          title="Photo Gallery"
          subtitle="Moments from our worship, fellowship, and community life."
        />
        <div v-reveal.200 class="flex items-center gap-6">
          <NuxtLink
            to="/gallery/sunday-service"
            class="link-line text-base text-ink"
            aria-label="View full gallery"
          >
            <span class="link-text">View Full Gallery</span>
            <Icon icon="mdi:arrow-right" class="link-arrow h-5 w-5" />
          </NuxtLink>
          <div v-if="photos.length > 1" class="hidden gap-2 md:flex">
            <button
              class="flex size-12 items-center justify-center rounded-full border border-rule-strong text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-surface"
              aria-label="Scroll gallery back"
              @click="nudge(-1)"
            >
              <Icon icon="mdi:arrow-left" class="h-5 w-5" />
            </button>
            <button
              class="flex size-12 items-center justify-center rounded-full border border-rule-strong text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-surface"
              aria-label="Scroll gallery forward"
              @click="nudge(1)"
            >
              <Icon icon="mdi:arrow-right" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-14 md:mt-20">
      <div class="site-container">
        <LoadingState v-if="s.loading" title="Loading photos…" />
        <EditorialNote
          v-else-if="!photos.length"
          title="No photos yet"
          description="Photographs from our services and gatherings will appear here soon."
        />
      </div>

      <!-- A horizontal contact sheet: frames of varied height, snapping as it scrolls -->
      <div
        v-if="!s.loading && photos.length"
        ref="strip"
        class="no-scrollbar flex snap-x snap-mandatory items-end gap-4 overflow-x-auto scroll-px-[var(--site-gutter)] px-[var(--site-gutter)] pb-2 md:gap-6"
      >
        <div
          v-for="(photo, i) in photos"
          :key="photo.id"
          v-reveal="{ type: 'unveil', delay: Math.min(i, 5) * 90 }"
          class="group relative shrink-0 cursor-pointer snap-start overflow-hidden bg-surface-sunken"
          :class="
            i % 3 === 0
              ? 'h-[22rem] sm:h-[30rem]'
              : i % 3 === 1
                ? 'h-[17rem] sm:h-[23rem]'
                : 'h-[19.5rem] sm:h-[26rem]'
          "
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
            class="h-full w-auto max-w-[85vw] min-w-[14rem] object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
          <p
            class="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-night/75 to-transparent px-5 pt-10 pb-4 text-sm text-on-night transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
            aria-hidden="true"
          >
            {{ photo.alt }}
          </p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedPhoto"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-night/95 p-4 sm:p-10"
          aria-modal="true"
          :aria-label="selectedPhoto.alt"
          @click.self="closeLightbox"
        >
          <button
            class="absolute top-4 right-4 inline-flex size-12 items-center justify-center rounded-full border border-on-night/25 text-on-night transition-colors duration-300 hover:border-champagne hover:text-champagne"
            aria-label="Close lightbox"
            @click="closeLightbox"
          >
            <Icon icon="mdi:close" class="h-6 w-6" />
          </button>
          <img
            :src="displayableImageUrl(selectedPhoto.src)"
            :alt="selectedPhoto.alt"
            class="max-h-[82vh] max-w-full object-contain"
          />
          <p
            class="absolute bottom-6 left-1/2 max-w-[90vw] -translate-x-1/2 text-center font-display text-lg text-on-night-muted italic"
          >
            {{ selectedPhoto.alt }}
          </p>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
