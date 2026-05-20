<script setup lang="ts">
const route = useRoute()
const liveStore = usePublicLiveStreamStore()

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

const teachingLinks = [
  {
    icon: 'heroicons:microphone',
    label: 'Sermons',
    desc: 'A curated library of biblical sermons',
    to: '/teachings/sermons',
  },
  {
    icon: 'heroicons:academic-cap',
    label: 'Sunday School',
    desc: 'In-depth Bible study lessons',
    to: '/teachings/sunday-school',
  },
]

onBeforeUnmount(() => {
  if (teachingsTimer) clearTimeout(teachingsTimer)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full transition-[background-color,box-shadow,border-color] duration-300"
    :class="
      scrolled
        ? 'bg-white border-b border-gray-100 shadow-md'
        : 'bg-white/90 backdrop-blur-md border-b border-transparent shadow-sm'
    "
  >
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <!-- Logo: church seal -->
      <NuxtLink to="/" class="flex shrink-0 items-center" aria-label="Church of Christ home">
        <div
          class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-navy"
        >
          <!-- Church seal SVG -->
          <svg viewBox="0 0 100 100" class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <circle cx="50" cy="50" r="50" fill="white" />
            <!-- Inner ring -->
            <circle cx="50" cy="50" r="44" fill="none" stroke="#1E3A5F" stroke-width="0.8" />

            <!-- Open Bible (center) -->
            <g transform="translate(50,50)">
              <!-- Left page -->
              <path
                d="M-18,-12 Q-18,-15 -12,-15 L0,-15 L0,15 L-12,15 Q-18,15 -18,12 Z"
                fill="#f5e6c8"
                stroke="#8B6914"
                stroke-width="1.2"
              />
              <!-- Right page -->
              <path
                d="M18,-12 Q18,-15 12,-15 L0,-15 L0,15 L12,15 Q18,15 18,12 Z"
                fill="#f5e6c8"
                stroke="#8B6914"
                stroke-width="1.2"
              />
              <!-- Spine -->
              <rect x="-1.5" y="-15" width="3" height="30" fill="#8B6914" />
              <!-- Lines left -->
              <line x1="-15" y1="-6" x2="-3" y2="-6" stroke="#8B6914" stroke-width="0.8" />
              <line x1="-15" y1="-1" x2="-3" y2="-1" stroke="#8B6914" stroke-width="0.8" />
              <line x1="-15" y1="4" x2="-3" y2="4" stroke="#8B6914" stroke-width="0.8" />
              <line x1="-15" y1="9" x2="-3" y2="9" stroke="#8B6914" stroke-width="0.8" />
              <!-- Lines right -->
              <line x1="3" y1="-6" x2="15" y2="-6" stroke="#8B6914" stroke-width="0.8" />
              <line x1="3" y1="-1" x2="15" y2="-1" stroke="#8B6914" stroke-width="0.8" />
              <line x1="3" y1="4" x2="15" y2="4" stroke="#8B6914" stroke-width="0.8" />
              <line x1="3" y1="9" x2="15" y2="9" stroke="#8B6914" stroke-width="0.8" />
            </g>

            <!-- "CHURCH OF CHRIST" curved top text -->
            <defs>
              <path id="topCurve" d="M 16,50 A 34,34 0 0 1 84,50" />
              <path id="botCurve" d="M 22,56 A 28,28 0 0 0 78,56" />
            </defs>
            <text
              font-size="8.5"
              font-family="Georgia, serif"
              fill="#1E3A5F"
              font-weight="bold"
              letter-spacing="1.5"
            >
              <textPath href="#topCurve" startOffset="50%" text-anchor="middle">
                CHURCH OF CHRIST
              </textPath>
            </text>

            <!-- Stars bottom left & right -->
            <text x="22" y="78" font-size="7" fill="#1E3A5F" text-anchor="middle">★</text>
            <text x="78" y="78" font-size="7" fill="#1E3A5F" text-anchor="middle">★</text>

            <!-- "Rom 16:16" bottom curved text -->
            <text font-size="7" font-family="Georgia, serif" fill="#1E3A5F" letter-spacing="0.8">
              <textPath href="#botCurve" startOffset="50%" text-anchor="middle">Rom 16:16</textPath>
            </text>
          </svg>
        </div>
      </NuxtLink>

      <!-- Desktop nav -->
      <ul class="hidden items-center gap-7 lg:flex">
        <!-- Static links -->
        <li>
          <NuxtLink
            to="/"
            class="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
            aria-label="Home"
            >Home</NuxtLink
          >
        </li>
        <li>
          <NuxtLink
            to="/live-streams"
            class="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-gray-900"
            :class="liveStore.isLive ? 'text-accent' : 'text-gray-700'"
            aria-label="Live Streams"
          >
            <span v-if="liveStore.isLive" class="relative flex h-2 w-2">
              <span
                class="absolute inline-flex h-full w-full rounded-full bg-live opacity-75 animate-ping"
              ></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-live"></span>
            </span>
            Live Streams
          </NuxtLink>
        </li>

        <!-- Teachings dropdown (hover) -->
        <li class="relative" @mouseenter="openTeachings" @mouseleave="closeTeachings">
          <button
            class="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
            :aria-expanded="teachingsOpen"
            aria-haspopup="true"
          >
            Teachings
            <Icon
              icon="heroicons:chevron-down"
              class="h-4 w-4 transition-transform duration-200"
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
              class="absolute left-0 top-full mt-3 w-72 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl"
              @mouseenter="openTeachings"
              @mouseleave="closeTeachings"
            >
              <a
                v-for="link in teachingLinks"
                :key="link.label"
                :href="link.to"
                class="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50"
              >
                <div
                  class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50"
                >
                  <Icon :icon="link.icon" class="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ link.label }}</p>
                  <p class="text-xs text-gray-500">{{ link.desc }}</p>
                </div>
              </a>
            </div>
          </Transition>
        </li>

        <li>
          <NuxtLink
            to="/events"
            class="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
            active-class="text-blue-600"
            aria-label="Events"
            >Events</NuxtLink
          >
        </li>
        <li>
          <NuxtLink
            to="/gallery/sunday-service"
            class="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
            active-class="text-blue-600"
            aria-label="Gallery"
            >Gallery</NuxtLink
          >
        </li>
        <li>
          <NuxtLink
            to="/about-us"
            class="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
            active-class="text-blue-600"
            aria-label="About Us"
            >About Us</NuxtLink
          >
        </li>
        <li>
          <a
            href="/#contact"
            class="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
            aria-label="Contact Us"
            >Contact Us</a
          >
        </li>
      </ul>

      <!-- Mobile hamburger -->
      <button
        class="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        :aria-expanded="mobileOpen"
        aria-label="Toggle menu"
        @click="mobileOpen = !mobileOpen"
      >
        <Icon :icon="mobileOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" class="h-6 w-6" />
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
      <div v-if="mobileOpen" class="border-t border-gray-100 bg-white lg:hidden">
        <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <ul class="flex flex-col gap-1">
            <li>
              <NuxtLink
                to="/"
                class="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="mobileOpen = false"
              >
                Home
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/live-streams"
                class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="mobileOpen = false"
              >
                <span v-if="liveStore.isLive" class="relative flex h-2 w-2">
                  <span
                    class="absolute inline-flex h-full w-full rounded-full bg-live opacity-75 animate-ping"
                  ></span>
                  <span class="relative inline-flex h-2 w-2 rounded-full bg-live"></span>
                </span>
                Live Streams
              </NuxtLink>
            </li>
            <li>
              <button
                class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="teachingsOpen = !teachingsOpen"
              >
                Teachings
                <Icon
                  icon="heroicons:chevron-down"
                  class="h-4 w-4 transition-transform"
                  :class="teachingsOpen ? 'rotate-180' : ''"
                />
              </button>
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
              >
                <ul v-if="teachingsOpen" class="mt-1 flex flex-col gap-1 pl-4">
                  <li v-for="link in teachingLinks" :key="link.label">
                    <NuxtLink
                      :to="link.to"
                      class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      @click="closeMobileMenu"
                    >
                      <Icon :icon="link.icon" class="h-4 w-4 text-accent" />
                      {{ link.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </Transition>
            </li>
            <li>
              <NuxtLink
                to="/events"
                active-class="text-blue-600 bg-blue-50"
                class="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="mobileOpen = false"
                >Events</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/gallery/sunday-service"
                active-class="text-blue-600 bg-blue-50"
                class="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="mobileOpen = false"
                >Gallery</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/about-us"
                active-class="text-blue-600 bg-blue-50"
                class="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="mobileOpen = false"
                >About Us</NuxtLink
              >
            </li>
            <li>
              <a
                href="/#contact"
                class="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="mobileOpen = false"
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </header>
</template>
