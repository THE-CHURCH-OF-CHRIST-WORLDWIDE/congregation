<script setup lang="ts">
import type { RecordedStream } from '~/types/public'

definePageMeta({ layout: 'default', navOverlay: true })

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
  <!-- A broadcast page: the whole run sits on the night field -->
  <div class="field-night on-night-tokens">
    <!-- Cover: title, status slate, channel tabs -->
    <section class="pt-[calc(var(--nav-h)+4rem)] md:pt-[calc(var(--nav-h)+6rem)]">
      <div class="site-container">
        <div class="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h1 class="t-display text-on-night lg:col-span-7">
            <SplitReveal text="Live" immediate :delay="150" />{{ ' ' }}
            <SplitReveal text="Streams" immediate :delay="230" class="t-turn text-champagne" />
          </h1>
          <p
            v-reveal.350
            class="max-w-md text-lg leading-relaxed text-on-night-muted lg:col-span-4 lg:col-start-9"
          >
            Watch live Sunday worship services or browse our library of recorded Bible classes,
            sermons, and special services.
          </p>
        </div>

        <!-- Slate row: status on the left, the two channels on the right -->
        <div
          class="mt-14 flex flex-col gap-2 border-t border-on-night/15 pt-2 sm:flex-row sm:items-center sm:justify-between md:mt-20"
        >
          <p class="t-label inline-flex min-h-11 items-center gap-2.5">
            <template v-if="isLive && currentStream">
              <span class="pulse-ring relative inline-flex size-2 rounded-full bg-live"></span>
              <span class="text-on-night">Live now</span>
            </template>
            <template v-else>
              <span class="size-1.5 rounded-full bg-on-night-muted" aria-hidden="true"></span>
              <span class="text-on-night-muted">Off air</span>
            </template>
          </p>

          <!-- Tabs -->
          <div class="flex gap-8">
            <button
              :class="[
                'relative min-h-11 text-[0.9375rem] font-medium transition-colors duration-300',
                'after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-champagne after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)]',
                activeTab === 'live'
                  ? 'text-on-night after:scale-x-100'
                  : 'text-on-night-muted after:scale-x-0 hover:text-on-night',
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
                'relative min-h-11 text-[0.9375rem] font-medium transition-colors duration-300',
                'after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-champagne after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)]',
                activeTab === 'recorded'
                  ? 'text-on-night after:scale-x-100'
                  : 'text-on-night-muted after:scale-x-0 hover:text-on-night',
              ]"
              aria-label="Recorded tab"
              @click="setTab('recorded')"
            >
              Recorded
            </button>
          </div>
        </div>

        <!-- Search + filter bar -->
        <div class="mt-6 grid gap-6 sm:grid-cols-12 sm:items-end">
          <div class="relative sm:col-span-8 lg:col-span-6">
            <Icon
              icon="mdi:magnify"
              class="pointer-events-none absolute top-1/2 left-0 size-5 -translate-y-1/2 text-on-night-muted"
              aria-hidden="true"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for dates and day of church service…"
              class="field-input pl-8 text-base"
              aria-label="Search streams"
            />
          </div>
          <select
            v-model="activityFilter"
            class="field-input cursor-pointer text-base sm:col-span-4 lg:col-span-3 lg:col-start-10"
            aria-label="Filter by activity"
          >
            <option v-for="opt in activityOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
      </div>
    </section>

    <div class="site-container pt-12 pb-20 md:pt-16 md:pb-24">
      <!-- Live tab -->
      <div v-if="activeTab === 'live'">
        <!-- Active stream -->
        <div v-if="isLive && currentStream">
          <div v-reveal="'unveil'">
            <LiveNowCard :stream="currentStream" />
          </div>

          <!-- Stream info row -->
          <div
            class="flex flex-col gap-5 border-b border-on-night/15 py-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 class="font-display text-2xl text-on-night md:text-3xl">
                {{ currentStream.title }}
              </h2>
              <p class="num t-label mt-2 text-on-night-muted">
                {{ formatDate(new Date(), 'full') }}
              </p>
            </div>
            <a
              href="#"
              target="_blank"
              rel="noopener"
              class="btn btn-ghost-light min-h-12 shrink-0"
              aria-label="Watch live stream now"
            >
              Watch Live Now
              <Icon icon="mdi:open-in-new" class="size-4" aria-hidden="true" />
            </a>
          </div>

          <!-- How to join -->
          <div class="mt-24 md:mt-32">
            <h2 class="t-h2 mb-10 text-on-night md:mb-14">
              <SplitReveal text="How to Join a Live Stream" />
            </h2>
            <HowToSteps :steps="howToSteps" />
          </div>
        </div>

        <!-- No active stream -->
        <div v-else v-reveal="'fade'">
          <EmptyStreamState @watch-recorded="onWatchRecorded" />
        </div>
      </div>

      <!-- Recorded tab -->
      <div v-if="activeTab === 'recorded'" id="streams-grid" class="scroll-mt-24">
        <div v-if="pagedStreams.length" class="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          <StreamCard
            v-for="(stream, i) in pagedStreams"
            :key="stream.id"
            v-reveal="{ delay: Math.min(i % 3, 2) * 90 }"
            :stream="stream"
            @watch="watchReplay"
          />
        </div>
        <Pagination
          v-if="pagedStreams.length"
          v-model:page="streamPage"
          class="mt-14 !px-0"
          :total-pages="streamTotalPages"
          :total="streamTotal"
          :range-start="streamFrom"
          :range-end="streamTo"
          label="streams"
        />

        <div v-else-if="store.recordedStreams.length" class="border-y border-on-night/15 py-6">
          <EmptyState
            icon="mdi:video-off-outline"
            title="No streams match your search"
            description="Try a different search term or activity filter."
          />
        </div>
        <div v-else class="border-y border-on-night/15 py-6">
          <EmptyState
            icon="mdi:video-off-outline"
            title="No recorded streams yet"
            description="Past services will be available to watch here once they are published."
          />
        </div>
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

<style scoped>
/*
 * Shared ink-based components (HowToSteps, EmptyState, Pagination, the underlined fields)
 * are drawn with the semantic tokens. Re-pointing those tokens here lets them sit on the
 * night field without changing how they look anywhere else (admin uses Pagination too).
 */
.on-night-tokens {
  --c-ink: var(--c-on-night);
  --c-ink-muted: var(--c-on-night-muted);
  --c-ink-subtle: var(--c-on-night-muted);
  --c-rule: rgb(243 239 230 / 0.15);
  --c-rule-strong: rgb(243 239 230 / 0.3);
  --c-surface: transparent;
  --c-surface-muted: var(--c-night-raised);
  --c-primary: var(--c-champagne);
  --c-primary-ink: var(--c-champagne);
  --c-on-primary: var(--c-night);
}
/* Native option lists render on a light sheet, so give them ink back. */
.on-night-tokens select option {
  background: var(--g-50);
  color: var(--g-900);
}
</style>
