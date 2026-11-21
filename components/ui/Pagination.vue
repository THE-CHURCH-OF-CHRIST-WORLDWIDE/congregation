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
    class="flex flex-col items-center justify-between gap-3 border-t border-rule px-4 py-3 sm:flex-row"
  >
    <p class="num text-xs text-ink-muted">
      Showing {{ rangeStart }}–{{ rangeEnd }} of {{ total }} {{ label }}
    </p>

    <nav class="flex items-center gap-1" aria-label="Pagination">
      <button
        class="inline-flex size-9 items-center justify-center rounded-md border border-rule-strong bg-surface text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        :disabled="page <= 1"
        aria-label="Previous page"
        @click="go(page - 1)"
      >
        <Icon icon="mdi:chevron-left" />
      </button>

      <template v-for="(p, i) in pages" :key="`${p}-${i}`">
        <span v-if="p === '…'" class="px-1 text-xs text-ink-subtle" aria-hidden="true">…</span>
        <button
          v-else
          :class="[
            'num inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-[13px] font-medium transition-colors',
            p === page
              ? 'border-primary bg-primary text-on-primary'
              : 'border-rule-strong bg-surface text-ink hover:bg-surface-muted',
          ]"
          :aria-current="p === page ? 'page' : undefined"
          :aria-label="`Page ${p}`"
          @click="go(p as number)"
        >
          {{ p }}
        </button>
      </template>

      <button
        class="inline-flex size-9 items-center justify-center rounded-md border border-rule-strong bg-surface text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        :disabled="page >= totalPages"
        aria-label="Next page"
        @click="go(page + 1)"
      >
        <Icon icon="mdi:chevron-right" />
      </button>
    </nav>
  </div>
</template>
