<script setup lang="ts" generic="T">
/**
 * A list of editable rows: column headings once at the top, unlabelled fields beneath.
 *
 * The panels previously repeated a label on every field of every row, so a five-row calendar
 * printed "Day / Activity / Time" five times. That reads as noise and pushes each row taller
 * than it needs to be. Here the headings are stated once and the rows align to them.
 *
 * The remove control gets its own column rather than being positioned over the row, which is
 * what used to leave it sitting on top of the last field's label.
 *
 * Headings are hidden below `sm`, where the grid collapses to one field per line — so each
 * field still needs its own `label` for the stacked case; pass `sr-only`-style short labels or
 * rely on placeholders, and keep `aria-label` on anything unlabelled.
 */
defineProps<{
  items: T[]
  /** Column headings, in order. Omit for single-field rows that need no header. */
  columns?: string[]
  /** Tailwind grid template for a row, including the trailing `auto` for the remove column. */
  gridClass: string
  /** Shown in place of the list when there is nothing yet. */
  empty?: string
  /** Used in the remove button's accessible name: "Remove {noun} 2". */
  noun?: string
}>()

defineEmits<{ remove: [index: number] }>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Headings track the row grid, with an empty cell over the remove column. -->
    <div
      v-if="columns?.length"
      :class="['hidden gap-3 px-3 sm:grid', gridClass]"
      aria-hidden="true"
    >
      <span
        v-for="column in columns"
        :key="column"
        class="text-[11px] font-medium uppercase tracking-wide text-gray-400"
      >
        {{ column }}
      </span>
      <span></span>
    </div>

    <div
      v-for="(item, index) in items"
      :key="index"
      :class="['items-start gap-3 rounded-lg border border-gray-200 p-3 grid', gridClass]"
    >
      <slot :item="item" :index="index"></slot>
      <button
        type="button"
        class="mt-0.5 rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
        :aria-label="`Remove ${noun ?? 'row'} ${index + 1}`"
        @click="$emit('remove', index)"
      >
        <Icon icon="mdi:close" class="text-sm" />
      </button>
    </div>

    <p v-if="!items.length" class="rounded-lg bg-gray-50 py-6 text-center text-sm text-gray-400">
      {{ empty ?? 'Nothing added yet.' }}
    </p>
  </div>
</template>
