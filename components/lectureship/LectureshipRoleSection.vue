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
    <div class="flex items-center justify-between gap-3 border-b border-rule pb-2">
      <h3 class="font-display text-lg font-semibold text-ink">{{ meta.plural }}</h3>
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
      <ul class="divide-y divide-rule">
        <li
          v-for="s in items"
          :key="s.id"
          class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/70"
        >
          <img
            v-if="s.avatar"
            :src="displayableImageUrl(s.avatar)"
            :alt="s.name"
            class="size-10 shrink-0 rounded-full border border-rule object-cover"
          />
          <div
            v-else
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-ink"
          >
            {{ s.name.slice(0, 2).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-ink">{{ s.name }}</p>
            <p v-if="s.title" class="truncate text-xs text-ink-muted">{{ s.title }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-0.5">
            <button
              class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
              :aria-label="`Edit ${s.name}`"
              @click="emit('edit', s)"
            >
              <Icon icon="mdi:pencil-outline" class="text-base" />
            </button>
            <button
              class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-error-soft hover:text-error disabled:opacity-55"
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
