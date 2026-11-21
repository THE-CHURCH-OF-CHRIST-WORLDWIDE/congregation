<script setup lang="ts">
/**
 * Public-site empty state, set as an editorial note inside the section's own grid:
 * one italic serif line and one muted sentence. (Admin keeps `EmptyState`.)
 */
withDefaults(
  defineProps<{
    title: string
    description?: string
    /** `night` / `forest` when the note sits on a dark field */
    tone?: 'ivory' | 'night' | 'forest'
  }>(),
  { tone: 'ivory' }
)
</script>

<template>
  <div
    v-reveal
    class="max-w-xl border-t py-10"
    :class="tone === 'ivory' ? 'border-rule' : 'border-on-night/20'"
    role="status"
  >
    <p
      class="font-display text-[clamp(1.75rem,2.6vw,2.25rem)] leading-[1.1] italic"
      :class="tone === 'ivory' ? 'text-ink' : 'text-on-night'"
    >
      {{ title }}
    </p>
    <p
      v-if="description"
      class="mt-3 text-base leading-relaxed"
      :class="tone === 'ivory' ? 'text-ink-muted' : 'text-on-night-muted'"
    >
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action"></slot>
    </div>
  </div>
</template>
