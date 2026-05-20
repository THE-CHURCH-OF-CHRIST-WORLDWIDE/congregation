<script setup lang="ts">
definePageMeta({ layout: 'default' })

const store = usePublicLiveStreamStore()
const { isLive, currentStream, filteredRecorded, activeTab, setTab } = useLiveStreams()

const searchQuery = ref('')
const activityFilter = ref('All Church Activities')

const activityOptions = [
  'All Church Activities',
  'Sunday Worship',
  'Bible Class',
  'Sunday School',
  'Evangelism',
]

watch(searchQuery, (v) => store.setSearch(v))
watch(activityFilter, (v) => store.setFilter(v))

function onWatchRecorded() {
  setTab('recorded')
  nextTick(() => {
    document.getElementById('streams-grid')?.scrollIntoView({ behavior: 'smooth' })
  })
}

const howToSteps = [
  {
    number: 1,
    title: 'Find a Congregation',
    description:
      'Search for your nearest Church of Christ congregation to find local worship services and live streams.',
  },
  {
    number: 2,
    title: 'Click to Join',
    description:
      'Click the Watch Live Now button when a service is active. Our streams run every Sunday at 9:00 AM.',
  },
  {
    number: 3,
    title: 'Worship Together',
    description:
      'Participate in the service, follow along with the message, and fellowship with believers worldwide.',
  },
]

useSeoMeta({
  title: 'Live Streams — Church of Christ',
  description:
    'Watch live Sunday worship services and recorded Bible classes from Church of Christ congregations. Join thousands of believers worshipping online.',
  ogTitle: 'Live Streams — Church of Christ',
  ogDescription: 'Watch live and recorded worship services from the Church of Christ, worldwide.',
  ogImage: '/images/heroImg.png',
})
</script>

<template>
  <div class="pt-16">
    <!-- Banner -->
    <section class="relative bg-[#1E3A5F] py-20 overflow-hidden">
      <img
        src="https://picsum.photos/seed/livestream-banner/1920/600"
        alt="Live streams banner"
        class="absolute inset-0 h-full w-full object-cover opacity-20"
        loading="lazy"
      />
      <div class="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        <div
          class="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EF4444]/20 px-4 py-1.5 border border-[#EF4444]/30"
        >
          <span class="relative flex h-2.5 w-2.5">
            <span
              class="absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75 animate-ping"
            ></span>
            <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#EF4444]"></span>
          </span>
          <span class="text-xs font-bold text-[#EF4444] tracking-widest uppercase"
            >Live Streams</span
          >
        </div>
        <h1 class="font-serif text-5xl font-bold drop-shadow-lg md:text-6xl">Live Streams</h1>
        <p class="mt-4 text-white/70 text-lg max-w-2xl mx-auto">
          Watch live Sunday worship services or browse our library of recorded Bible classes,
          sermons, and special services.
        </p>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <!-- Search + filter bar -->
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          class="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
        >
          <Icon icon="heroicons:magnifying-glass" class="h-5 w-5 shrink-0 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for dates and day of church service…"
            class="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
            aria-label="Search streams"
          />
        </div>
        <select
          v-model="activityFilter"
          class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          aria-label="Filter by activity"
        >
          <option v-for="opt in activityOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>

      <!-- Tabs -->
      <div class="mb-8 flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        <button
          :class="[
            'rounded-lg px-6 py-2.5 text-sm font-semibold transition-all',
            activeTab === 'live'
              ? 'bg-white text-[#1E3A5F] shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ]"
          aria-label="Live Now tab"
          @click="setTab('live')"
        >
          <span class="flex items-center gap-2">
            <span v-if="isLive" class="relative flex h-2 w-2">
              <span
                class="absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75 animate-ping"
              ></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-[#EF4444]"></span>
            </span>
            Live Now
          </span>
        </button>
        <button
          :class="[
            'rounded-lg px-6 py-2.5 text-sm font-semibold transition-all',
            activeTab === 'recorded'
              ? 'bg-white text-[#1E3A5F] shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ]"
          aria-label="Recorded tab"
          @click="setTab('recorded')"
        >
          Recorded
        </button>
      </div>

      <!-- Live tab -->
      <div v-if="activeTab === 'live'">
        <!-- Active stream -->
        <div v-if="isLive && currentStream">
          <LiveNowCard :stream="currentStream" />

          <!-- Stream info row -->
          <div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="font-serif text-xl font-bold text-[#1E3A5F]">{{ currentStream.title }}</h2>
              <div class="mt-1 flex items-center gap-3 text-sm text-gray-500">
                <span class="flex items-center gap-1">
                  <Icon icon="heroicons:calendar" class="h-4 w-4" />
                  {{
                    new Date().toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }}
                </span>
              </div>
            </div>
            <a
              href="#"
              target="_blank"
              rel="noopener"
              class="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              aria-label="Watch live stream now"
            >
              Watch Live Now
              <Icon icon="heroicons:arrow-top-right-on-square" class="h-4 w-4" />
            </a>
          </div>

          <!-- How to join -->
          <div class="mt-12">
            <h2 class="font-serif text-2xl font-bold text-[#1E3A5F] mb-8 text-center">
              How to Join a Live Stream
            </h2>
            <HowToSteps :steps="howToSteps" />
          </div>
        </div>

        <!-- No active stream -->
        <EmptyStreamState v-else @watch-recorded="onWatchRecorded" />
      </div>

      <!-- Recorded tab -->
      <div v-if="activeTab === 'recorded'" id="streams-grid">
        <div v-if="filteredRecorded.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StreamCard v-for="stream in filteredRecorded" :key="stream.id" :stream="stream" />
        </div>
        <div v-else class="py-16 text-center text-gray-400">
          <Icon icon="heroicons:video-camera-slash" class="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No streams found for your search.</p>
        </div>
      </div>
    </div>
  </div>
</template>
