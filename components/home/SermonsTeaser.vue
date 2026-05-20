<script setup lang="ts">
const store = usePublicTeachingsStore()
const featured = computed(() => store.sermons.slice(0, 3))

const { el: sectionRef, isVisible } = useScrollReveal()
</script>

<template>
  <section ref="sectionRef" class="py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Header row -->
      <div :class="['mb-10 flex items-end justify-between', 'reveal', isVisible && 'is-visible']">
        <SectionHeader
          title="Sermons & Teachings"
          subtitle="Biblical preaching for every season of life."
        />
        <NuxtLink
          to="/teachings/sermons"
          class="hidden shrink-0 items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline sm:flex"
          aria-label="View all sermons"
        >
          View All Sermons
          <Icon icon="heroicons:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>

      <!-- 3-column grid -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      <div class="mt-8 text-center sm:hidden">
        <NuxtLink
          to="/teachings/sermons"
          class="inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline"
          aria-label="View all sermons"
        >
          View All Sermons
          <Icon icon="heroicons:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
