<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({
  title: 'Upload Teaching',
  description: 'Add new Sunday School teachings and sermons to your library.',
})

const { setHeader } = usePageHeader()
const teachingsStore = useTeachingsStore()

onMounted(() => {
  teachingsStore.load()
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
  <div class="space-y-6">
    <NuxtLink
      to="/admin/teachings"
      class="inline-flex min-h-9 w-fit items-center gap-1.5 rounded-md text-sm font-medium text-ink-muted transition-colors duration-150 hover:text-primary-ink"
    >
      <Icon icon="mdi:arrow-left" class="text-base" aria-hidden="true" />
      Back to teachings
    </NuxtLink>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Left: Upload form -->
      <div class="xl:col-span-2">
        <Card padding="lg">
          <UploadForm />
        </Card>
      </div>

      <!-- Right: Recent uploads + Tips -->
      <div class="flex flex-col gap-4">
        <!-- Recent Sermon Uploads -->
        <Card>
          <h3 class="mb-3 font-sans text-lg font-semibold text-ink">Recent Sermon Uploads</h3>

          <div
            v-if="teachingsStore.recentSermons.length"
            class="sidebar-scroll -mx-4 flex max-h-[360px] flex-col divide-y divide-rule overflow-y-auto border-y border-rule lg:-mx-5"
          >
            <article
              v-for="sermon in teachingsStore.recentSermons"
              :key="sermon.id"
              class="px-4 py-3 transition-colors duration-150 hover:bg-surface-muted/70 lg:px-5"
            >
              <div v-if="sermon.categories.length" class="mb-1.5 flex flex-wrap gap-1.5">
                <span
                  v-for="cat in sermon.categories.slice(0, 3)"
                  :key="cat"
                  class="stamp text-2xs"
                >
                  {{ cat }}
                </span>
              </div>
              <p class="line-clamp-2 text-sm leading-snug font-semibold text-ink">
                {{ sermon.topic }}
              </p>
              <NuxtLink
                to="/admin/teachings"
                class="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-primary-ink underline-offset-3 hover:text-primary-hover hover:underline"
                :aria-label="`Read ${sermon.topic}`"
              >
                Read more
                <Icon icon="mdi:arrow-right" class="text-sm" aria-hidden="true" />
              </NuxtLink>
            </article>
          </div>

          <div v-else class="py-6 text-center text-sm text-ink-subtle">No uploads yet</div>
        </Card>

        <!-- Upload Tips -->
        <Card>
          <h3 class="mb-3 font-sans text-lg font-semibold text-ink">Upload Tips</h3>
          <ul class="ruled">
            <li
              v-for="tip in tips"
              :key="tip"
              class="flex items-start gap-2.5 py-2 text-sm text-ink-muted"
            >
              <span
                class="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                aria-hidden="true"
              ></span>
              {{ tip }}
            </li>
          </ul>
        </Card>
      </div>
    </div>
  </div>
</template>
