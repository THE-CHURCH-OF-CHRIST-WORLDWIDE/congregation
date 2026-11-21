<script setup lang="ts">
const store = usePublicTeachingsStore()
const featured = computed(() => store.sermons.slice(0, 3))

const { el: sectionRef, isVisible } = useScrollReveal()
</script>

<template>
  <section ref="sectionRef" class="bg-surface py-16 md:py-24">
    <div class="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <!-- Header row -->
      <div
        :class="[
          'mb-10 flex items-end justify-between gap-6 md:mb-12',
          'reveal',
          isVisible && 'is-visible',
        ]"
      >
        <SectionHeader
          class="mb-0! md:mb-0!"
          title="Sermons & Teachings"
          subtitle="Biblical preaching for every season of life."
        />
        <NuxtLink
          to="/teachings/sermons"
          class="hidden min-h-11 shrink-0 items-center gap-1.5 text-base font-semibold text-primary-ink underline-offset-3 hover:text-primary-hover hover:underline sm:flex"
          aria-label="View all sermons"
        >
          View All Sermons
          <Icon icon="mdi:arrow-right" class="h-5 w-5" />
        </NuxtLink>
      </div>

      <EmptyState
        v-if="!featured.length"
        icon="mdi:microphone-outline"
        title="No sermons published yet"
        description="Recent sermons will be featured here once they are uploaded."
      />

      <!-- 3-column grid -->
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        <div
          v-for="(sermon, i) in featured"
          :key="sermon.id"
          :class="['reveal-scale', isVisible && 'is-visible']"
          :style="{ transitionDelay: `${150 + i * 100}ms` }"
        >
          <ContentCard
            :thumbnail="sermon.thumbnailSrc"
            :tags="sermon.tags"
            :title="sermon.title"
            :author="sermon.preacher"
            :date="sermon.date"
            :slug="sermon.slug"
            type="sermon"
          />
        </div>
      </div>

      <div class="mt-8 sm:hidden">
        <NuxtLink
          to="/teachings/sermons"
          class="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-base font-semibold text-primary-ink underline-offset-3 hover:text-primary-hover hover:underline"
          aria-label="View all sermons"
        >
          View All Sermons
          <Icon icon="mdi:arrow-right" class="h-5 w-5" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
