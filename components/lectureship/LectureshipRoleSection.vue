<script setup lang="ts">
import type { LectureshipSpeaker, LectureshipSpeakerRole } from '~/types'
import { LECTURESHIP_ROLES } from '~/constants'

const props = defineProps<{
  role: LectureshipSpeakerRole
  items: LectureshipSpeaker[]
  /** Id of the entry currently mid-delete, so only its row shows the spinner. */
  busyId: string | null
}>()

const emit = defineEmits<{
  add: []
  edit: [speaker: LectureshipSpeaker]
  delete: [speaker: LectureshipSpeaker]
}>()

const meta = computed(() => LECTURESHIP_ROLES[props.role])
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-900">{{ meta.plural }}</h3>
      <Button size="sm" variant="secondary" @click="emit('add')">
        <template #icon-left><Icon icon="mdi:plus" /></template>
        Add {{ meta.label }}
      </Button>
    </div>

    <EmptyState
      v-if="!items.length"
      :icon="meta.emptyIcon"
      :title="meta.emptyTitle"
      :description="meta.emptyDescription"
      size="sm"
    />

    <Card v-else padding="none">
      <ul class="divide-y divide-gray-50">
        <li v-for="s in items" :key="s.id" class="flex items-center gap-3 px-4 py-3">
          <img
            v-if="s.avatar"
            :src="displayableImageUrl(s.avatar)"
            :alt="s.name"
            class="h-10 w-10 shrink-0 rounded-full object-cover"
          />
          <div
            v-else
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800"
          >
            {{ s.name.slice(0, 2).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900">{{ s.name }}</p>
            <p v-if="s.title" class="truncate text-xs text-gray-500">{{ s.title }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button
              class="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              :aria-label="`Edit ${s.name}`"
              @click="emit('edit', s)"
            >
              <Icon icon="mdi:pencil-outline" class="text-base" />
            </button>
            <button
              class="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              :disabled="busyId === s.id"
              :aria-label="`Remove ${s.name}`"
              @click="emit('delete', s)"
            >
              <Icon
                :icon="busyId === s.id ? 'mdi:loading' : 'mdi:trash-can-outline'"
                :class="['text-base', busyId === s.id && 'animate-spin']"
              />
            </button>
          </div>
        </li>
      </ul>
    </Card>
  </div>
</template>
