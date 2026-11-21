<script setup lang="ts">
import type { RecordedStream } from '~/types/public'

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

// ─── Replay player ───────────────────────────────────────────────────────────
const playing = ref<RecordedStream | null>(null)
const playerOpen = computed({
  get: () => playing.value !== null,
  set: (open: boolean) => {
    if (!open) playing.value = null
  },
})

const {
  page: streamPage,
  total: streamTotal,
  totalPages: streamTotalPages,
  paginated: pagedStreams,
  rangeStart: streamFrom,
  rangeEnd: streamTo,
} = usePagination(filteredRecorded, 9)

function watchReplay(stream: RecordedStream) {
  playing.value = stream
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
  <div>
    <!-- Banner: a calm bookcloth band carrying the page title -->
    <section class="bookcloth relative overflow-hidden">
      <img
        src="https://picsum.photos/seed/livestream-banner/1920/600"
        alt="Live streams banner"
        class="absolute inset-0 h-full w-full object-cover opacity-10 mix-blend-luminosity"
        loading="lazy"
      />
      <div class="relative z-10 mx-auto max-w-7xl px-5 py-12 text-white sm:px-6 md:py-16 lg:px-8">
        <div class="hero-animate max-w-3xl">
          <h1 class="font-display text-4xl leading-[1.1] font-bold md:text-5xl">Live Streams</h1>
          <p class="mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
            Watch live Sunday worship services or browse our library of recorded Bible classes,
            sermons, and special services.
          </p>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-14 lg:px-8">
      <!-- Search + filter bar -->
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          class="flex min-h-11 flex-1 items-center gap-2.5 rounded-md border border-rule-strong bg-surface px-3 shadow-xs transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15 hover:border-ink-subtle"
        >
          <Icon icon="mdi:magnify" class="size-5 shrink-0 text-ink-subtle" aria-hidden="true" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for dates and day of church service…"
            class="min-h-11 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-subtle sm:text-sm"
            aria-label="Search streams"
          />
        </div>
        <select
          v-model="activityFilter"
          class="min-h-11 rounded-md border border-rule-strong bg-surface px-3 text-base text-ink shadow-xs outline-none transition-[border-color,box-shadow] hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15 sm:text-sm"
          aria-label="Filter by activity"
        >
          <option v-for="opt in activityOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>

      <!-- Tabs -->
      <div class="mb-8 flex w-fit gap-1 rounded-md border border-rule bg-surface-muted p-1">
        <button
          :class="[
            'min-h-10 rounded-[5px] px-5 text-sm font-semibold transition-[background-color,color,box-shadow] duration-150',
            activeTab === 'live'
              ? 'bg-surface text-ink shadow-xs'
              : 'text-ink-muted hover:text-ink',
          ]"
          aria-label="Live Now tab"
          @click="setTab('live')"
        >
          <span class="flex items-center gap-2">
            <span
              v-if="isLive"
              class="pulse-ring relative inline-flex size-2 rounded-full bg-live"
            ></span>
            Live Now
          </span>
        </button>
        <button
          :class="[
            'min-h-10 rounded-[5px] px-5 text-sm font-semibold transition-[background-color,color,box-shadow] duration-150',
            activeTab === 'recorded'
              ? 'bg-surface text-ink shadow-xs'
              : 'text-ink-muted hover:text-ink',
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
          <div
            class="mt-6 flex flex-col gap-4 border-b border-rule pb-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 class="font-display text-xl font-bold text-secondary md:text-2xl">
                {{ currentStream.title }}
              </h2>
              <div class="mt-1.5 flex items-center gap-3 text-sm text-ink-muted">
                <span class="num flex items-center gap-1.5">
                  <Icon icon="mdi:calendar-outline" class="size-4" aria-hidden="true" />
                  {{ formatDate(new Date(), 'full') }}
                </span>
              </div>
            </div>
            <a
              href="#"
              target="_blank"
              rel="noopener"
              class="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-on-primary shadow-xs transition-colors duration-150 hover:bg-primary-hover"
              aria-label="Watch live stream now"
            >
              Watch Live Now
              <Icon icon="mdi:open-in-new" class="size-4" aria-hidden="true" />
            </a>
          </div>

          <!-- How to join -->
          <div class="mt-12 md:mt-16">
            <h2 class="margin-rule mb-8 font-display text-2xl font-bold text-secondary md:text-3xl">
              How to Join a Live Stream
            </h2>
            <HowToSteps :steps="howToSteps" />
          </div>
        </div>

        <!-- No active stream -->
        <EmptyStreamState v-else @watch-recorded="onWatchRecorded" />
      </div>

      <!-- Recorded tab -->
      <div v-if="activeTab === 'recorded'" id="streams-grid" class="scroll-mt-24">
        <div v-if="pagedStreams.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StreamCard
            v-for="stream in pagedStreams"
            :key="stream.id"
            :stream="stream"
            @watch="watchReplay"
          />
        </div>
        <Pagination
          v-if="pagedStreams.length"
          v-model:page="streamPage"
          :total-pages="streamTotalPages"
          :total="streamTotal"
          :range-start="streamFrom"
          :range-end="streamTo"
          label="streams"
        />

        <EmptyState
          v-else-if="store.recordedStreams.length"
          icon="mdi:video-off-outline"
          title="No streams match your search"
          description="Try a different search term or activity filter."
        />
        <EmptyState
          v-else
          icon="mdi:video-off-outline"
          title="No recorded streams yet"
          description="Past services will be available to watch here once they are published."
        />
      </div>
    </div>

    <!-- Replay player -->
    <Modal v-model="playerOpen" :title="playing?.title" size="xl">
      <VideoPlayer
        v-if="playing?.videoSrc"
        :src="playing.videoSrc"
        :thumbnail="playing.thumbnailSrc"
        :title="playing.title"
      />
      <p class="mt-3 text-sm text-ink-muted">
        {{ playing?.serviceType }} · {{ playing?.preacher }} · {{ playing?.duration }}
      </p>
    </Modal>
  </div>
</template>
