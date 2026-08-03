<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Teachings', description: 'Browse all sermons and teachings.' })

const { setHeader } = usePageHeader()
const teachingsStore = useTeachingsStore()

onMounted(() => {
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
  <div class="flex flex-col gap-5">
    <!-- Header row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex gap-1 overflow-x-auto pb-1">
        <button
          v-for="opt in filterOptions"
          :key="opt.value"
          :class="[
            'px-3 py-1.5 text-sm font-medium rounded-lg flex-shrink-0 transition-all',
            teachingsStore.filterType === opt.value
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
          ]"
          @click="teachingsStore.filterType = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <div class="relative">
          <Icon
            icon="mdi:magnify"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base"
          />
          <input
            v-model="teachingsStore.searchQuery"
            type="search"
            placeholder="Search teachings..."
            class="w-56 pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
