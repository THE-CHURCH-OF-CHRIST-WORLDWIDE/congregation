<script setup lang="ts">
defineProps<{
  categoryTitle: string
  previewImages?: string[]
}>()
</script>

<template>
  <div class="relative overflow-hidden bg-[#111827]" style="min-height: 120px;">
    <!-- Decorative thumbnail stack — top right -->
    <div class="absolute right-8 top-2 z-10 flex items-end" aria-hidden="true">
      <div class="relative" style="width: 220px; height: 90px;">
        <img
          v-if="previewImages?.[0]"
          :src="previewImages[0]"
          alt=""
          class="absolute left-0 top-3 h-[70px] w-[100px] rounded-md border-2 border-white object-cover"
          style="transform: rotate(-3deg); z-index: 1;"
          loading="lazy"
        />
        <img
          v-if="previewImages?.[1]"
          :src="previewImages[1]"
          alt=""
          class="absolute left-[60px] top-1 h-[70px] w-[100px] rounded-md border-2 border-white object-cover"
          style="transform: rotate(2deg); z-index: 2;"
          loading="lazy"
        />
      </div>
    </div>

    <!-- Breadcrumb -->
    <nav class="relative z-20 px-8 pt-4" aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-1 text-[13px] text-white/60">
        <li><NuxtLink to="/" class="hover:text-white/90 transition-colors">Home</NuxtLink></li>
        <li class="select-none">/</li>
        <li><NuxtLink to="/events" class="hover:text-white/90 transition-colors">Past Events</NuxtLink></li>
        <li class="select-none">/</li>
        <li><NuxtLink to="/gallery/sunday-service" class="hover:text-white/90 transition-colors">Photo Gallery</NuxtLink></li>
        <li class="select-none">/</li>
        <li class="font-medium text-white">{{ categoryTitle }}</li>
      </ol>
    </nav>

    <!-- Page title -->
    <h1
      class="relative z-20 px-8 pb-5 pt-3 text-[32px] font-bold text-white"
      style="font-family: 'Playfair Display', Georgia, serif;"
    >
      Photo Gallery
    </h1>
  </div>
</template>
