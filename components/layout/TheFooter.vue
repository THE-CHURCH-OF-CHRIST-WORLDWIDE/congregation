<script setup lang="ts">
const { el: footerRef, isVisible } = useScrollReveal({ threshold: 0.05 })

interface FooterLink {
  label: string
  href: string
  external?: boolean
  icon?: 'github'
}

const quickLinks: FooterLink[] = [
  { label: 'Find a Congregation', href: '/find-congregation' },
  { label: 'Watch Live Streams', href: '/live-streams' },
  { label: 'Read Sermons', href: '/teachings/sermons' },
  { label: 'Sunday School Lessons', href: '/teachings/sunday-school' },
  { label: 'About the Church', href: '/about-us' },
]

const salvationLinks: FooterLink[] = [
  { label: 'Hear the Gospel', href: '/salvation#hear' },
  { label: 'Believe the Gospel', href: '/salvation#believe' },
  { label: 'Repent of your sins', href: '/salvation#repent' },
  { label: 'Confess Christ', href: '/salvation#confess' },
  { label: 'Get Baptized', href: '/salvation#baptized' },
]

const resourceLinks: FooterLink[] = [
  { label: 'Biblical Teachings', href: '/teachings/sermons' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Open Source Template', href: 'https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation', external: true, icon: 'github' },
]
</script>

<template>
  <footer ref="footerRef" class="relative overflow-hidden bg-[#0F172A] text-white">

    <!-- Watermark -->
    <span class="footer-watermark" aria-hidden="true">worship with</span>

    <!-- Main content -->
    <div class="relative z-10 mx-auto max-w-7xl px-6 py-14 lg:px-8">

      <!-- 4-column grid -->
      <div class="grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12">

        <!-- Col 1: Brand -->
        <div :class="['reveal-left', isVisible && 'is-visible']">
          <!-- Logo + name -->
          <div class="mb-2 flex items-center gap-3">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-800 text-[11px] font-bold text-white">
              CoC
            </div>
            <p class="text-[18px] font-bold leading-tight text-white">Church of Christ</p>
          </div>

          <!-- Address -->
          <p class="mb-5 text-[13px] text-slate-400">7B Esa Atan Extension</p>

          <!-- Scripture -->
          <p class="mb-6 max-w-[280px] text-[13px] leading-[1.6] text-slate-400">
            Rom 16:16 - "Greet one another with a Holy kiss, the Churches of Christ greet you"
          </p>

          <!-- Social icons -->
          <div class="flex items-center gap-3">
            <!-- Facebook -->
            <a
              href="#"
              aria-label="Facebook"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white transition-opacity hover:opacity-85"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            <!-- YouTube -->
            <a
              href="#"
              aria-label="YouTube"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF0000] text-white transition-opacity hover:opacity-85"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45a2.78 2.78 0 0 0-1.95 1.97A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
              </svg>
            </a>

            <!-- Instagram -->
            <a
              href="#"
              aria-label="Instagram"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-[#E1306C] text-white transition-opacity hover:opacity-85"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Col 2: Quick Links -->
        <div :class="['reveal', 'delay-100', isVisible && 'is-visible']">
          <h4 class="mb-5 text-[15px] font-semibold text-white">Quick Links</h4>
          <ul>
            <li v-for="link in quickLinks" :key="link.href">
              <NuxtLink
                :to="link.href"
                class="block text-[14px] leading-[2] text-slate-400 transition-colors duration-150 hover:text-white"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 3: God's Plan for Salvation -->
        <div :class="['reveal', 'delay-200', isVisible && 'is-visible']">
          <h4 class="mb-5 text-[15px] font-semibold text-white">God's Plan for Salvation</h4>
          <ul>
            <li v-for="link in salvationLinks" :key="link.href">
              <NuxtLink
                :to="link.href"
                class="block text-[14px] leading-[2] text-slate-400 transition-colors duration-150 hover:text-white"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 4: Resources -->
        <div :class="['reveal', 'delay-300', isVisible && 'is-visible']">
          <h4 class="mb-5 text-[15px] font-semibold text-white">Resources</h4>
          <ul>
            <li v-for="link in resourceLinks" :key="link.href">
              <a
                v-if="link.external"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-[14px] leading-[2] text-slate-400 transition-colors duration-150 hover:text-white"
              >
                <!-- GitHub icon -->
                <svg
                  v-if="link.icon === 'github'"
                  class="h-4 w-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                {{ link.label }}
              </a>
              <NuxtLink
                v-else
                :to="link.href"
                class="block text-[14px] leading-[2] text-slate-400 transition-colors duration-150 hover:text-white"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Divider -->
      <div class="mt-12 border-t border-white/10"></div>

      <!-- Bottom bar -->
      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-[13px] text-white">© 2025 Church of Christ, Worldwide</p>
          <p class="mt-1 max-w-[520px] text-[12px] text-slate-500">
            This website template is open-source and available for all Church of Christ congregations worldwide.
          </p>
        </div>
        <div class="flex items-center gap-1 text-[13px] text-slate-400">
          <a href="#" class="transition-colors hover:text-white">Privacy Policy</a>
          <span class="mx-1 text-slate-600">&bull;</span>
          <a href="#" class="transition-colors hover:text-white">Terms of Use</a>
        </div>
      </div>

    </div>
  </footer>
</template>

<style scoped>
.footer-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(80px, 15vw, 180px);
  font-weight: 900;
  color: white;
  opacity: 0.05;
  white-space: nowrap;
  user-select: none;
  pointer-events: none;
  z-index: 0;
  letter-spacing: 0.1em;
}
</style>
