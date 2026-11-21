<script setup lang="ts">
defineProps<{
  categoryTitle: string
  previewImages?: string[]
}>()
</script>

<template>
  <div class="bookcloth relative overflow-hidden">
    <div class="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
      <!-- Decorative thumbnail stack — top right -->
      <div
        class="absolute top-1/2 right-5 z-10 hidden -translate-y-1/2 items-end sm:flex lg:right-8"
        aria-hidden="true"
      >
        <div class="relative h-[90px] w-[220px]">
          <img
            v-if="previewImages?.[0]"
            :src="displayableImageUrl(previewImages[0])"
            alt=""
            class="absolute top-3 left-0 z-[1] h-[70px] w-[100px] -rotate-3 rounded-md border-2 border-white object-cover shadow-md"
            loading="lazy"
            decoding="async"
          />
          <img
            v-if="previewImages?.[1]"
            :src="displayableImageUrl(previewImages[1])"
            alt=""
            class="absolute top-1 left-[60px] z-[2] h-[70px] w-[100px] rotate-2 rounded-md border-2 border-white object-cover shadow-md"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <!-- Breadcrumb -->
      <nav class="relative z-20" aria-label="Breadcrumb">
        <ol class="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
          <li>
            <NuxtLink
              to="/"
              class="rounded-sm transition-colors duration-150 hover:text-white hover:underline"
              >Home</NuxtLink
            >
          </li>
          <li class="select-none" aria-hidden="true">/</li>
          <li>
            <NuxtLink
              to="/events"
              class="rounded-sm transition-colors duration-150 hover:text-white hover:underline"
              >Past Events</NuxtLink
            >
          </li>
          <li class="select-none" aria-hidden="true">/</li>
          <li>
            <NuxtLink
              to="/gallery/sunday-service"
              class="rounded-sm transition-colors duration-150 hover:text-white hover:underline"
              >Photo Gallery</NuxtLink
            >
          </li>
          <li class="select-none" aria-hidden="true">/</li>
          <li class="font-medium text-white" aria-current="page">{{ categoryTitle }}</li>
        </ol>
      </nav>

      <!-- Page title -->
      <h1
        class="relative z-20 mt-3 font-display text-[1.875rem] leading-[1.15] font-bold text-white sm:pr-[240px] md:text-[2.5rem]"
      >
        Photo Gallery
      </h1>
    </div>
  </div>
</template>
