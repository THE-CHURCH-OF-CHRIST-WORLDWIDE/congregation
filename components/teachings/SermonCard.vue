<script setup lang="ts">
import type { Sermon } from '~/types'

interface Props {
  sermon: Sermon
}
const props = defineProps<Props>()
const teachingsStore = useTeachingsStore()
const showMenu = ref(false)
const expanded = ref(false)

const categoryColors: Record<string, string> = {
  Church: 'bg-info-soft text-info',
  Truth: 'bg-secondary-soft text-secondary',
  Faith: 'bg-success-soft text-success',
  Prayer: 'bg-warning-soft text-warning',
  Youth: 'bg-accent-soft text-accent',
  'Bible Study': 'bg-primary-soft text-primary-ink',
  'Christian Living': 'bg-info-soft text-info',
  Spirit: 'bg-secondary-soft text-secondary',
  Worship: 'bg-accent-soft text-accent',
}

function getCategoryColor(cat: string) {
  return categoryColors[cat] ?? 'bg-surface-sunken text-ink-muted'
}

const { isPending, run } = usePendingAction()

const { confirmDelete } = useConfirm()

async function deleteSermon(id: string) {
  showMenu.value = false
  const ok = await confirmDelete(props.sermon.topic || 'this teaching', {
    message: 'The teaching and its uploaded files will no longer appear on the site.',
  })
  if (!ok) return
  await run(id, () => teachingsStore.deleteSermon(id).catch(() => {}))
}
</script>

<template>
  <Card class="flex flex-col gap-3">
    <!-- Thumbnail -->
    <div
      class="bookcloth flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-rule"
    >
      <img
        v-if="sermon.thumbnail"
        :src="displayableImageUrl(sermon.thumbnail)"
        :alt="sermon.topic"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover"
      />
      <Icon v-else icon="mdi:play-circle-outline" class="text-5xl opacity-70" aria-hidden="true" />
    </div>

    <!-- Categories -->
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="cat in sermon.categories"
        :key="cat"
        :class="['rounded-sm px-1.5 py-0.5 text-[11px] font-semibold', getCategoryColor(cat)]"
      >
        {{ cat }}
      </span>
    </div>

    <!-- Content -->
    <div class="flex-1">
      <h4 class="line-clamp-2 font-display text-lg leading-snug text-ink">
        {{ sermon.topic }}
      </h4>
      <p class="mt-1 text-xs text-ink-muted">
        {{ sermon.preacher }} · <span class="num">{{ formatDate(sermon.date) }}</span>
      </p>

      <div v-if="expanded" class="mt-3 space-y-2 border-t border-rule pt-3">
        <p v-if="sermon.scripture" class="text-xs font-medium text-ink">
          <Icon
            icon="mdi:book-open-variant"
            class="mr-1 inline-block align-text-bottom text-ink-subtle"
            aria-hidden="true"
          />
          {{ sermon.scripture }}
        </p>
        <p class="text-[13px] leading-relaxed text-ink-muted">
          {{ sermon.description || 'No description was provided for this teaching.' }}
        </p>
        <a
          v-if="sermon.documentFile"
          :href="sermon.documentFile"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-xs font-medium text-primary-ink underline-offset-3 hover:underline"
        >
          <Icon icon="mdi:file-document-outline" aria-hidden="true" />
          Open attached document
        </a>
      </div>
    </div>

    <div class="-mx-1 flex items-center justify-between border-t border-rule pt-2">
      <button
        class="inline-flex min-h-9 items-center gap-1 rounded-md px-1 text-xs font-medium text-primary-ink hover:underline"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Show less' : 'Read more' }}
        <Icon
          icon="mdi:chevron-down"
          class="text-[14px] transition-transform duration-150"
          :class="expanded && 'rotate-180'"
          aria-hidden="true"
        />
      </button>
      <div class="relative">
        <button
          class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
          :aria-label="`Actions for ${sermon.topic}`"
          @click.stop="showMenu = !showMenu"
        >
          <Icon icon="mdi:dots-vertical" aria-hidden="true" />
        </button>
        <div
          v-if="showMenu"
          class="absolute right-0 bottom-10 z-10 w-32 rounded-md border border-rule bg-surface py-1 shadow-lg"
          @click.stop
        >
          <button
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error hover:bg-error-soft disabled:opacity-55"
            :disabled="isPending(sermon.id)"
            @click="deleteSermon(sermon.id)"
          >
            <Icon icon="mdi:trash-can-outline" aria-hidden="true" />Delete
          </button>
        </div>
      </div>
    </div>
  </Card>
</template>
