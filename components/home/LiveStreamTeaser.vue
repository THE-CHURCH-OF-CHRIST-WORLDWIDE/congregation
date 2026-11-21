<script setup lang="ts">
const liveStore = usePublicLiveStreamStore()
const settingsStore = useChurchSettingsStore()
onMounted(() => settingsStore.load())

const isLive = computed(() => liveStore.isLive && !!liveStore.currentStream)
const stream = computed(() => liveStore.currentStream)
const recentStreams = computed(() => liveStore.recordedStreams.slice(0, 4))
const lw = computed(() => settingsStore.settings.liveWorship)
const thumb = computed(() => displayableImageUrl(stream.value?.thumbnailSrc))
</script>

<template>
  <section class="field-night section relative overflow-hidden" aria-label="Live worship stream">
    <div class="site-container">
      <!-- Heading -->
      <div class="grid gap-6 lg:grid-cols-12 lg:items-end">
        <h2 class="t-h1 text-on-night lg:col-span-7">
          <SplitReveal :text="lw.heading" />
        </h2>
        <p v-reveal.150 class="t-lede !text-on-night-muted lg:col-span-4 lg:col-start-9">
          {{ lw.subheading }}
        </p>
      </div>

      <div class="mt-14 grid items-start gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-8">
        <!-- ── The screen ─────────────────────────────────────────────── -->
        <div class="lg:col-span-8">
          <NuxtLink
            v-reveal="'unveil'"
            to="/live-streams"
            class="group relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden bg-night-raised sm:aspect-video"
            :aria-label="
              isLive && stream ? `Current live stream: ${stream.title}` : 'No live stream active'
            "
          >
            <img
              v-if="thumb"
              :src="thumb"
              alt=""
              class="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              loading="lazy"
              aria-hidden="true"
            />
            <div class="absolute inset-0 z-[1] bg-night/55" aria-hidden="true"></div>

            <!-- Status, set in the corner like a broadcast slate -->
            <div class="absolute top-5 left-5 z-[2] sm:top-7 sm:left-7">
              <div
                v-if="isLive"
                class="t-label inline-flex items-center gap-2 bg-live px-3 py-1.5 text-white"
                aria-label="This stream is currently live"
              >
                <span class="live-dot"></span>
                Live now
              </div>
              <div v-else class="t-label inline-flex items-center gap-2 text-on-night-muted">
                <span class="size-1.5 rounded-full bg-on-night-muted"></span>
                Off air
              </div>
            </div>
            <div
              v-if="isLive"
              class="num t-label absolute top-5 right-5 z-[2] inline-flex items-center gap-2 text-on-night sm:top-7 sm:right-7"
            >
              <Icon icon="mdi:account-multiple-outline" class="size-4" aria-hidden="true" />
              <span>{{ (stream?.viewerCount ?? 0).toLocaleString() }} watching</span>
            </div>

            <!-- Content layer -->
            <div class="relative z-[2] flex w-full flex-col items-center gap-4 px-6 text-center">
              <span
                class="flex size-20 items-center justify-center rounded-full border border-on-night/40 text-on-night transition-[transform,background-color,border-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:border-champagne group-hover:bg-champagne group-hover:text-night sm:size-24"
                aria-hidden="true"
              >
                <Icon icon="mdi:play" class="size-8 translate-x-0.5" />
              </span>
              <p v-if="isLive" class="t-h3 text-on-night">Worship With Us Now</p>
              <p v-else class="t-h3 text-on-night">No Live Stream Currently</p>
              <p v-if="isLive" class="text-base text-on-night-muted">
                {{ stream?.city ?? 'Ekot Ekpene' }}, Nigeria
              </p>
              <p v-else class="text-base text-on-night-muted">Check back on Sundays at 9:00 AM</p>
            </div>
          </NuxtLink>

          <!-- Info bar -->
          <div
            v-reveal.200
            class="flex flex-col gap-5 border-b border-on-night/15 py-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div v-if="isLive">
              <p class="font-display text-2xl text-on-night">{{ lw.nextTitle }}</p>
              <p class="mt-1 text-base text-on-night-muted">{{ lw.moderatorLabel }}</p>
            </div>
            <div v-else>
              <p class="font-display text-2xl text-on-night">
                <span class="text-on-night-muted italic">Next:</span> {{ lw.nextTitle }}
              </p>
              <p class="num mt-1 text-base text-on-night-muted">{{ lw.nextSchedule }}</p>
            </div>

            <NuxtLink
              v-if="isLive"
              to="/live-streams"
              class="btn btn-light shrink-0"
              :aria-label="`Watch ${stream?.title ?? 'live stream'} live now`"
            >
              {{ lw.watchCtaLabel }}
              <Icon icon="mdi:arrow-right" class="btn-arrow size-5" />
            </NuxtLink>
            <NuxtLink
              v-else
              to="/live-streams"
              class="btn btn-ghost-light shrink-0"
              :aria-label="`Set reminder for ${lw.nextTitle}`"
            >
              {{ lw.reminderCtaLabel }}
            </NuxtLink>
          </div>
        </div>

        <!-- ── Recent services ───────────────────────────────────────── -->
        <div class="lg:col-span-4">
          <h3 v-reveal class="t-label text-champagne">{{ lw.recentHeading }}</h3>

          <ol class="mt-5 border-t border-on-night/15 empty:hidden">
            <li v-for="(rs, i) in recentStreams" :key="rs.id" v-reveal="{ delay: 100 + i * 90 }">
              <NuxtLink
                :to="`/live-streams`"
                class="recent-row group"
                :aria-label="`${rs.title}, ${rs.date}, ${rs.views} views`"
              >
                <span class="num font-display text-2xl leading-none text-on-night/35 italic">{{
                  String(i + 1).padStart(2, '0')
                }}</span>
                <span class="min-w-0 flex-1">
                  <span
                    class="block text-lg leading-snug font-medium text-on-night transition-colors duration-300 group-hover:text-champagne"
                    >{{ rs.title }}</span
                  >
                  <span class="num mt-1.5 block text-sm text-on-night-muted">
                    {{ rs.date }}&nbsp;&nbsp;·&nbsp;&nbsp;{{ rs.views.toLocaleString() }} views
                  </span>
                </span>
                <Icon
                  icon="mdi:arrow-top-right"
                  class="mt-1 size-4 shrink-0 text-on-night-muted transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-champagne"
                  aria-hidden="true"
                />
              </NuxtLink>
            </li>
          </ol>

          <p
            v-if="!recentStreams.length"
            class="mt-5 border border-dashed border-on-night/25 px-5 py-8 text-center text-base text-on-night-muted"
          >
            No past streams have been published yet.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.live-dot {
  width: 7px;
  height: 7px;
  background: white;
  border-radius: 50%;
  animation: pulse-dot 1.4s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.75);
  }
}

/* Ruled entries on the night field */
.recent-row {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.375rem 0;
  border-bottom: 1px solid rgb(243 239 230 / 0.15);
  text-decoration: none;
}
</style>
