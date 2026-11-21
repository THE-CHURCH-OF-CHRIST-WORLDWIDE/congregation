<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  images: string[]
  startIndex: number
}>()

const emit = defineEmits<{ close: [] }>()

const currentIndex = ref(props.startIndex)

watch(
  () => props.startIndex,
  (val) => {
    currentIndex.value = val
  }
)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      currentIndex.value = props.startIndex
      document.addEventListener('keydown', onKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }
)

function prev() {
  currentIndex.value = currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1
}

function next() {
  currentIndex.value = currentIndex.value === props.images.length - 1 ? 0 : currentIndex.value + 1
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'Escape') emit('close')
}

let touchStartX = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0]?.clientX ?? 0
}
function onTouchEnd(e: TouchEvent) {
  const delta = touchStartX - (e.changedTouches[0]?.clientX ?? 0)
  if (Math.abs(delta) > 50) {
    if (delta > 0) next()
    else prev()
  }
}

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <!-- The viewing room: a dark, quiet field with nothing but the photograph -->
      <div
        v-if="isOpen"
        class="field-night fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-night/[0.97]"
        role="dialog"
        aria-modal="true"
        aria-label="Photo gallery lightbox"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <!-- Close -->
        <button
          class="absolute top-3 right-3 z-10 inline-flex min-h-12 items-center gap-3 px-3 text-on-night-muted transition-colors duration-300 hover:text-champagne sm:top-6 sm:right-6"
          aria-label="Close gallery"
          @click="emit('close')"
        >
          <span class="t-label hidden sm:inline" aria-hidden="true">Close</span>
          <span
            class="inline-flex size-11 items-center justify-center rounded-full border border-on-night/25 transition-colors duration-300"
          >
            <Icon icon="mdi:close" class="size-5" aria-hidden="true" />
          </span>
        </button>

        <!-- Prev arrow -->
        <button
          class="absolute top-1/2 left-6 z-10 hidden size-14 -translate-y-1/2 items-center justify-center rounded-full border border-on-night/25 text-on-night transition-colors duration-300 hover:border-champagne hover:text-champagne sm:inline-flex"
          aria-label="Previous photo"
          @click="prev"
        >
          <Icon icon="mdi:arrow-left" class="size-6" aria-hidden="true" />
        </button>

        <!-- Image -->
        <Transition name="img-fade" mode="out-in">
          <img
            :key="currentIndex"
            :src="displayableImageUrl(images[currentIndex])"
            :alt="`Gallery item ${currentIndex + 1} of ${images.length}`"
            class="max-h-[78vh] max-w-[92vw] object-contain sm:max-w-[78vw]"
            decoding="async"
          />
        </Transition>

        <!-- Next arrow -->
        <button
          class="absolute top-1/2 right-6 z-10 hidden size-14 -translate-y-1/2 items-center justify-center rounded-full border border-on-night/25 text-on-night transition-colors duration-300 hover:border-champagne hover:text-champagne sm:inline-flex"
          aria-label="Next photo"
          @click="next"
        >
          <Icon icon="mdi:arrow-right" class="size-6" aria-hidden="true" />
        </button>

        <!-- Counter: a serif caption beneath the frame -->
        <div
          class="num absolute bottom-6 left-1/2 flex -translate-x-1/2 items-baseline gap-3 font-display text-xl whitespace-nowrap text-on-night-muted italic sm:bottom-8"
          aria-live="polite"
        >
          <span class="text-on-night">{{ currentIndex + 1 }}</span>
          <span class="h-px w-8 self-center bg-champagne/60" aria-hidden="true"></span>
          <span class="sr-only">of</span>
          <span>{{ images.length }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.45s var(--ease-out-quart);
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
.img-fade-enter-active,
.img-fade-leave-active {
  transition:
    opacity 0.35s var(--ease-out-quart),
    transform 0.6s var(--ease-out-expo);
}
.img-fade-enter-from {
  opacity: 0;
  transform: scale(0.985);
}
.img-fade-leave-to {
  opacity: 0;
}
</style>
