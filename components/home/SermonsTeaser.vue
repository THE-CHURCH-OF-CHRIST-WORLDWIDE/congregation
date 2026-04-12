<script setup lang="ts">
const store = usePublicTeachingsStore()
const featured = computed(() => store.sermons.slice(0, 3))
</script>

<template>
  <section class="py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Header row -->
      <div class="mb-10 flex items-end justify-between">
        <SectionHeader title="Sermons & Teachings" subtitle="Biblical preaching for every season of life." />
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
        <ContentCard
          v-for="sermon in featured"
          :key="sermon.id"
          :thumbnail="sermon.thumbnailSrc"
          :tags="sermon.tags"
          :title="sermon.title"
          :author="sermon.preacher"
          :date="sermon.date"
          :slug="sermon.slug"
          type="sermon"
        />
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
