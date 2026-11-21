<script setup lang="ts">
defineProps<{
  categoryTitle: string
  previewImages?: string[]
}>()
</script>

<template>
  <!-- The exhibition cover: a night field with the category set as the show title -->
  <section
    class="field-night relative isolate overflow-hidden pt-[calc(var(--nav-h)+3.5rem)] pb-12 sm:pb-16 lg:min-h-[72svh] lg:pt-[calc(var(--nav-h)+5rem)] lg:pb-20"
    aria-labelledby="gallery-title"
  >
    <div class="site-container grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
      <div class="lg:col-span-8">
        <!-- Breadcrumb -->
        <nav class="hero-animate" aria-label="Breadcrumb">
          <ol class="t-label flex flex-wrap items-center gap-x-3 gap-y-1 text-on-night-muted">
            <li>
              <NuxtLink
                to="/"
                class="inline-flex min-h-8 items-center transition-colors duration-300 hover:text-champagne"
                >Home</NuxtLink
              >
            </li>
            <li class="select-none text-on-night/30" aria-hidden="true">/</li>
            <li>
              <NuxtLink
                to="/events"
                class="inline-flex min-h-8 items-center transition-colors duration-300 hover:text-champagne"
                >Past Events</NuxtLink
              >
            </li>
            <li class="select-none text-on-night/30" aria-hidden="true">/</li>
            <li>
              <NuxtLink
                to="/gallery/sunday-service"
                class="inline-flex min-h-8 items-center transition-colors duration-300 hover:text-champagne"
                >Photo Gallery</NuxtLink
              >
            </li>
            <li class="select-none text-on-night/30" aria-hidden="true">/</li>
            <li class="text-champagne" aria-current="page">{{ categoryTitle }}</li>
          </ol>
        </nav>

        <!-- Page title -->
        <h1 id="gallery-title" class="mt-14 text-on-night lg:mt-24">
          <SplitReveal
            :text="`${categoryTitle},`"
            immediate
            :delay="150"
            :stagger="70"
            class="t-display block text-[clamp(3.25rem,10vw,8.5rem)]"
          />
          <SplitReveal
            text="in photographs"
            immediate
            :delay="450"
            class="t-turn mt-1 block text-[clamp(2rem,4.4vw,3.75rem)] leading-tight text-champagne"
          />
        </h1>
      </div>

      <!-- Two frames from the collection, hung slightly apart -->
      <div
        v-if="previewImages?.length"
        class="hidden items-end gap-5 lg:col-span-4 lg:flex lg:justify-end"
        aria-hidden="true"
      >
        <div
          v-if="previewImages[0]"
          v-reveal="{ type: 'unveil', delay: 500 }"
          class="aspect-[4/5] w-40 overflow-hidden bg-night-raised xl:w-48"
        >
          <img
            :src="displayableImageUrl(previewImages[0])"
            alt=""
            class="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div
          v-if="previewImages[1]"
          v-reveal="{ type: 'unveil', delay: 650 }"
          class="mb-12 aspect-[4/5] w-32 overflow-hidden bg-night-raised xl:w-36"
        >
          <img
            :src="displayableImageUrl(previewImages[1])"
            alt=""
            class="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  </section>
</template>
