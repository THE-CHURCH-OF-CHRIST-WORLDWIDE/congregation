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

const teachingsOpen = ref(false)
const mobileOpen = ref(false)
let teachingsTimer: ReturnType<typeof setTimeout> | null = null

const scrolled = ref(false)
function handleScroll() {
  scrolled.value = window.scrollY > 24
}
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

onBeforeUnmount(() => {
  if (teachingsTimer) clearTimeout(teachingsTimer)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b bg-surface/95 backdrop-blur-sm transition-[box-shadow,border-color] duration-300"
    :class="scrolled ? 'border-rule shadow-md' : 'border-transparent shadow-none'"
  >
    <!-- Bookcloth head strip: the register's binding -->
    <div class="bookcloth h-1" aria-hidden="true"></div>
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2.5 sm:px-6 lg:px-8"
    >
      <!-- Logo: church seal -->
      <!-- When the landing page is hidden the seal stays, but stops being a link to a 404. -->
      <component
        :is="isHidden('/') ? 'div' : resolveComponent('NuxtLink')"
        :to="isHidden('/') ? undefined : '/'"
        class="group flex min-w-0 shrink items-center gap-3 rounded-md"
        :aria-label="isHidden('/') ? undefined : 'Church of Christ home'"
      >
        <div
          class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-secondary bg-surface shadow-xs"
        >
          <!-- Church seal SVG -->
          <svg viewBox="0 0 100 100" class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <circle cx="50" cy="50" r="50" fill="white" />
            <!-- Inner ring -->
            <circle cx="50" cy="50" r="44" fill="none" stroke="#24364F" stroke-width="0.8" />

            <!-- Open Bible (center) -->
            <g transform="translate(50,50)">
              <!-- Left page -->
              <path
                d="M-18,-12 Q-18,-15 -12,-15 L0,-15 L0,15 L-12,15 Q-18,15 -18,12 Z"
                fill="#FFFFFF"
                stroke="#8A5D0F"
                stroke-width="1.2"
              />
              <!-- Right page -->
              <path
                d="M18,-12 Q18,-15 12,-15 L0,-15 L0,15 L12,15 Q18,15 18,12 Z"
                fill="#FFFFFF"
                stroke="#8A5D0F"
                stroke-width="1.2"
              />
              <!-- Spine -->
              <rect x="-1.5" y="-15" width="3" height="30" fill="#8A5D0F" />
              <!-- Lines left -->
              <line x1="-15" y1="-6" x2="-3" y2="-6" stroke="#8A5D0F" stroke-width="0.8" />
              <line x1="-15" y1="-1" x2="-3" y2="-1" stroke="#8A5D0F" stroke-width="0.8" />
              <line x1="-15" y1="4" x2="-3" y2="4" stroke="#8A5D0F" stroke-width="0.8" />
              <line x1="-15" y1="9" x2="-3" y2="9" stroke="#8A5D0F" stroke-width="0.8" />
              <!-- Lines right -->
              <line x1="3" y1="-6" x2="15" y2="-6" stroke="#8A5D0F" stroke-width="0.8" />
              <line x1="3" y1="-1" x2="15" y2="-1" stroke="#8A5D0F" stroke-width="0.8" />
              <line x1="3" y1="4" x2="15" y2="4" stroke="#8A5D0F" stroke-width="0.8" />
              <line x1="3" y1="9" x2="15" y2="9" stroke="#8A5D0F" stroke-width="0.8" />
            </g>

            <!-- "CHURCH OF CHRIST" curved top text -->
            <defs>
              <path id="topCurve" d="M 16,50 A 34,34 0 0 1 84,50" />
              <path id="botCurve" d="M 22,56 A 28,28 0 0 0 78,56" />
            </defs>
            <text
              font-size="8.5"
              font-family="Georgia, serif"
              fill="#24364F"
              font-weight="bold"
              letter-spacing="0.6"
            >
              <textPath href="#topCurve" startOffset="50%" text-anchor="middle">
                CHURCH OF CHRIST
              </textPath>
            </text>

            <!-- Stars bottom left & right -->
            <text x="22" y="78" font-size="7" fill="#24364F" text-anchor="middle">★</text>
            <text x="78" y="78" font-size="7" fill="#24364F" text-anchor="middle">★</text>

            <!-- "Rom 16:16" bottom curved text -->
            <text font-size="7" font-family="Georgia, serif" fill="#24364F" letter-spacing="0.8">
              <textPath href="#botCurve" startOffset="50%" text-anchor="middle">Rom 16:16</textPath>
            </text>
          </svg>
        </div>
        <span
          v-if="settingsStore.settings.name"
          class="hidden max-w-[14rem] truncate font-display text-[17px] leading-tight font-semibold text-secondary sm:block lg:max-w-[12rem] xl:max-w-[16rem]"
        >
          {{ settingsStore.settings.name }}
        </span>
      </component>

      <!-- Desktop nav -->
      <ul class="hidden items-center gap-6 lg:flex xl:gap-7">
        <!-- Static links -->
        <li v-if="!isHidden('/') && isNavItemVisible('home')">
          <NuxtLink
            to="/"
            class="min-h-11 inline-flex items-center border-b-2 border-transparent text-[15px] font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
            exact-active-class="!border-primary !text-primary-ink"
            aria-label="Home"
            >Home</NuxtLink
          >
        </li>
        <li v-if="!isHidden('/live-streams') && isNavItemVisible('liveStreams')">
          <NuxtLink
            to="/live-streams"
            class="min-h-11 inline-flex items-center border-b-2 border-transparent text-[15px] font-medium text-ink-muted transition-colors duration-150 hover:text-ink gap-2"
            active-class="!border-primary !text-primary-ink"
            :class="liveStore.isLive ? '!text-live' : ''"
            aria-label="Live Streams"
          >
            <span v-if="liveStore.isLive" class="relative flex size-2.5">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75"
              ></span>
              <span class="relative inline-flex size-2.5 rounded-full bg-live"></span>
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
            class="min-h-11 inline-flex items-center border-b-2 border-transparent text-[15px] font-medium text-ink-muted transition-colors duration-150 hover:text-ink gap-1"
            :class="$route.path.startsWith('/teachings') ? '!border-primary !text-primary-ink' : ''"
            :aria-expanded="teachingsOpen"
            aria-haspopup="true"
            @click="teachingsOpen ? (teachingsOpen = false) : openTeachings()"
          >
            Teachings
            <Icon
              icon="mdi:chevron-down"
              class="size-4 transition-transform duration-200"
              :class="teachingsOpen ? 'rotate-180' : ''"
            />
          </button>

          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-if="teachingsOpen"
              class="absolute top-full left-1/2 mt-2 w-80 -translate-x-1/2 overflow-hidden rounded-lg border border-rule bg-surface shadow-lg"
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
                  class="flex items-start gap-3.5 px-4 py-3.5 transition-colors hover:bg-surface-muted"
                  @click="teachingsOpen = false"
                >
                  <div
                    class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-soft"
                  >
                    <Icon :icon="link.icon" class="size-[18px] text-primary-ink" />
                  </div>
                  <div>
                    <p class="font-display text-[15px] font-semibold text-ink">{{ link.label }}</p>
                    <p class="mt-0.5 text-sm leading-snug text-ink-muted">{{ link.desc }}</p>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </li>

        <li v-if="!isHidden('/events') && isNavItemVisible('events')">
          <NuxtLink
            to="/events"
            class="min-h-11 inline-flex items-center border-b-2 border-transparent text-[15px] font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
            active-class="!border-primary !text-primary-ink"
            aria-label="Events"
            >Events</NuxtLink
          >
        </li>
        <li v-if="!isHidden('/lectureship') && isNavItemVisible('lectureship')">
          <NuxtLink
            to="/lectureship"
            class="min-h-11 inline-flex items-center border-b-2 border-transparent text-[15px] font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
            active-class="!border-primary !text-primary-ink"
            aria-label="Lectureship"
            >Lectureship</NuxtLink
          >
        </li>
        <li v-if="isNavItemVisible('gallery')">
          <NuxtLink
            to="/gallery/sunday-service"
            class="min-h-11 inline-flex items-center border-b-2 border-transparent text-[15px] font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
            active-class="!border-primary !text-primary-ink"
            aria-label="Gallery"
            >Gallery</NuxtLink
          >
        </li>
        <li v-if="!isHidden('/about-us') && isNavItemVisible('aboutUs')">
          <NuxtLink
            to="/about-us"
            class="min-h-11 inline-flex items-center border-b-2 border-transparent text-[15px] font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
            active-class="!border-primary !text-primary-ink"
            aria-label="About Us"
            >About Us</NuxtLink
          >
        </li>
        <li v-if="isNavItemVisible('contactUs')">
          <a
            href="/#contact"
            class="min-h-11 inline-flex items-center border-b-2 border-transparent text-[15px] font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
            aria-label="Contact Us"
            >Contact Us</a
          >
        </li>
        <li v-if="isNavItemVisible('register')">
          <NuxtLink
            to="/register"
            class="inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-[15px] font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary-hover active:bg-primary-active"
            aria-label="Member Registration"
            >Register</NuxtLink
          >
        </li>
      </ul>

      <!-- Mobile hamburger -->
      <button
        class="-mr-2 inline-flex size-12 shrink-0 items-center justify-center rounded-md text-ink hover:bg-surface-sunken lg:hidden"
        :aria-expanded="mobileOpen"
        aria-label="Toggle menu"
        @click="mobileOpen = !mobileOpen"
      >
        <Icon :icon="mobileOpen ? 'mdi:close' : 'mdi:menu'" class="size-7" />
      </button>
    </nav>

    <!-- Mobile menu (slide-down) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="mobileOpen"
        class="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-rule bg-surface shadow-lg lg:hidden"
      >
        <div class="mx-auto max-w-7xl px-3 py-3 sm:px-5">
          <ul class="flex flex-col gap-0.5">
            <li v-if="!isHidden('/') && isNavItemVisible('home')">
              <NuxtLink
                to="/"
                class="flex min-h-12 items-center rounded-md px-3 text-base font-medium text-ink hover:bg-surface-muted"
                exact-active-class="!bg-primary-soft !text-primary-ink"
                @click="mobileOpen = false"
              >
                Home
              </NuxtLink>
            </li>
            <li v-if="!isHidden('/live-streams') && isNavItemVisible('liveStreams')">
              <NuxtLink
                to="/live-streams"
                class="flex min-h-12 items-center rounded-md px-3 text-base font-medium text-ink hover:bg-surface-muted gap-2.5"
                active-class="!bg-primary-soft !text-primary-ink"
                @click="mobileOpen = false"
              >
                <span v-if="liveStore.isLive" class="relative flex size-2.5">
                  <span
                    class="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75"
                  ></span>
                  <span class="relative inline-flex size-2.5 rounded-full bg-live"></span>
                </span>
                Live Streams
              </NuxtLink>
            </li>
            <li v-if="teachingLinks.length">
              <button
                class="flex min-h-12 items-center rounded-md px-3 text-base font-medium text-ink hover:bg-surface-muted w-full justify-between"
                :aria-expanded="teachingsOpen"
                @click="teachingsOpen = !teachingsOpen"
              >
                Teachings
                <Icon
                  icon="mdi:chevron-down"
                  class="size-5 text-ink-subtle transition-transform"
                  :class="teachingsOpen ? 'rotate-180' : ''"
                />
              </button>
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
              >
                <ul
                  v-if="teachingsOpen"
                  class="mt-0.5 ml-5 flex flex-col gap-0.5 border-l border-rule pl-3"
                >
                  <li v-for="link in teachingLinks" :key="link.label">
                    <NuxtLink
                      :to="link.to"
                      class="flex min-h-11 items-center gap-2.5 rounded-md px-3 text-[15px] text-ink-muted hover:bg-surface-muted hover:text-ink"
                      active-class="!bg-primary-soft !text-primary-ink"
                      @click="closeMobileMenu"
                    >
                      <Icon :icon="link.icon" class="size-[18px] text-primary-ink" />
                      {{ link.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </Transition>
            </li>
            <li v-if="!isHidden('/events') && isNavItemVisible('events')">
              <NuxtLink
                to="/events"
                active-class="!bg-primary-soft !text-primary-ink"
                class="flex min-h-12 items-center rounded-md px-3 text-base font-medium text-ink hover:bg-surface-muted"
                @click="mobileOpen = false"
                >Events</NuxtLink
              >
            </li>
            <li v-if="!isHidden('/lectureship') && isNavItemVisible('lectureship')">
              <NuxtLink
                to="/lectureship"
                active-class="!bg-primary-soft !text-primary-ink"
                class="flex min-h-12 items-center rounded-md px-3 text-base font-medium text-ink hover:bg-surface-muted"
                @click="mobileOpen = false"
                >Lectureship</NuxtLink
              >
            </li>
            <li v-if="isNavItemVisible('gallery')">
              <NuxtLink
                to="/gallery/sunday-service"
                active-class="!bg-primary-soft !text-primary-ink"
                class="flex min-h-12 items-center rounded-md px-3 text-base font-medium text-ink hover:bg-surface-muted"
                @click="mobileOpen = false"
                >Gallery</NuxtLink
              >
            </li>
            <li v-if="!isHidden('/about-us') && isNavItemVisible('aboutUs')">
              <NuxtLink
                to="/about-us"
                active-class="!bg-primary-soft !text-primary-ink"
                class="flex min-h-12 items-center rounded-md px-3 text-base font-medium text-ink hover:bg-surface-muted"
                @click="mobileOpen = false"
                >About Us</NuxtLink
              >
            </li>
            <li v-if="isNavItemVisible('contactUs')">
              <a
                href="/#contact"
                class="flex min-h-12 items-center rounded-md px-3 text-base font-medium text-ink hover:bg-surface-muted"
                @click="mobileOpen = false"
              >
                Contact Us
              </a>
            </li>
            <li v-if="isNavItemVisible('register')" class="mt-2 border-t border-rule pt-3">
              <NuxtLink
                to="/register"
                class="flex min-h-12 items-center justify-center rounded-md bg-primary px-3 text-base font-semibold text-on-primary hover:bg-primary-hover"
                @click="mobileOpen = false"
                >Register</NuxtLink
              >
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </header>
</template>
