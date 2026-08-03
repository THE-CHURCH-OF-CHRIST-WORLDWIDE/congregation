<script setup lang="ts">
/**
 * Shared pager. Renders nothing when everything fits on one page, so callers
 * can drop it in unconditionally.
 */
interface Props {
  page: number
  totalPages: number
  total: number
  rangeStart: number
  rangeEnd: number
  /** What is being counted, for the summary line. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), { label: 'items' })
const emit = defineEmits<{ 'update:page': [page: number] }>()

/**
 * Windowed page numbers with ellipses, so a hundred pages don't produce a
 * hundred buttons: 1 … 4 [5] 6 … 20
 */
const pages = computed<(number | '…')[]>(() => {
  const { page, totalPages } = props
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const out: (number | '…')[] = [1]
  const from = Math.max(2, page - 1)
  const to = Math.min(totalPages - 1, page + 1)
  if (from > 2) out.push('…')
  for (let p = from; p <= to; p++) out.push(p)
  if (to < totalPages - 1) out.push('…')
  out.push(totalPages)
  return out
})

function go(p: number) {
  const next = Math.min(Math.max(1, p), props.totalPages)
  if (next !== props.page) emit('update:page', next)
}
</script>

<template>
  <div
    v-if="totalPages > 1"
    class="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row"
  >
    <p class="text-xs text-gray-500">
      Showing {{ rangeStart }}–{{ rangeEnd }} of {{ total }} {{ label }}
    </p>

    <nav class="flex items-center gap-1" aria-label="Pagination">
      <button
        class="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-40"
        :disabled="page <= 1"
        aria-label="Previous page"
        @click="go(page - 1)"
      >
        <Icon icon="mdi:chevron-left" />
      </button>

      <template v-for="(p, i) in pages" :key="`${p}-${i}`">
        <span v-if="p === '…'" class="px-1 text-xs text-gray-400">…</span>
        <button
          v-else
          :class="[
            'min-w-[28px] rounded border px-2 py-1 text-xs',
            p === page
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-gray-200 hover:bg-gray-50',
          ]"
          :aria-current="p === page ? 'page' : undefined"
          :aria-label="`Page ${p}`"
          @click="go(p as number)"
        >
          {{ p }}
        </button>
      </template>

      <button
        class="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-40"
        :disabled="page >= totalPages"
        aria-label="Next page"
        @click="go(page + 1)"
      >
        <Icon icon="mdi:chevron-right" />
      </button>
    </nav>
  </div>
</template>
