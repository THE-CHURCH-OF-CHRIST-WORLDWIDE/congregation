<script setup lang="ts">
const { el: footerRef, isVisible } = useScrollReveal({ threshold: 0.05 })

// The congregation's own name and address come from Settings → General. The
// "Church of Christ, Worldwide" credit in the bottom bar is deliberately not
// settings-driven: it names the wider fellowship, not this congregation.
const settingsStore = useChurchSettingsStore()

onMounted(() => settingsStore.load())

interface FooterLink {
  label: string
  href: string
  external?: boolean
  icon?: 'github'
}

const { isHidden } = useRouteVisibility()

/**
 * Drops links whose route is hidden in this environment, keeping the original order. External
 * links have no route to hide, so they always stay.
 */
function keep(links: FooterLink[]) {
  return links.filter((link) => link.external || !isHidden(link.href))
}

const allQuickLinks: FooterLink[] = [
  // The congregation finder is a section of the landing page, not a route of its own.
  { label: 'Find a Congregation', href: '/#congregations' },
  { label: 'Watch Live Streams', href: '/live-streams' },
  { label: 'Read Sermons', href: '/teachings/sermons' },
  { label: 'Sunday School Lessons', href: '/teachings/sunday-school' },
  { label: 'About the Church', href: '/about-us' },
]

const allSalvationLinks: FooterLink[] = [
  { label: 'Hear the Gospel', href: '/salvation#hear' },
  { label: 'Believe the Gospel', href: '/salvation#believe' },
  { label: 'Repent of your sins', href: '/salvation#repent' },
  { label: 'Confess Christ', href: '/salvation#confess' },
  { label: 'Get Baptized', href: '/salvation#baptized' },
]

const allResourceLinks: FooterLink[] = [
  { label: 'Biblical Teachings', href: '/teachings/sermons' },
  // The contact form is a section of the landing page, not a route of its own.
  { label: 'Contact Us', href: '/#contact' },
  {
    label: 'Open Source Template',
    href: 'https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation',
    external: true,
    icon: 'github',
  },
]

const quickLinks = computed(() => keep(allQuickLinks))
const salvationLinks = computed(() => keep(allSalvationLinks))
const resourceLinks = computed(() => keep(allResourceLinks))
</script>

<template>
  <footer ref="footerRef" class="bookcloth relative overflow-hidden text-white">
    <!-- Main content -->
    <div class="relative z-10 mx-auto max-w-7xl px-5 pt-14 pb-10 sm:px-6 lg:px-8 lg:pt-16">
      <!-- 4-column grid -->
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12">
        <!-- Col 1: Brand -->
        <div :class="['reveal-left', isVisible && 'is-visible']">
          <!-- Logo + name -->
          <div class="mb-3 flex items-center gap-3">
            <div
              class="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#f2d593]/50 bg-white/5 font-display text-xs font-bold tracking-wide text-[#f2d593]"
            >
              CoC
            </div>
            <p class="font-display text-xl leading-tight font-semibold text-white">
              {{ settingsStore.settings.name }}
            </p>
          </div>

          <!-- Address -->
          <p class="mb-6 flex items-start gap-2 text-[15px] leading-relaxed text-white/75">
            <Icon
              icon="mdi:map-marker-outline"
              class="mt-1 shrink-0 text-[#f2d593]"
              aria-hidden="true"
            />
            {{ settingsStore.settings.address }}
          </p>

          <!-- Scripture -->
          <blockquote
            class="mb-7 max-w-[320px] border-l border-[#f2d593]/40 pl-4 text-[15px] leading-relaxed text-white/75 italic"
          >
            Rom 16:16 - "Greet one another with a Holy kiss, the Churches of Christ greet you"
          </blockquote>

          <!-- Social icons -->
          <div class="flex items-center gap-2">
            <!-- Facebook -->
            <a
              href="#"
              aria-label="Facebook"
              class="flex size-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            <!-- YouTube -->
            <a
              href="#"
              aria-label="YouTube"
              class="flex size-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45a2.78 2.78 0 0 0-1.95 1.97A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"
                />
              </svg>
            </a>

            <!-- Instagram -->
            <a
              href="#"
              aria-label="Instagram"
              class="flex size-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Col 2: Quick Links -->
        <div v-if="quickLinks.length" :class="['reveal', 'delay-100', isVisible && 'is-visible']">
          <h4 class="mb-3 text-xs font-semibold tracking-[0.08em] text-[#f2d593] uppercase">
            Quick Links
          </h4>
          <ul class="border-t border-white/10">
            <li v-for="link in quickLinks" :key="link.href">
              <NuxtLink
                :to="link.href"
                class="flex min-h-11 items-center border-b border-white/10 text-[15px] text-white/80 transition-colors duration-150 hover:text-white hover:underline"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 3: God's Plan for Salvation -->
        <div
          v-if="salvationLinks.length"
          :class="['reveal', 'delay-200', isVisible && 'is-visible']"
        >
          <h4 class="mb-3 text-xs font-semibold tracking-[0.08em] text-[#f2d593] uppercase">
            God's Plan for Salvation
          </h4>
          <ul class="border-t border-white/10">
            <li v-for="link in salvationLinks" :key="link.href">
              <NuxtLink
                :to="link.href"
                class="flex min-h-11 items-center border-b border-white/10 text-[15px] text-white/80 transition-colors duration-150 hover:text-white hover:underline"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 4: Resources -->
        <div
          v-if="resourceLinks.length"
          :class="['reveal', 'delay-300', isVisible && 'is-visible']"
        >
          <h4 class="mb-3 text-xs font-semibold tracking-[0.08em] text-[#f2d593] uppercase">
            Resources
          </h4>
          <ul class="border-t border-white/10">
            <li v-for="link in resourceLinks" :key="link.href">
              <a
                v-if="link.external"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="flex min-h-11 items-center gap-2 border-b border-white/10 text-[15px] text-white/80 transition-colors duration-150 hover:text-white hover:underline"
              >
                <!-- GitHub icon -->
                <svg
                  v-if="link.icon === 'github'"
                  class="h-4 w-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                {{ link.label }}
              </a>
              <NuxtLink
                v-else
                :to="link.href"
                class="flex min-h-11 items-center border-b border-white/10 text-[15px] text-white/80 transition-colors duration-150 hover:text-white hover:underline"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Divider -->
      <div class="mt-12 border-t border-white/15"></div>

      <!-- Bottom bar -->
      <div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-sm font-medium text-white">© 2025 Church of Christ, Worldwide</p>
          <p class="mt-1 max-w-[520px] text-[13px] leading-relaxed text-white/65">
            This website template is open-source and available for all Church of Christ
            congregations worldwide.
          </p>
        </div>
        <div class="flex items-center gap-1 text-sm text-white/75">
          <a
            href="#"
            class="inline-flex min-h-11 items-center transition-colors hover:text-white hover:underline"
            >Privacy Policy</a
          >
          <span class="mx-2 text-white/35" aria-hidden="true">&bull;</span>
          <a
            href="#"
            class="inline-flex min-h-11 items-center transition-colors hover:text-white hover:underline"
            >Terms of Use</a
          >
        </div>
      </div>
    </div>
  </footer>
</template>
