<script setup lang="ts">
const teachingsStore = useTeachingsStore()

const sermons = computed(() => teachingsStore.recentSermons)
</script>

<template>
  <Card padding="none" class="flex h-full flex-col overflow-hidden p-5">
    <h3 class="font-sans text-base font-semibold text-ink">Recent Video Uploads</h3>

    <div
      v-if="sermons.length"
      class="-mx-5 mt-3 -mb-5 flex max-h-[280px] flex-col divide-y divide-rule overflow-y-auto border-t border-rule"
    >
      <div v-for="sermon in sermons" :key="sermon.id" class="flex items-start gap-3 px-5 py-3">
        <div
          class="flex min-w-[64px] shrink-0 flex-col items-center rounded-md border border-rule bg-surface-muted px-2 py-1.5 text-center"
        >
          <p class="num font-sans text-base leading-tight font-semibold text-ink">
            {{ sermon.videoAttendees ?? 0 }}
          </p>
          <p class="text-2xs font-medium text-ink-subtle">attendees</p>
        </div>
        <div class="min-w-0 flex-1">
          <p class="line-clamp-2 text-sm leading-snug font-medium text-ink">
            {{ sermon.topic }}
          </p>
          <div class="mt-1 flex items-center gap-1 text-ink-subtle">
            <Icon icon="mdi:calendar-outline" class="shrink-0 text-xs" aria-hidden="true" />
            <span class="num text-xs">{{ formatDate(sermon.date, 'numeric') }}</span>
          </div>
        </div>
      </div>
    </div>

    <EmptyState
      v-else
      icon="mdi:video-outline"
      size="sm"
      title="No videos yet"
      description="Recorded services you publish will appear here."
    />
  </Card>
</template>
