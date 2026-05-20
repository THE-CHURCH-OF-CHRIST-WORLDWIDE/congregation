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
  <section ref="sectionRef" class="teaser-section" aria-label="Live worship stream">
    <div class="teaser-container">
      <!-- Heading -->
      <h2 :class="['teaser-heading', 'reveal', isVisible && 'is-visible']">
        {{ lw.heading }}
      </h2>
      <p :class="['teaser-sub', 'reveal', 'delay-100', isVisible && 'is-visible']">
        {{ lw.subheading }}
      </p>

      <!-- Two-column grid -->
      <div class="teaser-grid">
        <!-- ── Left: live card ───────────────────────────────────────── -->
        <div :class="['live-card', 'reveal-left', 'delay-200', isVisible && 'is-visible']">
          <!-- Dark preview area -->
          <div
            class="live-preview"
            :aria-label="
              isLive && stream ? `Current live stream: ${stream.title}` : 'No live stream active'
            "
          >
            <!-- Background image -->
            <img
              :src="stream?.thumbnailSrc ?? 'https://picsum.photos/seed/live-bg/800/500'"
              alt=""
              class="live-preview-img"
              loading="eager"
              aria-hidden="true"
            />
            <!-- Dark overlay -->
            <div class="live-overlay" aria-hidden="true"></div>

            <!-- Content layer -->
            <div class="live-content">
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
              <div v-if="isLive" class="live-badge" aria-label="This stream is currently live">
                <span class="live-dot"></span>
                LIVE NOW
              </div>

              <!-- Stream title -->
              <p v-if="isLive" class="live-title">Worship With Us Now</p>
              <p v-else class="live-title">No Live Stream Currently</p>

              <!-- Location / offline sub -->
              <p v-if="isLive" class="live-location">
                {{ stream?.city ?? 'Ekot Ekpene' }}, Nigeria
              </p>
              <p v-else class="live-location" style="opacity: 0.7">
                Check back on Sundays at 9:00 AM
              </p>

              <!-- Viewer count -->
              <div v-if="isLive" class="live-viewers">
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

          <!-- White info bar -->
          <div class="live-info-bar">
            <div v-if="isLive">
              <p class="live-stream-name">{{ lw.nextTitle }}</p>
              <p class="live-moderator">{{ lw.moderatorLabel }}</p>
            </div>
            <div v-else>
              <p class="live-stream-name">Next: {{ lw.nextTitle }}</p>
              <p class="live-moderator">{{ lw.nextSchedule }}</p>
            </div>

            <NuxtLink
              v-if="isLive"
              to="/live-streams"
              class="watch-btn"
              :aria-label="`Watch ${stream?.title ?? 'live stream'} live now`"
            >
              {{ lw.watchCtaLabel }}
            </NuxtLink>
            <NuxtLink
              v-else
              to="/live-streams"
              class="reminder-btn"
              :aria-label="`Set reminder for ${lw.nextTitle}`"
            >
              {{ lw.reminderCtaLabel }}
            </NuxtLink>
          </div>
        </div>

        <!-- ── Right: recent streams ─────────────────────────────────── -->
        <div :class="['reveal-right', 'delay-300', isVisible && 'is-visible']">
          <h3 class="recent-heading">{{ lw.recentHeading }}</h3>

          <NuxtLink
            v-for="(rs, i) in recentStreams"
            :key="rs.id"
            :to="`/live-streams`"
            :class="['recent-row', isVisible && 'is-visible']"
            :style="{ transitionDelay: isVisible ? `${350 + i * 75}ms` : '0ms' }"
            :aria-label="`${rs.title}, ${rs.date}, ${rs.views} views`"
          >
            <p class="recent-meta">
              {{ rs.date }}&nbsp;&nbsp;&bull;&nbsp;&nbsp;{{ rs.views.toLocaleString() }} views
            </p>
            <p class="recent-title">{{ rs.title }}</p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.teaser-section {
  background: #f3f4f6;
  padding: 64px 24px;
}

.teaser-container {
  max-width: 860px;
  margin: 0 auto;
}

.teaser-heading {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 10px;
}

.teaser-sub {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  max-width: 560px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.teaser-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: flex-start;
}

/* ── Live card ── */
.live-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background: white;
}

.live-preview {
  height: 280px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.live-preview-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.live-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1;
}

.live-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #dc2626;
  color: white;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 6px 14px;
  border-radius: 9999px;
}

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

.live-title {
  color: white;
  font-size: 20px;
  font-weight: 700;
  font-family: Georgia, serif;
  text-align: center;
}

.live-location {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  text-align: center;
}

.live-viewers {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.live-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;
  background: white;
}

.live-stream-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2px;
}

.live-moderator {
  font-size: 12px;
  color: #6b7280;
}

.watch-btn {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  transition: background 0.15s;
  flex-shrink: 0;
}

.watch-btn:hover {
  background: #b91c1c;
}

.reminder-btn {
  border: 1px solid #dc2626;
  color: #dc2626;
  background: white;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  transition:
    background 0.15s,
    color 0.15s;
  flex-shrink: 0;
}

.reminder-btn:hover {
  background: #dc2626;
  color: white;
}

/* ── Recent streams ── */
.recent-heading {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
}

.recent-row {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 10px;
  cursor: pointer;
  text-decoration: none;
  display: block;
  opacity: 0;
  transform: translateY(12px);
  transition:
    border-color 0.15s,
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.recent-row.is-visible {
  opacity: 1;
  transform: none;
}

.recent-row:hover {
  border-color: #93c5fd;
}

.recent-meta {
  font-size: 12px;
  color: #9ca3af;
}

.recent-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-top: 4px;
}

@media (max-width: 680px) {
  .teaser-grid {
    grid-template-columns: 1fr;
  }
  .live-preview {
    height: 220px;
  }
}
</style>
