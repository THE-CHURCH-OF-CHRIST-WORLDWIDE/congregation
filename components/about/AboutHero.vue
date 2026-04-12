<template>
  <div class="relative h-[200px] w-full overflow-hidden md:h-[280px]">
    <!-- Background image -->
    <img
      src="https://picsum.photos/seed/church-building/1600/700"
      alt="Congregation gathering"
      class="absolute inset-0 h-full w-full object-cover object-center"
    />

    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-black/65" />

    <!-- Centered text -->
    <div class="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
      <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-300">
        Romans 16:16
      </p>
      <h1 class="font-serif text-4xl font-bold text-white md:text-5xl">About Us</h1>
      <p class="mt-3 text-base font-light text-white/80 md:text-lg">
        Church Of Christ, 7b Esa Atan Extension
      </p>
    </div>
  </div>
</template>
