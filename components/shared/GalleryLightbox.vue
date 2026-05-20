<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  images: string[]
  startIndex: number
}>()

const emit = defineEmits<{ close: [] }>()

const currentIndex = ref(props.startIndex)

watch(() => props.startIndex, val => { currentIndex.value = val })

watch(() => props.isOpen, open => {
  if (open) {
    currentIndex.value = props.startIndex
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKeyDown)
    document.body.style.overflow = ''
  }
})

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
function onTouchStart(e: TouchEvent) { touchStartX = e.changedTouches[0]?.clientX ?? 0 }
function onTouchEnd(e: TouchEvent) {
  const delta = touchStartX - (e.changedTouches[0]?.clientX ?? 0)
  if (Math.abs(delta) > 50) { if (delta > 0) next(); else prev() }
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
        class="fixed inset-0 z-[9999] flex items-center justify-center"
        style="background: rgba(0,0,0,0.94);"
        role="dialog"
        aria-modal="true"
        aria-label="Photo gallery lightbox"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <!-- Close -->
        <button
          class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          aria-label="Close gallery"
          @click="emit('close')"
        >
          <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>

        <!-- Prev arrow -->
        <button
          class="absolute left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 sm:flex"
          aria-label="Previous photo"
          @click="prev"
        >
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <!-- Image -->
        <Transition name="img-fade" mode="out-in">
          <img
            :key="currentIndex"
            :src="images[currentIndex]"
            :alt="`Gallery item ${currentIndex + 1} of ${images.length}`"
            class="max-h-[82vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          />
        </Transition>

        <!-- Next arrow -->
        <button
          class="absolute right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 sm:flex"
          aria-label="Next photo"
          @click="next"
        >
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <!-- Counter -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm font-medium text-white" aria-live="polite">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-enter-active, .lightbox-leave-active { transition: opacity 0.2s ease; }
.lightbox-enter-from, .lightbox-leave-to { opacity: 0; }
.img-fade-enter-active, .img-fade-leave-active { transition: opacity 0.15s ease; }
.img-fade-enter-from, .img-fade-leave-to { opacity: 0; }
</style>
