<script setup lang="ts">
const props = defineProps<{
  src: string
  thumbnail: string
  title: string
}>()

const playing = ref(false)

function play() {
  playing.value = true
}
</script>

<template>
  <div class="relative w-full overflow-hidden rounded-lg bg-black" style="padding-bottom: 56.25%">
    <!-- Thumbnail + play button -->
    <template v-if="!playing">
      <img
        :src="displayableImageUrl(props.thumbnail)"
        :alt="props.title"
        loading="lazy"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-black/30 transition-colors duration-200"></div>
      <button
        :aria-label="`Play ${props.title}`"
        class="group absolute inset-0 flex items-center justify-center"
        @click="play"
      >
        <span
          class="flex size-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        >
          <!-- Play triangle -->
          <svg
            class="ml-1 size-7 text-primary"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
    </template>

    <!-- Iframe embed -->
    <iframe
      v-else
      :src="`${props.src}?autoplay=1`"
      :title="props.title"
      class="absolute inset-0 h-full w-full"
      allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen
    ></iframe>
  </div>
</template>
