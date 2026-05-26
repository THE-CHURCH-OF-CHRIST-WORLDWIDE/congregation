<script setup lang="ts">
const teachingsStore = useTeachingsStore()

const sermons = computed(() => teachingsStore.recentSermons)
</script>

<template>
  <Card class="h-full">
    <h3 class="text-base font-semibold text-gray-900 mb-4">Recent Sermon Uploads</h3>

    <div v-if="sermons.length" class="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
      <article
        v-for="sermon in sermons"
        :key="sermon.id"
        class="rounded-xl border border-gray-100 bg-white p-4 hover:border-blue-100 transition-colors"
      >
        <!-- Category chips -->
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

        <!-- Title -->
        <p class="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {{ sermon.topic }}
        </p>

        <!-- Read more link -->
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

    <div v-else class="text-center py-8 text-gray-400">
      <Icon icon="mdi:video-outline" class="text-3xl mb-2" />
      <p class="text-sm">No uploads yet</p>
    </div>
  </Card>
</template>
