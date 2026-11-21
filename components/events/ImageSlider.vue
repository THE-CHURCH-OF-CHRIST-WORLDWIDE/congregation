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
    class="relative aspect-[4/3] w-full overflow-hidden bg-night"
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

    <!-- Floor shade so the controls always read -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-night/75 to-transparent"
      aria-hidden="true"
    ></div>

    <!-- Expand icon — top right -->
    <button
      class="absolute top-3 right-3 z-10 inline-flex size-11 items-center justify-center rounded-sm bg-night/55 text-on-night transition-colors duration-300 hover:bg-night/80"
      aria-label="Open full gallery"
      @click="emit('expand', currentIndex)"
    >
      <Icon icon="mdi:arrow-expand" class="size-5" aria-hidden="true" />
    </button>

    <!-- Controls along the floor: previous, counter, next -->
    <div
      class="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 p-3 sm:p-4"
    >
      <!-- Left arrow -->
      <button
        class="inline-flex size-11 items-center justify-center rounded-full border border-on-night/40 text-on-night transition-colors duration-300 hover:border-on-night hover:bg-on-night hover:text-night"
        aria-label="Previous image"
        @click="prev"
      >
        <Icon icon="mdi:arrow-left" class="size-5" aria-hidden="true" />
      </button>

      <!-- Counter -->
      <span class="num t-label text-on-night">
        {{ String(currentIndex + 1).padStart(2, '0') }}
        <span class="text-on-night-muted">/ {{ String(images.length).padStart(2, '0') }}</span>
      </span>

      <!-- Right arrow -->
      <button
        class="inline-flex size-11 items-center justify-center rounded-full border border-on-night/40 text-on-night transition-colors duration-300 hover:border-on-night hover:bg-on-night hover:text-night"
        aria-label="Next image"
        @click="next"
      >
        <Icon icon="mdi:arrow-right" class="size-5" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.img-fade-enter-active,
.img-fade-leave-active {
  transition: opacity 0.45s var(--ease-out-quart);
}
.img-fade-enter-from,
.img-fade-leave-to {
  opacity: 0;
}
</style>
