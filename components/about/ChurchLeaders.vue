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
  <section class="bg-surface py-16 md:py-24">
    <div class="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
      <SectionHeader title="Our Church Leaders" />

      <LoadingState v-if="s.loading" title="Loading leaders…" />
      <EmptyState
        v-else-if="!leaders.length"
        icon="mdi:account-tie-outline"
        title="No leaders listed yet"
        description="Our elders, deacons and ministers will be introduced here soon."
      />

      <!-- Profile entries: photograph, name, office -->
      <div
        v-else
        class="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8"
      >
        <div v-for="leader in leaders" :key="leader.id" class="flex flex-col">
          <div
            class="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-md border border-rule bg-surface-sunken"
          >
            <img
              :src="displayableImageUrl(leader.avatar)"
              :alt="leader.name"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover"
              @error="onImgError"
            />
            <div class="absolute inset-0 hidden bg-primary-soft">
              <span
                class="flex h-full w-full items-center justify-center font-display text-4xl font-semibold text-primary-ink"
              >
                {{ initials(leader.name) }}
              </span>
            </div>
          </div>
          <p class="mt-4 font-display text-lg leading-snug font-semibold text-ink">
            {{ leader.name }}
          </p>
          <p class="stamp mt-1.5">{{ leader.role }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
