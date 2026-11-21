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
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center [--c-focus:#f2c14e]"
        style="background: rgb(8 11 16 / 0.96)"
        role="dialog"
        aria-modal="true"
        aria-label="Photo gallery lightbox"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <!-- Close -->
        <button
          class="absolute top-3 right-3 z-10 inline-flex size-12 items-center justify-center rounded-md bg-white/10 text-white transition-colors duration-150 hover:bg-white/20 sm:top-5 sm:right-5"
          aria-label="Close gallery"
          @click="emit('close')"
        >
          <Icon icon="mdi:close" class="size-6" aria-hidden="true" />
        </button>

        <!-- Prev arrow -->
        <button
          class="absolute top-1/2 left-5 z-10 hidden size-14 -translate-y-1/2 items-center justify-center rounded-md bg-white/10 text-white transition-colors duration-150 hover:bg-white/20 sm:inline-flex"
          aria-label="Previous photo"
          @click="prev"
        >
          <Icon icon="mdi:chevron-left" class="size-8" aria-hidden="true" />
        </button>

        <!-- Image -->
        <Transition name="img-fade" mode="out-in">
          <img
            :key="currentIndex"
            :src="displayableImageUrl(images[currentIndex])"
            :alt="`Gallery item ${currentIndex + 1} of ${images.length}`"
            class="max-h-[82vh] max-w-[92vw] rounded-md object-contain shadow-xl sm:max-w-[80vw]"
            decoding="async"
          />
        </Transition>

        <!-- Next arrow -->
        <button
          class="absolute top-1/2 right-5 z-10 hidden size-14 -translate-y-1/2 items-center justify-center rounded-md bg-white/10 text-white transition-colors duration-150 hover:bg-white/20 sm:inline-flex"
          aria-label="Next photo"
          @click="next"
        >
          <Icon icon="mdi:chevron-right" class="size-8" aria-hidden="true" />
        </button>

        <!-- Counter -->
        <div
          class="num absolute bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-white/10 px-3.5 py-1.5 text-sm font-semibold tracking-wide text-white"
          aria-live="polite"
        >
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.2s var(--ease-out-quart);
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
.img-fade-enter-active,
.img-fade-leave-active {
  transition: opacity 0.15s ease;
}
.img-fade-enter-from,
.img-fade-leave-to {
  opacity: 0;
}
</style>
