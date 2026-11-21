<script setup lang="ts">
// The navbar is fixed. Pages that open on a full-bleed cover (the landing page, or any page
// with `definePageMeta({ navOverlay: true })`) run under it; every other page starts below it.
const route = useRoute()
const overlay = computed(() => route.path === '/' || route.meta.navOverlay === true)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface text-base text-ink">
    <a
      href="#main-content"
      class="sr-only z-[70] bg-primary px-4 py-3 font-semibold text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to content
    </a>
    <TheNavbar />
    <main
      id="main-content"
      class="relative flex-1"
      :class="overlay ? '' : 'pt-[var(--nav-h)]'"
      tabindex="-1"
    >
      <slot></slot>
    </main>
    <TheFooter />
  </div>
</template>
