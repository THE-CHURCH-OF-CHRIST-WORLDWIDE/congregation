<script setup lang="ts">
const props = defineProps<{
  images: string[]
  startIndex?: number
}>()

const emit = defineEmits<{
  expand: [index: number]
}>()

const currentIndex = ref(props.startIndex ?? 0)

watch(
  () => props.startIndex,
  (val) => {
    if (val !== undefined) currentIndex.value = val
  }
)

watch(
  () => props.images,
  () => {
    currentIndex.value = 0
  }
)

function prev() {
  currentIndex.value = currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1
}

function next() {
  currentIndex.value = currentIndex.value === props.images.length - 1 ? 0 : currentIndex.value + 1
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
</script>

<template>
  <div
    class="relative aspect-video w-full overflow-hidden bg-gray-950"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- Image with fade transition -->
    <Transition name="img-fade" mode="out-in">
      <img
        :key="currentIndex"
        :src="displayableImageUrl(images[currentIndex])"
        :alt="`Event photo ${currentIndex + 1} of ${images.length}`"
        class="absolute inset-0 h-full w-full object-cover"
        decoding="async"
      />
    </Transition>

    <!-- Expand icon — top right -->
    <button
      class="absolute top-3 right-3 z-10 inline-flex size-11 items-center justify-center rounded-md bg-black/55 text-white transition-colors duration-150 hover:bg-black/75"
      aria-label="Open full gallery"
      @click="emit('expand', currentIndex)"
    >
      <Icon icon="mdi:arrow-expand" class="size-5" aria-hidden="true" />
    </button>

    <!-- Left arrow -->
    <button
      class="absolute top-1/2 left-3 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md bg-white/85 text-gray-900 shadow-md transition-colors duration-150 hover:bg-white"
      aria-label="Previous image"
      @click="prev"
    >
      <Icon icon="mdi:chevron-left" class="size-6" aria-hidden="true" />
    </button>

    <!-- Right arrow -->
    <button
      class="absolute top-1/2 right-3 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md bg-white/85 text-gray-900 shadow-md transition-colors duration-150 hover:bg-white"
      aria-label="Next image"
      @click="next"
    >
      <Icon icon="mdi:chevron-right" class="size-6" aria-hidden="true" />
    </button>

    <!-- Counter strip -->
    <div
      class="num absolute right-0 bottom-0 left-0 z-10 bg-linear-to-t from-black/65 to-transparent pt-6 pb-2 text-center text-sm font-medium text-white"
    >
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
