<script setup lang="ts">
const teachingsStore = useTeachingsStore()

const sermons = computed(() => teachingsStore.recentSermons)
</script>

<template>
  <Card class="h-full">
    <h3 class="text-sm font-semibold text-gray-900 mb-4">Recent Video Uploads</h3>
    <div v-if="sermons.length" class="space-y-3">
      <div v-for="sermon in sermons" :key="sermon.id" class="flex items-start gap-3">
        <div
          class="flex-shrink-0 bg-pink-500 text-white text-xs font-bold rounded-lg px-2 py-1.5 text-center min-w-[64px]"
        >
          <p class="text-sm leading-tight">{{ sermon.videoAttendees ?? 0 }}</p>
          <p class="text-[10px] font-medium">attendees</p>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-800 leading-tight line-clamp-1">
            {{ sermon.topic }}
          </p>
          <div class="flex items-center gap-1 mt-1 text-gray-400">
            <Icon icon="mdi:calendar-outline" class="text-xs flex-shrink-0" />
            <span class="text-xs">{{ formatDate(sermon.date, 'numeric') }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-6 text-gray-400">
      <Icon icon="mdi:video-outline" class="text-3xl mb-2" />
      <p class="text-sm">No uploads yet</p>
    </div>
    <NuxtLink
      to="/admin/teachings"
      class="block text-center text-xs text-blue-600 hover:underline mt-4"
    >
      View all →
    </NuxtLink>
  </Card>
</template>
