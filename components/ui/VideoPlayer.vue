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
  <div class="relative w-full overflow-hidden bg-night" style="padding-bottom: 56.25%">
    <!-- Thumbnail + play button -->
    <template v-if="!playing">
      <img
        v-if="props.thumbnail"
        :src="displayableImageUrl(props.thumbnail)"
        :alt="props.title"
        loading="lazy"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div
        v-else
        class="absolute inset-0 flex items-end p-6 font-display text-3xl leading-tight text-on-night/30 italic sm:p-10 sm:text-5xl"
        aria-hidden="true"
      >
        {{ props.title }}
      </div>
      <div class="absolute inset-0 bg-night/35" aria-hidden="true"></div>
      <!-- No recording published yet: the frame stays a still, with nothing to press -->
      <button
        v-if="props.src"
        :aria-label="`Play ${props.title}`"
        class="group absolute inset-0 flex items-center justify-center"
        @click="play"
      >
        <span
          class="flex size-16 items-center justify-center rounded-full border border-on-night/50 text-on-night transition-[transform,background-color,border-color,color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:border-champagne group-hover:bg-champagne group-hover:text-night sm:size-20"
        >
          <!-- Play triangle -->
          <svg class="ml-1 size-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
    </template>

    <!-- Iframe embed -->
    <iframe
      v-else
      :src="`${props.src}${props.src.includes('?') ? '&' : '?'}autoplay=1`"
      :title="props.title"
      class="absolute inset-0 h-full w-full"
      allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen
    ></iframe>
  </div>
</template>
