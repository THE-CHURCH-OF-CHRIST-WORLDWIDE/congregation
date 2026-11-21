<script setup lang="ts">
const liveStore = usePublicLiveStreamStore()
const settingsStore = useChurchSettingsStore()
onMounted(() => settingsStore.load())

const isLive = computed(() => liveStore.isLive && !!liveStore.currentStream)
const stream = computed(() => liveStore.currentStream)
const recentStreams = computed(() => liveStore.recordedStreams.slice(0, 4))
const lw = computed(() => settingsStore.settings.liveWorship)

const { el: sectionRef, isVisible } = useScrollReveal()
</script>

<template>
  <section ref="sectionRef" class="bookcloth py-16 md:py-24" aria-label="Live worship stream">
    <div class="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <!-- Heading -->
      <div class="mb-10 max-w-2xl md:mb-12">
        <h2
          :class="[
            'font-display text-[1.875rem] leading-[1.15] font-bold text-white md:text-[2.5rem]',
            'reveal',
            isVisible && 'is-visible',
          ]"
        >
          {{ lw.heading }}
        </h2>
        <p
          :class="[
            'mt-3 text-lg leading-relaxed text-white/80',
            'reveal',
            'delay-100',
            isVisible && 'is-visible',
          ]"
        >
          {{ lw.subheading }}
        </p>
      </div>

      <!-- Two-column grid -->
      <div class="grid items-start gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <!-- ── Left: live card ───────────────────────────────────────── -->
        <div
          :class="[
            'overflow-hidden rounded-lg bg-surface text-ink shadow-lg',
            'reveal-left',
            'delay-200',
            isVisible && 'is-visible',
          ]"
        >
          <!-- Dark preview area -->
          <div
            class="relative flex min-h-56 w-full flex-col items-center justify-center sm:aspect-video"
            :aria-label="
              isLive && stream ? `Current live stream: ${stream.title}` : 'No live stream active'
            "
          >
            <!-- Background image -->
            <img
              :src="
                displayableImageUrl(stream?.thumbnailSrc) ??
                'https://picsum.photos/seed/live-bg/800/500'
              "
              alt=""
              class="absolute inset-0 z-0 h-full w-full object-cover"
              loading="eager"
              aria-hidden="true"
            />
            <!-- Dark overlay -->
            <div class="absolute inset-0 z-[1] bg-black/60" aria-hidden="true"></div>

            <!-- Content layer -->
            <div class="relative z-[2] flex w-full flex-col items-center gap-3 px-6 text-center">
              <!-- Radio wave SVG -->
              <svg
                width="52"
                height="52"
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                :style="isLive ? '' : 'opacity: 0.4'"
              >
                <!-- Center dot -->
                <circle cx="26" cy="26" r="4" fill="white" />
                <!-- Inner arc -->
                <path
                  d="M18 26 a8 8 0 0 1 8-8"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  opacity="1"
                />
                <path
                  d="M34 26 a8 8 0 0 0-8-8"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  opacity="1"
                />
                <!-- Mid arc -->
                <path
                  d="M12 26 a14 14 0 0 1 14-14"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  opacity="0.7"
                />
                <path
                  d="M40 26 a14 14 0 0 0-14-14"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  opacity="0.7"
                />
                <!-- Outer arc -->
                <path
                  d="M6 26 a20 20 0 0 1 20-20"
                  stroke="white"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  opacity="0.4"
                />
                <path
                  d="M46 26 a20 20 0 0 0-20-20"
                  stroke="white"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  opacity="0.4"
                />
              </svg>

              <!-- LIVE NOW badge or offline -->
              <div
                v-if="isLive"
                class="inline-flex items-center gap-2 rounded-sm bg-live px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-white"
                aria-label="This stream is currently live"
              >
                <span class="live-dot"></span>
                LIVE NOW
              </div>

              <!-- Stream title -->
              <p v-if="isLive" class="font-display text-xl font-bold text-white sm:text-2xl">
                Worship With Us Now
              </p>
              <p v-else class="font-display text-xl font-bold text-white sm:text-2xl">
                No Live Stream Currently
              </p>

              <!-- Location / offline sub -->
              <p v-if="isLive" class="text-base text-white/85">
                {{ stream?.city ?? 'Ekot Ekpene' }}, Nigeria
              </p>
              <p v-else class="text-base text-white/80">Check back on Sundays at 9:00 AM</p>

              <!-- Viewer count -->
              <div v-if="isLive" class="num inline-flex items-center gap-1.5 text-sm text-white/90">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>{{ (stream?.viewerCount ?? 0).toLocaleString() }} watching</span>
              </div>
            </div>
          </div>

          <!-- Info bar -->
          <div
            class="flex flex-col gap-4 border-t border-rule px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <div v-if="isLive">
              <p class="font-display text-lg font-semibold text-ink">{{ lw.nextTitle }}</p>
              <p class="mt-0.5 text-base text-ink-muted">{{ lw.moderatorLabel }}</p>
            </div>
            <div v-else>
              <p class="font-display text-lg font-semibold text-ink">Next: {{ lw.nextTitle }}</p>
              <p class="mt-0.5 text-base text-ink-muted">{{ lw.nextSchedule }}</p>
            </div>

            <NuxtLink
              v-if="isLive"
              to="/live-streams"
              class="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-semibold whitespace-nowrap text-on-primary shadow-xs transition-colors duration-150 hover:bg-primary-hover"
              :aria-label="`Watch ${stream?.title ?? 'live stream'} live now`"
            >
              {{ lw.watchCtaLabel }}
            </NuxtLink>
            <NuxtLink
              v-else
              to="/live-streams"
              class="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-rule-strong bg-surface px-5 text-base font-semibold whitespace-nowrap text-ink shadow-xs transition-colors duration-150 hover:border-ink-subtle hover:bg-surface-muted"
              :aria-label="`Set reminder for ${lw.nextTitle}`"
            >
              {{ lw.reminderCtaLabel }}
            </NuxtLink>
          </div>
        </div>

        <!-- ── Right: recent streams ─────────────────────────────────── -->
        <div :class="['reveal-right', 'delay-300', isVisible && 'is-visible']">
          <h3 class="font-display text-xl font-semibold text-white">{{ lw.recentHeading }}</h3>

          <div class="mt-4 border-y border-white/20 empty:hidden">
            <NuxtLink
              v-for="(rs, i) in recentStreams"
              :key="rs.id"
              :to="`/live-streams`"
              :class="['recent-row', isVisible && 'is-visible']"
              :style="{ transitionDelay: isVisible ? `${350 + i * 75}ms` : '0ms' }"
              :aria-label="`${rs.title}, ${rs.date}, ${rs.views} views`"
            >
              <p class="num text-sm text-white/70">
                {{ rs.date }}&nbsp;&nbsp;&bull;&nbsp;&nbsp;{{ rs.views.toLocaleString() }} views
              </p>
              <p class="mt-1 text-lg leading-snug font-semibold text-white">{{ rs.title }}</p>
            </NuxtLink>
          </div>

          <p
            v-if="!recentStreams.length"
            class="mt-4 rounded-md border border-dashed border-white/30 px-5 py-6 text-center text-base text-white/80"
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
  width: 8px;
  height: 8px;
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

/* Ruled entries on the bookcloth; each row rises in on its own delay */
.recent-row {
  display: block;
  padding: 1rem 0.25rem;
  text-decoration: none;
  opacity: 0;
  transform: translateY(12px);
  transition:
    background-color 0.15s,
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.recent-row + .recent-row {
  border-top: 1px solid rgb(255 255 255 / 0.2);
}

.recent-row.is-visible {
  opacity: 1;
  transform: none;
}

.recent-row:hover {
  background-color: rgb(255 255 255 / 0.06);
}
</style>
