<script setup lang="ts">
// Public pages can be hidden in production via STAGING_ONLY_ROUTES; their links must go too,
// or the nav points at a 404.
const { isHidden, visible } = useRouteVisibility()
// ...and an admin can additionally switch any of them off at runtime — see useNavVisibility.
const { isNavItemVisible } = useNavVisibility()

const route = useRoute()
const liveStore = usePublicLiveStreamStore()
const settingsStore = useChurchSettingsStore()

// Backs isNavItemVisible above; every public page renders this navbar, so loading it here means
// no individual page has to remember to. load() is a no-op once the settings doc has arrived.
onMounted(() => settingsStore.load())

// The live badge follows Settings → Live Worship → Live Broadcast, including right after staff save.
watch(
  () => settingsStore.settings.liveStream,
  () => liveStore.fetchLiveStatus(),
  { deep: true, immediate: true }
)

const teachingsOpen = ref(false)
const mobileOpen = ref(false)
let teachingsTimer: ReturnType<typeof setTimeout> | null = null

const scrolled = ref(false)
function handleScroll() {
  scrolled.value = window.scrollY > 24
}

// Over a full-bleed cover (the landing page, or any page that opts in with
// `definePageMeta({ navOverlay: true })`) the bar starts transparent in ivory and
// turns solid once the visitor scrolls; everywhere else it is solid from the top.
const overlay = computed(() => route.path === '/' || route.meta.navOverlay === true)
const transparent = computed(() => overlay.value && !scrolled.value && !mobileOpen.value)

// The full-screen mobile menu owns the viewport while open.
watch(mobileOpen, (open) => {
  if (typeof document !== 'undefined')
    document.documentElement.style.overflow = open ? 'hidden' : ''
})
onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))

function openTeachings() {
  if (teachingsTimer) clearTimeout(teachingsTimer)
  teachingsOpen.value = true
}

function closeTeachings() {
  teachingsTimer = setTimeout(() => {
    teachingsOpen.value = false
  }, 150)
}

function closeMobileMenu() {
  mobileOpen.value = false
  teachingsOpen.value = false
}

watch(route, () => {
  mobileOpen.value = false
  teachingsOpen.value = false
})

const allTeachingLinks = [
  {
    icon: 'mdi:microphone-outline',
    label: 'Sermons',
    desc: 'A curated library of biblical sermons',
    to: '/teachings/sermons',
  },
  {
    icon: 'mdi:school-outline',
    label: 'Sunday School',
    desc: 'In-depth Bible study lessons',
    to: '/teachings/sunday-school',
  },
]

/** Empties when /teachings is hidden, which also removes the dropdown that opens it. */
const teachingLinks = computed(() =>
  isNavItemVisible('teachings') ? visible(allTeachingLinks) : []
)

onMounted(handleScroll)

