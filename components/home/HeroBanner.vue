<template>
  <section class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1E3A5F]">
    <!-- Background image -->
    <img
      src="/images/heroImg.png"
      alt="Church of Christ building"
      class="absolute inset-0 h-full w-full object-cover opacity-30"
      loading="eager"
    />
    <!-- Overlay gradient -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-[#1E3A5F]/50 to-[#1E3A5F]/90" />

    <!-- Content -->
    <div class="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
      <p class="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-white/70">
        Welcome to
      </p>
      <h1 class="font-serif text-5xl font-bold leading-tight drop-shadow-lg md:text-7xl">
        The Church of Christ
      </h1>
      <p class="mt-4 text-lg text-white/80 md:text-xl">
        7b Esa Atan, Ekot Ekpene, Akwa Ibom
      </p>
      <p class="mt-3 text-base italic text-white/60 md:text-lg">
        "Believe God. Read Silence. Above Every State."
      </p>

      <div class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <a
          href="#welcome"
          class="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-8 py-3.5 text-sm font-semibold text-white shadow-xl hover:bg-blue-700 transition-colors"
          aria-label="Visit Sunday Worship"
        >
          <Icon icon="heroicons:sun" class="h-5 w-5" />
          Visit Sunday Worship
        </a>
        <a
          href="#events"
          class="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label="View service times"
        >
          <Icon icon="heroicons:clock" class="h-5 w-5" />
          Service Times
        </a>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
      <Icon icon="heroicons:chevron-down" class="h-6 w-6" />
    </div>
  </section>
</template>
