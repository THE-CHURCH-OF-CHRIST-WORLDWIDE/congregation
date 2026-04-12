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
  <div class="relative w-full overflow-hidden rounded-xl bg-black" style="padding-bottom:56.25%">
    <!-- Thumbnail + play button -->
    <template v-if="!playing">
      <img
        :src="props.thumbnail"
        :alt="props.title"
        loading="lazy"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-black/40" />
      <button
        @click="play"
        :aria-label="`Play ${props.title}`"
        class="absolute inset-0 flex items-center justify-center group"
      >
        <span class="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform group-hover:scale-110">
          <!-- Play triangle -->
          <svg class="ml-1 h-7 w-7 text-[#2563EB]" fill="currentColor" viewBox="0 0 24 24">
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
    />
  </div>
</template>
