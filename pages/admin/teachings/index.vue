<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Teachings', description: 'Browse all sermons and teachings.' })

const { setHeader } = usePageHeader()
const teachingsStore = useTeachingsStore()

onMounted(() => {
  teachingsStore.load()
  setHeader('Teachings Library', 'Browse all sermons and teaching materials')
})

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Sunday School', value: 'Sunday School' },
  { label: 'Sermon', value: 'Sermon' },
  { label: 'Bible Class', value: 'Bible Class' },
  { label: 'Youth Class', value: 'Youth Class' },
]

const {
  page: teachPage,
  total: teachTotal,
  totalPages: teachTotalPages,
  paginated: pagedSermons,
  rangeStart: teachFrom,
  rangeEnd: teachTo,
} = usePagination(
  computed(() => teachingsStore.filteredSermons),
  12
)
</script>

<template>
  <div class="space-y-6">
    <!-- Header row -->
    <div
      class="flex flex-col justify-between gap-3 rounded-sm border border-rule bg-surface p-3 sm:flex-row sm:items-center"
    >
      <div class="no-scrollbar flex gap-1 overflow-x-auto" role="group" aria-label="Filter by type">
        <button
          v-for="opt in filterOptions"
          :key="opt.value"
          :class="[
            'inline-flex min-h-9 shrink-0 items-center rounded-md border px-3 text-sm font-medium transition-colors duration-150',
            teachingsStore.filterType === opt.value
              ? 'border-primary bg-primary text-on-primary'
              : 'border-rule-strong bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink',
          ]"
          :aria-pressed="teachingsStore.filterType === opt.value"
          @click="teachingsStore.filterType = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
      <div class="flex shrink-0 flex-wrap gap-2">
        <div class="relative min-w-0 flex-1">
          <Icon
            icon="mdi:magnify"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-ink-subtle"
            aria-hidden="true"
          />
          <input
            v-model="teachingsStore.searchQuery"
            type="search"
            placeholder="Search teachings..."
            class="min-h-10 w-full py-2 pr-3 pl-9 text-sm sm:w-56 rounded-md border border-rule-strong bg-surface text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
            aria-label="Search teachings"
          />
        </div>
        <NuxtLink to="/admin/teachings/upload">
          <Button>
            <template #icon-left><Icon icon="mdi:plus" /></template>
            Add Teaching
          </Button>
        </NuxtLink>
      </div>
    </div>

    <!-- Grid. Teachings are held in memory with no fetch step, so there is no
         loading state to show here — only empty or populated. -->
    <div
      v-if="pagedSermons.length"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <SermonCard v-for="sermon in pagedSermons" :key="sermon.id" :sermon="sermon" />
    </div>

    <!-- Empty state -->
    <EmptyState
      v-else
      icon="mdi:book-open-page-variant-outline"
      title="No teachings found"
      description="Try adjusting your filters, or upload a new sermon or lesson."
    >
      <template #action>
        <NuxtLink to="/admin/teachings/upload">
          <Button>Upload Teaching</Button>
        </NuxtLink>
      </template>
    </EmptyState>

    <Card v-if="teachTotalPages > 1" padding="none">
      <Pagination
        v-model:page="teachPage"
        :total-pages="teachTotalPages"
        :total="teachTotal"
        :range-start="teachFrom"
        :range-end="teachTo"
        label="teachings"
      />
    </Card>
  </div>
</template>
