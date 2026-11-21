<template>
  <div class="flex min-h-screen flex-col bg-surface text-base text-ink">
    <a
      href="#main-content"
      class="sr-only z-[60] rounded-md bg-primary px-4 py-3 font-semibold text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to content
    </a>
    <TheNavbar />
    <main id="main-content" class="flex-1" tabindex="-1">
      <slot></slot>
    </main>
    <TheFooter />
  </div>
</template>
