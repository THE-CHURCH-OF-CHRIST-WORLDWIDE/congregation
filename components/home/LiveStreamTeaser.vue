<script setup lang="ts">
const liveStore = usePublicLiveStreamStore()
</script>

<template>
  <section class="py-16">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Live state -->
      <div
        v-if="liveStore.isLive && liveStore.currentStream"
        class="relative overflow-hidden rounded-2xl bg-[#1E3A5F] p-8 md:p-12"
      >
        <img
          :src="liveStore.currentStream.thumbnailSrc"
          alt="Live stream background"
          class="absolute inset-0 h-full w-full object-cover opacity-20"
          loading="lazy"
        />
        <div class="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div class="text-white">
            <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EF4444]/20 px-3 py-1 border border-[#EF4444]/30">
              <span class="relative flex h-2.5 w-2.5">
                <span class="absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75 animate-ping" />
                <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
              </span>
              <span class="text-xs font-bold text-[#EF4444] uppercase tracking-widest">Live Now</span>
            </div>
            <h2 class="font-serif text-2xl font-bold md:text-3xl">Worship With Us Now</h2>
            <p class="mt-1 text-white/70">{{ liveStore.currentStream.congregation }}</p>
            <div class="mt-2 flex items-center gap-2 text-sm text-white/50">
              <Icon icon="heroicons:eye" class="h-4 w-4" />
              {{ liveStore.currentStream.viewerCount.toLocaleString() }} watching
            </div>
          </div>
          <a
            href="#"
            target="_blank"
            rel="noopener"
            class="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-8 py-3.5 font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
            aria-label="Watch live stream now"
          >
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            Watch Live Now
          </a>
        </div>
      </div>

      <!-- Not live state -->
      <div
        v-else
        class="rounded-2xl bg-[#F8F9FA] border border-gray-200 p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <div class="mb-2 inline-flex items-center gap-2 text-sm text-gray-400">
            <Icon icon="heroicons:radio" class="h-4 w-4" />
            <span class="font-medium">No service live right now</span>
          </div>
          <h2 class="font-serif text-xl font-bold text-[#1E3A5F]">Next live service: Sunday, 9:00 AM</h2>
          <p class="mt-1 text-sm text-gray-500">Church of Christ, Ekot Ekpene · Set a reminder and join us online</p>
        </div>
        <NuxtLink
          to="/live-streams"
          class="shrink-0 inline-flex items-center gap-2 rounded-full border border-[#2563EB] px-6 py-3 text-sm font-semibold text-[#2563EB] hover:bg-blue-50 transition-colors"
          aria-label="View recorded streams"
        >
          <Icon icon="heroicons:play-circle" class="h-5 w-5" />
          Watch Recorded Streams
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
