<script setup lang="ts">
const props = defineProps<{
  images: string[]
  startIndex?: number
}>()

const emit = defineEmits<{
  expand: [index: number]
}>()

const currentIndex = ref(props.startIndex ?? 0)

watch(() => props.startIndex, val => {
  if (val !== undefined) currentIndex.value = val
})

watch(() => props.images, () => {
  currentIndex.value = 0
})

function prev() {
  currentIndex.value =
    currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1
}

function next() {
  currentIndex.value =
    currentIndex.value === props.images.length - 1 ? 0 : currentIndex.value + 1
}

let touchStartX = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0]?.clientX ?? 0
}

function onTouchEnd(e: TouchEvent) {
  const delta = touchStartX - (e.changedTouches[0]?.clientX ?? 0)
  if (Math.abs(delta) > 50) { if (delta > 0) next(); else prev() }
}
</script>

<template>
  <div
    class="relative w-full overflow-hidden bg-gray-900"
    style="aspect-ratio: 16/9"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- Image with fade transition -->
    <Transition name="img-fade" mode="out-in">
      <img
        :key="currentIndex"
        :src="images[currentIndex]"
        :alt="`Event photo ${currentIndex + 1} of ${images.length}`"
        class="absolute inset-0 w-full h-full object-cover"
      />
    </Transition>

    <!-- Expand icon — top right -->
    <button
      class="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded bg-black/50 text-white transition-colors hover:bg-black/70"
      aria-label="Open full gallery"
      @click="emit('expand', currentIndex)"
    >
      <!-- Expand / maximize SVG -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4"
      >
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    </button>

    <!-- Left arrow -->
    <button
      class="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-gray-800 shadow transition-colors hover:bg-white sm:h-9 sm:w-9"
      aria-label="Previous image"
      @click="prev"
    >
      <Icon icon="mdi:chevron-left" class="h-5 w-5" />
    </button>

    <!-- Right arrow -->
    <button
      class="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-gray-800 shadow transition-colors hover:bg-white"
      aria-label="Next image"
      @click="next"
    >
      <Icon icon="mdi:chevron-right" class="h-5 w-5" />
    </button>

    <!-- Counter strip -->
    <div class="absolute bottom-0 left-0 right-0 z-10 bg-black/40 py-1.5 text-center text-sm text-white">
      {{ currentIndex + 1 }}/{{ images.length }}
    </div>
  </div>
</template>

<style scoped>
.img-fade-enter-active,
.img-fade-leave-active {
  transition: opacity 0.3s ease;
}
.img-fade-enter-from,
.img-fade-leave-to {
  opacity: 0;
}
</style>
