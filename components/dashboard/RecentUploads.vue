<script setup lang="ts">
const teachingsStore = useTeachingsStore()

const sermons = computed(() => teachingsStore.recentSermons)
</script>

<template>
  <Card padding="none" class="flex h-full flex-col overflow-hidden p-5">
    <h3 class="font-sans text-base font-semibold text-ink">Recent Sermon Uploads</h3>

    <div
      v-if="sermons.length"
      class="-mx-5 mt-3 -mb-5 flex max-h-[420px] flex-col divide-y divide-rule overflow-y-auto border-t border-rule"
    >
      <article
        v-for="sermon in sermons"
        :key="sermon.id"
        class="px-5 py-3.5 transition-colors duration-150 hover:bg-surface-muted/70"
      >
        <!-- Category chips -->
        <div v-if="sermon.categories.length" class="mb-1.5 flex flex-wrap gap-x-3 gap-y-1">
          <span v-for="cat in sermon.categories.slice(0, 3)" :key="cat" class="stamp">
            {{ cat }}
          </span>
        </div>

        <!-- Title -->
        <p class="line-clamp-2 text-sm leading-snug font-semibold text-ink">
          {{ sermon.topic }}
        </p>

        <!-- Read more link -->
        <NuxtLink
          to="/admin/teachings"
          class="mt-1.5 inline-flex items-center gap-1 text-[13px] font-medium text-primary-ink underline-offset-3 hover:text-primary-hover hover:underline"
          :aria-label="`Read ${sermon.topic}`"
        >
          Read more
          <Icon icon="mdi:arrow-right" class="text-sm" aria-hidden="true" />
        </NuxtLink>
      </article>
    </div>

    <EmptyState
      v-else
      icon="mdi:book-open-page-variant-outline"
      size="sm"
      title="No uploads yet"
      description="Sermons and lessons you upload will be listed here."
    />
  </Card>
</template>
