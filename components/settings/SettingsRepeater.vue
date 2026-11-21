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
  <div class="flex flex-col">
    <!-- Headings track the row grid, with an empty cell over the remove column. -->
    <div
      v-if="columns?.length"
      :class="['hidden gap-3 border-b border-rule-strong px-3 pb-2 sm:grid', gridClass]"
      aria-hidden="true"
    >
      <span
        v-for="column in columns"
        :key="column"
        class="text-2xs font-semibold tracking-[0.06em] text-ink-muted uppercase"
      >
        {{ column }}
      </span>
      <span></span>
    </div>

    <div
      v-for="(item, index) in items"
      :key="index"
      :class="[
        'grid items-start gap-3 border-b border-rule px-3 py-3 transition-colors duration-150 first:border-t first:border-t-rule hover:bg-surface-muted/60',
        gridClass,
      ]"
    >
      <slot :item="item" :index="index"></slot>
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center justify-self-end rounded-md text-ink-subtle transition-colors duration-150 hover:bg-error-soft hover:text-error"
        :aria-label="`Remove ${noun ?? 'row'} ${index + 1}`"
        @click="$emit('remove', index)"
      >
        <Icon icon="mdi:close" class="text-base" />
      </button>
    </div>

    <p
      v-if="!items.length"
      class="rounded-md border border-dashed border-rule-strong bg-surface-muted py-6 text-center text-sm text-ink-subtle"
    >
      {{ empty ?? 'Nothing added yet.' }}
    </p>
  </div>
</template>
