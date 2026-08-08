<script setup lang="ts">
import type { Sermon } from '~/types'

interface Props {
  sermon: Sermon
}
defineProps<Props>()
const teachingsStore = useTeachingsStore()
const showMenu = ref(false)
const expanded = ref(false)

const categoryColors: Record<string, string> = {
  Church: 'bg-blue-100 text-blue-700',
  Truth: 'bg-purple-100 text-purple-700',
  Faith: 'bg-green-100 text-green-700',
  Prayer: 'bg-amber-100 text-amber-700',
  Youth: 'bg-pink-100 text-pink-700',
  'Bible Study': 'bg-teal-100 text-teal-700',
  'Christian Living': 'bg-indigo-100 text-indigo-700',
  Spirit: 'bg-violet-100 text-violet-700',
  Worship: 'bg-rose-100 text-rose-700',
}

function getCategoryColor(cat: string) {
  return categoryColors[cat] ?? 'bg-gray-100 text-gray-700'
}

const { isPending, run } = usePendingAction()

async function deleteSermon(id: string) {
  await run(id, () => teachingsStore.deleteSermon(id).catch(() => {}))
  showMenu.value = false
}
</script>

<template>
  <Card class="flex flex-col gap-3">
    <!-- Thumbnail -->
    <div
      class="w-full h-36 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden flex items-center justify-center"
    >
      <img
        v-if="sermon.thumbnail"
        :src="sermon.thumbnail"
        :alt="sermon.topic"
        class="w-full h-full object-cover"
      />
      <Icon v-else icon="mdi:play-circle-outline" class="text-white text-5xl opacity-70" />
    </div>

    <!-- Categories -->
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="cat in sermon.categories"
        :key="cat"
        :class="['text-[10px] font-medium px-2 py-0.5 rounded-full', getCategoryColor(cat)]"
      >
        {{ cat }}
      </span>
    </div>

    <!-- Content -->
    <div class="flex-1">
      <h4 class="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
        {{ sermon.topic }}
      </h4>
      <p class="text-xs text-gray-500 mt-1">
        {{ sermon.preacher }} · {{ formatDate(sermon.date) }}
      </p>

      <div v-if="expanded" class="mt-3 space-y-2 border-t border-gray-100 pt-3">
        <p v-if="sermon.scripture" class="text-xs font-medium text-gray-700">
          <Icon icon="mdi:book-open-variant" class="mr-1 inline-block align-text-bottom" />
          {{ sermon.scripture }}
        </p>
        <p class="text-xs leading-relaxed text-gray-600">
          {{ sermon.description || 'No description was provided for this teaching.' }}
        </p>
        <a
          v-if="sermon.documentFile"
          :href="sermon.documentFile"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
        >
          <Icon icon="mdi:file-document-outline" />
          Open attached document
        </a>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <button
        class="text-xs text-blue-600 hover:underline flex items-center gap-1"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Show less' : 'Read more' }}
        <Icon
          icon="mdi:chevron-down"
          class="text-[12px] transition-transform"
          :class="expanded && 'rotate-180'"
        />
      </button>
      <div class="relative">
        <button
          class="p-1 rounded hover:bg-gray-100 text-gray-400"
          :aria-label="`Actions for ${sermon.topic}`"
          @click.stop="showMenu = !showMenu"
        >
          <Icon icon="mdi:dots-vertical" />
        </button>
        <div
          v-if="showMenu"
          class="absolute right-0 bottom-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-28"
          @click.stop
        >
          <button
            class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            :disabled="isPending(sermon.id)"
            @click="deleteSermon(sermon.id)"
          >
            <Icon icon="mdi:trash-can-outline" />Delete
          </button>
        </div>
      </div>
    </div>
  </Card>
</template>
