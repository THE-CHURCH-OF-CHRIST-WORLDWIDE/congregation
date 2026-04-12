<template>
  <footer class="bg-[#1E3A5F] text-white">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <!-- 4-column grid -->
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

        <!-- Col 1: Brand -->
        <div>
          <div class="flex items-center gap-3 mb-5">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#1E3A5F] font-serif font-bold text-sm">
              CoC
            </div>
            <p class="font-serif font-bold text-lg leading-tight">Church of Christ</p>
          </div>
          <p class="text-sm text-white/60 leading-relaxed mb-4">
            7b Esa Atan, Ekot Ekpene<br/>Akwa Ibom State, Nigeria
          </p>
          <p class="text-xs text-white/40 italic mb-5">
            "…the churches of Christ salute you." — Romans 16:16
          </p>
          <!-- Social icons -->
          <div class="flex items-center gap-4">
            <a href="#" aria-label="Facebook" class="text-white/50 hover:text-white transition-colors">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <a href="#" aria-label="YouTube" class="text-white/50 hover:text-white transition-colors">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45a2.78 2.78 0 00-1.95 1.97A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 001.95-1.97A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram" class="text-white/50 hover:text-white transition-colors">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Col 2: Quick Links -->
        <div>
          <h4 class="font-serif font-bold text-base mb-5 text-white">Quick Links</h4>
          <ul class="space-y-3 text-sm text-white/60">
            <li><NuxtLink to="/#congregations" class="hover:text-white transition-colors">Find a Congregation</NuxtLink></li>
            <li><NuxtLink to="/live-streams" class="hover:text-white transition-colors">Watch Live Streams</NuxtLink></li>
            <li><NuxtLink to="/teachings/sermons" class="hover:text-white transition-colors">Read Sermons</NuxtLink></li>
            <li><NuxtLink to="/teachings/sunday-school" class="hover:text-white transition-colors">Sunday School Lessons</NuxtLink></li>
            <li><NuxtLink to="/#about" class="hover:text-white transition-colors">About the Church</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 3: Plan of Salvation -->
        <div>
          <h4 class="font-serif font-bold text-base mb-5 text-white">God's Plan for Salvation</h4>
          <ul class="space-y-3 text-sm text-white/60">
            <li class="flex items-start gap-2">
              <span class="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-white/20 text-center text-xs leading-4 font-bold">1</span>
              Hear the Gospel
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-white/20 text-center text-xs leading-4 font-bold">2</span>
              Believe the Gospel
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-white/20 text-center text-xs leading-4 font-bold">3</span>
              Repent of Your Sins
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-white/20 text-center text-xs leading-4 font-bold">4</span>
              Confess Christ
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-white/20 text-center text-xs leading-4 font-bold">5</span>
              Get Baptized
            </li>
          </ul>
        </div>

        <!-- Col 4: Resources -->
        <div>
          <h4 class="font-serif font-bold text-base mb-5 text-white">Resources</h4>
          <ul class="space-y-3 text-sm text-white/60">
            <li><NuxtLink to="/teachings/sermons" class="hover:text-white transition-colors">Biblical Teachings</NuxtLink></li>
            <li><a href="/#faq" class="hover:text-white transition-colors">FAQ</a></li>
            <li><a href="/#contact" class="hover:text-white transition-colors">Contact Us</a></li>
            <li>
              <a href="https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation" target="_blank" rel="noopener" class="inline-flex items-center gap-1 hover:text-white transition-colors">
                Open Source Template
                <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-12 border-t border-white/10 pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-white/40">
        <p>© 2025 Church of Christ, Worldwide. All rights reserved.</p>
        <div class="flex items-center gap-4">
          <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-white transition-colors">Terms of Use</a>
        </div>
      </div>
    </div>
  </footer>
</template>
