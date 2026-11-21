<script setup lang="ts">
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
const { isNavItemVisible } = useNavVisibility()

/** Opens the church's own address in the visitor's map app. */
const directionsUrl = computed(() => {
  const q = [settingsStore.settings.name, settingsStore.settings.address].filter(Boolean).join(', ')
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : ''
})

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
  <footer class="field-night relative overflow-hidden">
    <!-- The close: an invitation set large, before the index of links -->
    <div class="site-container pt-24 pb-16 md:pt-32 lg:pb-20">
      <div class="grid gap-12 lg:grid-cols-12 lg:items-end">
        <h2 class="t-display text-on-night lg:col-span-8">
          <SplitReveal text="Come and worship" class="block" />
          <SplitReveal text="with us." :delay="180" class="t-turn block text-champagne" />
        </h2>
        <div v-reveal.200 class="lg:col-span-4 lg:pb-3">
          <p class="t-label text-on-night-muted">{{ settingsStore.settings.name }}</p>
          <p class="mt-3 text-lg leading-relaxed text-on-night">
            {{ settingsStore.settings.address }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a
              v-if="directionsUrl"
              :href="directionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-light"
            >
              Get directions
              <Icon icon="mdi:arrow-top-right" class="btn-arrow size-4" />
            </a>
            <NuxtLink
              v-if="isNavItemVisible('contactUs')"
              to="/#contact"
              class="btn btn-ghost-light"
            >
              Write to us
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-reveal="'rule'" class="mt-20 h-px bg-on-night/15 md:mt-28"></div>

      <!-- Index -->
      <div class="grid gap-12 pt-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <!-- Brand -->
        <div class="lg:col-span-4">
          <div class="flex items-center gap-3">
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-full border border-champagne/50 font-display text-sm text-champagne"
            >
              CoC
            </div>
            <p class="font-display text-2xl leading-tight text-on-night">
              {{ settingsStore.settings.name }}
            </p>
          </div>

          <!-- Scripture -->
          <blockquote
            class="mt-8 max-w-[22rem] font-display text-xl leading-snug text-on-night-muted italic"
          >
            “Greet one another with a Holy kiss, the Churches of Christ greet you”
            <span class="t-label mt-3 block text-champagne not-italic">Rom 16:16</span>
          </blockquote>

          <!-- Social icons -->
          <div class="mt-8 flex items-center gap-2">
            <!-- Facebook -->
            <a
              href="#"
              aria-label="Facebook"
              class="flex size-11 items-center justify-center rounded-full border border-on-night/20 text-on-night/85 transition-colors duration-300 hover:border-champagne hover:text-champagne"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            <!-- YouTube -->
            <a
              href="#"
              aria-label="YouTube"
              class="flex size-11 items-center justify-center rounded-full border border-on-night/20 text-on-night/85 transition-colors duration-300 hover:border-champagne hover:text-champagne"
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
              class="flex size-11 items-center justify-center rounded-full border border-on-night/20 text-on-night/85 transition-colors duration-300 hover:border-champagne hover:text-champagne"
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

        <!-- Quick Links -->
        <div v-if="quickLinks.length" class="lg:col-span-3 lg:col-start-6">
          <h3 class="t-label text-champagne">Quick Links</h3>
          <ul class="mt-5">
            <li v-for="link in quickLinks" :key="link.href">
              <NuxtLink :to="link.href" class="footer-link">
                <span class="link-text">{{ link.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- God's Plan for Salvation -->
        <div v-if="salvationLinks.length" class="lg:col-span-2">
          <h3 class="t-label text-champagne">God's Plan for Salvation</h3>
          <ul class="mt-5">
            <li v-for="link in salvationLinks" :key="link.href">
              <NuxtLink :to="link.href" class="footer-link">
                <span class="link-text">{{ link.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Resources -->
        <div v-if="resourceLinks.length" class="lg:col-span-2">
          <h3 class="t-label text-champagne">Resources</h3>
          <ul class="mt-5">
            <li v-for="link in resourceLinks" :key="link.href">
              <a
                v-if="link.external"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="footer-link gap-2"
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
                <span class="link-text">{{ link.label }}</span>
              </a>
              <NuxtLink v-else :to="link.href" class="footer-link">
                <span class="link-text">{{ link.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div
        class="mt-16 flex flex-col gap-4 border-t border-on-night/15 pt-8 text-sm sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <p class="font-medium text-on-night">© 2025 Church of Christ, Worldwide</p>
          <p class="mt-1 max-w-[520px] text-[13px] leading-relaxed text-on-night-muted">
            This website template is open-source and available for all Church of Christ
            congregations worldwide.
          </p>
        </div>
        <div class="flex items-center gap-1 text-on-night-muted">
          <a href="#" class="footer-link min-h-11"><span class="link-text">Privacy Policy</span></a>
          <span class="mx-3 text-on-night/30" aria-hidden="true">/</span>
          <a href="#" class="footer-link min-h-11"><span class="link-text">Terms of Use</span></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-link {
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  font-size: 0.9375rem;
  color: rgb(243 239 230 / 0.78);
  transition: color 0.3s;
}
.footer-link:hover {
  color: var(--c-on-night);
}
.footer-link .link-text {
  background-image: linear-gradient(var(--c-champagne), var(--c-champagne));
  background-size: 0% 1px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  padding-bottom: 2px;
  transition: background-size 0.5s var(--ease-out-expo);
}
.footer-link:hover .link-text {
  background-size: 100% 1px;
}
</style>