onBeforeUnmount(() => {
  if (teachingsTimer) clearTimeout(teachingsTimer)
  window.removeEventListener('scroll', handleScroll)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <header
    class="site-header fixed inset-x-0 top-0 z-50 transition-[background-color,color,border-color,backdrop-filter] duration-500"
    :class="[
      transparent
        ? 'is-transparent border-b border-transparent text-on-night'
        : mobileOpen
          ? 'border-b border-rule bg-surface text-ink'
          : 'border-b border-rule bg-surface/92 text-ink backdrop-blur-md',
    ]"
  >
    <nav class="site-container flex h-[var(--nav-h)] items-center justify-between gap-6">
      <!-- Logo: church seal -->
      <!-- When the landing page is hidden the seal stays, but stops being a link to a 404. -->
      <component
        :is="isHidden('/') ? 'div' : resolveComponent('NuxtLink')"
        :to="isHidden('/') ? undefined : '/'"
        class="group relative z-[60] flex min-w-0 shrink items-center gap-3"
        :aria-label="isHidden('/') ? undefined : 'Church of Christ home'"
      >
        <div
          class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface ring-1 transition-[box-shadow] duration-500"
          :class="transparent ? 'ring-on-night/40' : 'ring-rule-strong'"
        >
          <!-- Church seal SVG -->
          <svg viewBox="0 0 100 100" class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <circle cx="50" cy="50" r="50" fill="#FAF8F3" />
            <!-- Inner ring -->
            <circle cx="50" cy="50" r="44" fill="none" stroke="#22211D" stroke-width="0.8" />

            <!-- Open Bible (center) -->
            <g transform="translate(50,50)">
              <!-- Left page -->
              <path
                d="M-18,-12 Q-18,-15 -12,-15 L0,-15 L0,15 L-12,15 Q-18,15 -18,12 Z"
                fill="#FAF8F3"
                stroke="#8A6A3B"
                stroke-width="1.2"
              />
              <!-- Right page -->
              <path
                d="M18,-12 Q18,-15 12,-15 L0,-15 L0,15 L12,15 Q18,15 18,12 Z"
                fill="#FAF8F3"
                stroke="#8A6A3B"
                stroke-width="1.2"
              />
              <!-- Spine -->
              <rect x="-1.5" y="-15" width="3" height="30" fill="#8A6A3B" />
              <!-- Lines left -->
              <line x1="-15" y1="-6" x2="-3" y2="-6" stroke="#8A6A3B" stroke-width="0.8" />
              <line x1="-15" y1="-1" x2="-3" y2="-1" stroke="#8A6A3B" stroke-width="0.8" />
              <line x1="-15" y1="4" x2="-3" y2="4" stroke="#8A6A3B" stroke-width="0.8" />
              <line x1="-15" y1="9" x2="-3" y2="9" stroke="#8A6A3B" stroke-width="0.8" />
              <!-- Lines right -->
              <line x1="3" y1="-6" x2="15" y2="-6" stroke="#8A6A3B" stroke-width="0.8" />
              <line x1="3" y1="-1" x2="15" y2="-1" stroke="#8A6A3B" stroke-width="0.8" />
              <line x1="3" y1="4" x2="15" y2="4" stroke="#8A6A3B" stroke-width="0.8" />
              <line x1="3" y1="9" x2="15" y2="9" stroke="#8A6A3B" stroke-width="0.8" />
            </g>

            <!-- "CHURCH OF CHRIST" curved top text -->
            <defs>
              <path id="topCurve" d="M 16,50 A 34,34 0 0 1 84,50" />
              <path id="botCurve" d="M 22,56 A 28,28 0 0 0 78,56" />
            </defs>
            <text
              font-size="8.5"
              font-family="Georgia, serif"
              fill="#22211D"
              font-weight="bold"
              letter-spacing="0.6"
            >
              <textPath href="#topCurve" startOffset="50%" text-anchor="middle">
                CHURCH OF CHRIST
              </textPath>
            </text>

            <!-- Stars bottom left & right -->
            <text x="22" y="78" font-size="7" fill="#22211D" text-anchor="middle">★</text>
            <text x="78" y="78" font-size="7" fill="#22211D" text-anchor="middle">★</text>

            <!-- "Rom 16:16" bottom curved text -->
            <text font-size="7" font-family="Georgia, serif" fill="#22211D" letter-spacing="0.8">
              <textPath href="#botCurve" startOffset="50%" text-anchor="middle">Rom 16:16</textPath>
            </text>
          </svg>
        </div>
        <span
          v-if="settingsStore.settings.name"
          class="hidden max-w-[15rem] truncate font-display text-[1.375rem] leading-none sm:block lg:max-w-[12rem] xl:max-w-[18rem]"
        >
          {{ settingsStore.settings.name }}
        </span>
      </component>

      <!-- Desktop nav -->
      <ul class="hidden items-center gap-7 lg:flex xl:gap-9">
        <!-- Static links -->
        <li v-if="!isHidden('/') && isNavItemVisible('home')">
          <NuxtLink to="/" class="nav-link" exact-active-class="is-active" aria-label="Home"
            >Home</NuxtLink
          >
        </li>
        <li v-if="!isHidden('/live-streams') && isNavItemVisible('liveStreams')">
          <NuxtLink
            to="/live-streams"
            class="nav-link gap-2"
            active-class="is-active"
            aria-label="Live Streams"
          >
            <span v-if="liveStore.isLive" class="relative flex size-2">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75"
              ></span>
              <span class="relative inline-flex size-2 rounded-full bg-live"></span>
            </span>
            Live Streams
          </NuxtLink>
        </li>

        <!-- Teachings dropdown — opens on hover for pointers, and on click for
             touch and keyboard users, who have no hover to give. -->
        <li
          v-if="teachingLinks.length"
          class="relative"
          @mouseenter="openTeachings"
          @mouseleave="closeTeachings"
        >
          <button
            class="nav-link gap-1"
            :class="$route.path.startsWith('/teachings') ? 'is-active' : ''"
            :aria-expanded="teachingsOpen"
            aria-haspopup="true"
            @click="teachingsOpen ? (teachingsOpen = false) : openTeachings()"
          >
            Teachings
            <Icon
              icon="mdi:chevron-down"
              class="size-4 transition-transform duration-300"
              :class="teachingsOpen ? 'rotate-180' : ''"
            />
          </button>

          <Transition
            enter-active-class="transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            enter-from-class="opacity-0 translate-y-2 [clip-path:inset(0_0_100%_0)]"
            enter-to-class="opacity-100 translate-y-0 [clip-path:inset(0_0_0_0)]"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="teachingsOpen"
              class="absolute top-full left-1/2 mt-3 w-[22rem] -translate-x-1/2 border border-rule bg-surface text-ink shadow-lg"
              @mouseenter="openTeachings"
              @mouseleave="closeTeachings"
            >
              <div class="ruled">
                <!-- NuxtLink, not <a href>: a raw href forces a full page reload
                     and throws away the SPA's loaded state. -->
                <NuxtLink
                  v-for="link in teachingLinks"
                  :key="link.label"
                  :to="link.to"
                  class="group/item flex items-start justify-between gap-4 px-6 py-5 transition-colors duration-300 hover:bg-surface-muted"
                  @click="teachingsOpen = false"
                >
                  <div>
                    <p class="font-display text-2xl leading-none">{{ link.label }}</p>
                    <p class="mt-2 text-sm leading-snug text-ink-muted">{{ link.desc }}</p>
                  </div>
                  <Icon
                    icon="mdi:arrow-top-right"
                    class="mt-1 size-4 shrink-0 text-accent transition-transform duration-500 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5"
                  />
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </li>

        <li v-if="!isHidden('/events') && isNavItemVisible('events')">
          <NuxtLink to="/events" class="nav-link" active-class="is-active" aria-label="Events"
            >Events</NuxtLink
          >
        </li>
        <li v-if="!isHidden('/lectureship') && isNavItemVisible('lectureship')">
          <NuxtLink
            to="/lectureship"
            class="nav-link"
            active-class="is-active"
            aria-label="Lectureship"
            >Lectureship</NuxtLink
          >
        </li>
        <li v-if="isNavItemVisible('gallery')">
          <NuxtLink
            to="/gallery/sunday-service"
            class="nav-link"
            :class="$route.path.startsWith('/gallery') ? 'is-active' : ''"
            aria-label="Gallery"
            >Gallery</NuxtLink
          >
        </li>
        <li v-if="!isHidden('/about-us') && isNavItemVisible('aboutUs')">
          <NuxtLink to="/about-us" class="nav-link" active-class="is-active" aria-label="About Us"
            >About Us</NuxtLink
          >
        </li>
        <li v-if="isNavItemVisible('contactUs')">
          <a href="/#contact" class="nav-link" aria-label="Contact Us">Contact Us</a>
        </li>
        <li v-if="isNavItemVisible('register')">
          <NuxtLink
            to="/register"
            class="btn min-h-11 px-5 text-sm"
            :class="transparent ? 'btn-ghost-light' : 'btn-primary'"
            aria-label="Member Registration"
            >Register</NuxtLink
          >
        </li>
      </ul>

      <!-- Mobile hamburger -->
      <button
        class="relative z-[60] -mr-2 inline-flex size-12 shrink-0 items-center justify-center lg:hidden"
        :aria-expanded="mobileOpen"
        aria-label="Toggle menu"
        @click="mobileOpen = !mobileOpen"
      >
        <span class="burger" :class="{ 'is-open': mobileOpen }" aria-hidden="true">
          <span></span>
          <span></span>
        </span>
      </button>
    </nav>

    <!-- Mobile menu: a full-screen ivory page, links set large in the serif -->
    <Transition name="menu">
      <div
        v-if="mobileOpen"
        class="mobile-menu fixed inset-0 z-[55] overflow-y-auto bg-surface text-ink lg:hidden"
      >
        <div class="site-container flex min-h-full flex-col pt-[calc(var(--nav-h)+1.5rem)] pb-10">
          <ul class="flex flex-col border-t border-rule">
            <li v-if="!isHidden('/') && isNavItemVisible('home')" class="menu-item" style="--i: 0">
              <NuxtLink
                to="/"
                class="menu-link"
                exact-active-class="is-active"
                @click="mobileOpen = false"
              >
                Home
              </NuxtLink>
            </li>
            <li
              v-if="!isHidden('/live-streams') && isNavItemVisible('liveStreams')"
              class="menu-item"
              style="--i: 1"
            >
              <NuxtLink
                to="/live-streams"
                class="menu-link"
                active-class="is-active"
                @click="mobileOpen = false"
              >
                Live Streams
                <span
                  v-if="liveStore.isLive"
                  class="t-label ml-3 inline-flex items-center gap-2 text-live"
                >
                  <span class="relative flex size-2">
                    <span
                      class="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75"
                    ></span>
                    <span class="relative inline-flex size-2 rounded-full bg-live"></span>
                  </span>
                  Live
                </span>
              </NuxtLink>
            </li>
            <li v-if="teachingLinks.length" class="menu-item" style="--i: 2">
              <button
                class="menu-link w-full justify-between"
                :aria-expanded="teachingsOpen"
                @click="teachingsOpen = !teachingsOpen"
              >
                Teachings
                <Icon
                  icon="mdi:plus"
                  class="size-6 text-accent transition-transform duration-500"
                  :class="teachingsOpen ? 'rotate-45' : ''"
                />
              </button>
              <Transition
                enter-active-class="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
              >
                <ul v-if="teachingsOpen" class="flex flex-col pb-4 pl-1">
                  <li v-for="link in teachingLinks" :key="link.label">
                    <NuxtLink
                      :to="link.to"
                      class="flex min-h-11 items-center gap-3 text-lg text-ink-muted hover:text-ink"
                      active-class="!text-primary-ink"
                      @click="closeMobileMenu"
                    >
                      <span class="h-px w-5 bg-accent" aria-hidden="true"></span>
                      {{ link.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </Transition>
            </li>
            <li
              v-if="!isHidden('/events') && isNavItemVisible('events')"
              class="menu-item"
              style="--i: 3"
            >
              <NuxtLink
                to="/events"
                active-class="is-active"
                class="menu-link"
                @click="mobileOpen = false"
                >Events</NuxtLink
              >
            </li>
            <li
              v-if="!isHidden('/lectureship') && isNavItemVisible('lectureship')"
              class="menu-item"
              style="--i: 4"
            >
              <NuxtLink
                to="/lectureship"
                active-class="is-active"
                class="menu-link"
                @click="mobileOpen = false"
                >Lectureship</NuxtLink
              >
            </li>
            <li v-if="isNavItemVisible('gallery')" class="menu-item" style="--i: 5">
              <NuxtLink
                to="/gallery/sunday-service"
                active-class="is-active"
                class="menu-link"
                @click="mobileOpen = false"
                >Gallery</NuxtLink
              >
            </li>
            <li
              v-if="!isHidden('/about-us') && isNavItemVisible('aboutUs')"
              class="menu-item"
              style="--i: 6"
            >
              <NuxtLink
                to="/about-us"
                active-class="is-active"
                class="menu-link"
                @click="mobileOpen = false"
                >About Us</NuxtLink
              >
            </li>
            <li v-if="isNavItemVisible('contactUs')" class="menu-item" style="--i: 7">
              <a href="/#contact" class="menu-link" @click="mobileOpen = false"> Contact Us </a>
            </li>
          </ul>
          <div v-if="isNavItemVisible('register')" class="menu-item mt-auto pt-10" style="--i: 8">
            <NuxtLink
              to="/register"
              class="btn btn-primary w-full min-h-14 text-base"
              @click="mobileOpen = false"
              >Register as a member
              <Icon icon="mdi:arrow-right" class="btn-arrow size-5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.nav-link {
  position: relative;
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  opacity: 0.78;
  transition: opacity 0.3s var(--ease-out-quart);
}
.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.45rem;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.55s var(--ease-out-expo);
}
.nav-link:hover {
  opacity: 1;
}
.nav-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
.nav-link.is-active {
  opacity: 1;
}
.nav-link.is-active::after {
  transform: scaleX(1);
  background: var(--c-accent);
}
.is-transparent .nav-link.is-active::after {
  background: var(--c-champagne);
}

.site-header.is-transparent {
  background: linear-gradient(to bottom, rgb(17 16 14 / 0.45), rgb(17 16 14 / 0));
}

/* Two-line burger that crosses into an X */
.burger {
  position: relative;
  display: block;
  width: 26px;
  height: 12px;
}
.burger span {
  position: absolute;
  left: 0;
  right: 0;
  height: 1.5px;
  background: currentColor;
  transition:
    transform 0.5s var(--ease-out-expo),
    top 0.5s var(--ease-out-expo);
}
.burger span:first-child {
  top: 0;
}
.burger span:last-child {
  top: 10px;
}
.burger.is-open span:first-child {
  top: 5px;
  transform: rotate(45deg);
}
.burger.is-open span:last-child {
  top: 5px;
  transform: rotate(-45deg);
}

.menu-link {
  display: flex;
  min-height: 4rem;
  align-items: center;
  font-family: var(--font-display);
  font-size: clamp(2rem, 8vw, 2.75rem);
  line-height: 1;
  letter-spacing: -0.015em;
  color: var(--c-ink);
  transition: color 0.3s;
}
.menu-link.is-active {
  font-style: italic;
  color: var(--c-primary-ink);
}
.menu-item {
  border-bottom: 1px solid var(--c-rule);
}
.menu-item:last-child {
  border-bottom: 0;
}

/* Menu page: wipes down, then each line rises in sequence */
.menu-enter-active {
  transition: clip-path 0.7s var(--ease-in-out-quint);
}
.menu-leave-active {
  transition: clip-path 0.45s var(--ease-in-out-quint);
}
.menu-enter-from,
.menu-leave-to {
  clip-path: inset(0 0 100% 0);
}
.menu-enter-to,
.menu-leave-from {
  clip-path: inset(0 0 0 0);
}
.menu-enter-active .menu-item {
  animation: menu-rise 0.8s var(--ease-out-expo) both;
  animation-delay: calc(220ms + var(--i, 0) * 50ms);
}
@keyframes menu-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
