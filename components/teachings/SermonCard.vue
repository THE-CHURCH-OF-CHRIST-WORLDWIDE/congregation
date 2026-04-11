<script setup lang="ts">
import type { Sermon } from '~/types'

interface Props {
  sermon: Sermon
}
const props = defineProps<Props>()
const teachingsStore = useTeachingsStore()
const showMenu = ref(false)

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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <Card class="flex flex-col gap-3">
    <!-- Thumbnail -->
    <div class="w-full h-36 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden flex items-center justify-center">
      <img v-if="sermon.thumbnail" :src="sermon.thumbnail" :alt="sermon.topic" class="w-full h-full object-cover" />
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
      <h4 class="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{{ sermon.topic }}</h4>
      <p class="text-xs text-gray-500 mt-1">{{ sermon.preacher }} · {{ formatDate(sermon.date) }}</p>
    </div>

    <div class="flex items-center justify-between">
      <button class="text-xs text-blue-600 hover:underline flex items-center gap-1">
        Read more
        <Icon icon="mdi:arrow-right" class="text-[10px]" />
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
          <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Icon icon="mdi:pencil-outline" />Edit
          </button>
          <button
            class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            @click="teachingsStore.deleteSermon(sermon.id); showMenu = false"
          >
            <Icon icon="mdi:trash-can-outline" />Delete
          </button>
        </div>
      </div>
    </div>
  </Card>
</template>
