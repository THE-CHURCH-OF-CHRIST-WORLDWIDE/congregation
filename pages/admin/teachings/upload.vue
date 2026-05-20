<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({
  title: 'Upload Teaching',
  description: 'Add new Sunday School teachings and sermons to your library.',
})

const { setHeader } = usePageHeader()
const teachingsStore = useTeachingsStore()

onMounted(() => {
  setHeader('Teachings Upload', 'Add new Sunday School teachings and sermons to your library')
})

const categoryColors: Record<string, string> = {
  Church: 'bg-blue-100 text-blue-700',
  Truth: 'bg-purple-100 text-purple-700',
  Faith: 'bg-green-100 text-green-700',
  Prayer: 'bg-amber-100 text-amber-700',
  Youth: 'bg-pink-100 text-pink-700',
}

function getCategoryColor(cat: string) {
  return categoryColors[cat] ?? 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <!-- Left: Upload form -->
    <div class="xl:col-span-2">
      <Card>
        <UploadForm />
      </Card>
    </div>

    <!-- Right: Recent uploads + Tips -->
    <div class="flex flex-col gap-4">
      <!-- Recent Sermon Uploads -->
      <Card>
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Recent Sermon Uploads</h3>
        <div v-if="teachingsStore.recentSermons.length" class="space-y-4">
          <div
            v-for="sermon in teachingsStore.recentSermons"
            :key="sermon.id"
            class="border-b border-gray-50 last:border-0 pb-4 last:pb-0"
          >
            <div class="flex flex-wrap gap-1 mb-1.5">
              <span
                v-for="cat in sermon.categories"
                :key="cat"
                :class="['text-[10px] font-medium px-2 py-0.5 rounded-full', getCategoryColor(cat)]"
              >
                {{ cat }}
              </span>
            </div>
            <p class="text-sm font-medium text-gray-800 leading-snug line-clamp-2">
              {{ sermon.topic }}
            </p>
            <button class="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
              Read more <Icon icon="mdi:arrow-right" class="text-[10px]" />
            </button>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-400 text-sm">No uploads yet</div>
      </Card>

      <!-- Upload Tips -->
      <Card>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Upload Tips</h3>
        <ul class="space-y-2">
          <li
            v-for="tip in [
              'Use clear descriptive titles',
              'Add detailed descriptions',
              'Select high quality thumbnails',
              'Tag content appropriately',
              'Include sermon references',
            ]"
            :key="tip"
            class="flex items-start gap-2 text-xs text-gray-600"
          >
            <Icon icon="mdi:circle-small" class="text-blue-500 flex-shrink-0 text-base mt-[-1px]" />
            {{ tip }}
          </li>
        </ul>
      </Card>
    </div>
  </div>
</template>
