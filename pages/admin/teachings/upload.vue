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

const tips = [
  'Use clear, descriptive titles',
  'Add detailed descriptions',
  'Select high-quality thumbnails',
  'Tag content appropriately',
  'Include sermon series info',
]
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
        <h3 class="font-serif text-lg font-bold text-gray-900 mb-4">Recent Sermon Uploads</h3>

        <div
          v-if="teachingsStore.recentSermons.length"
          class="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1"
        >
          <article
            v-for="sermon in teachingsStore.recentSermons"
            :key="sermon.id"
            class="rounded-xl border border-gray-100 bg-white p-4 hover:border-blue-100 transition-colors"
          >
            <div v-if="sermon.categories.length" class="flex flex-wrap gap-1.5 mb-2">
              <span
                v-for="cat in sermon.categories.slice(0, 3)"
                :key="cat"
                class="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium"
                style="color: #0ba5ec"
              >
                {{ cat }}
              </span>
            </div>
            <p class="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
              {{ sermon.topic }}
            </p>
            <NuxtLink
              to="/admin/teachings"
              class="mt-2 inline-flex items-center gap-1 text-sm font-medium"
              style="color: #0ba5ec"
              :aria-label="`Read ${sermon.topic}`"
            >
              Read more
              <Icon icon="mdi:arrow-right" class="text-sm" />
            </NuxtLink>
          </article>
        </div>

        <div v-else class="text-center py-6 text-gray-400 text-sm">No uploads yet</div>
      </Card>

      <!-- Upload Tips -->
      <Card>
        <h3 class="font-serif text-lg font-bold text-gray-900 mb-3">Upload Tips</h3>
        <ul class="space-y-2.5">
          <li v-for="tip in tips" :key="tip" class="flex items-start gap-2 text-sm text-gray-600">
            <span
              class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400"
              aria-hidden="true"
            ></span>
            {{ tip }}
          </li>
        </ul>
      </Card>
    </div>
  </div>
</template>
