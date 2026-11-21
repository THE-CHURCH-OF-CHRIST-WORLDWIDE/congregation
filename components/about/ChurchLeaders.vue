<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const leaders = computed(() => s.settings.leaders)

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
  const fallback = img.nextElementSibling as HTMLElement | null
  if (fallback) fallback.classList.remove('hidden')
}
</script>

<template>
  <section class="section bg-surface">
    <div class="site-container">
      <SectionHeader title="Our Church Leaders" />

      <LoadingState v-if="s.loading" title="Loading leaders…" />
      <div v-else-if="!leaders.length">
        <EditorialNote
          title="No leaders listed yet"
          description="Our elders, deacons and ministers will be introduced here soon."
        />
      </div>

      <!-- A portrait gallery: photograph, name, office -->
      <ul
        v-else
        class="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16"
      >
        <li
          v-for="(leader, i) in leaders"
          :key="leader.id"
          :class="['group flex flex-col', i % 4 === 1 || i % 4 === 3 ? 'lg:translate-y-10' : '']"
        >
          <div
            v-reveal="{ type: 'unveil', delay: Math.min(i, 7) * 90 }"
            class="img-zoom relative aspect-[4/5] w-full overflow-hidden bg-surface-sunken"
          >
            <img
              :src="displayableImageUrl(leader.avatar)"
              :alt="leader.name"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover"
              @error="onImgError"
            />
            <div class="absolute inset-0 hidden bg-primary">
              <span
                class="flex h-full w-full items-end p-5 font-display text-[clamp(3.5rem,8vw,6rem)] leading-none text-on-night/30 italic"
              >
                {{ initials(leader.name) }}
              </span>
            </div>
          </div>
          <p class="mt-5 font-display text-[1.5rem] leading-[1.1] text-ink md:text-[1.75rem]">
            {{ leader.name }}
          </p>
          <p class="t-label mt-2.5 text-ink-subtle">{{ leader.role }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
