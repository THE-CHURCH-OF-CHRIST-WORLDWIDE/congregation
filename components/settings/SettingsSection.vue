<script setup lang="ts">
/**
 * A titled block of settings.
 *
 * Replaces the ad-hoc `<Card><h3 class="mb-4 …">` pattern the panels grew: a bare heading
 * sitting above a stack of fields gives no hierarchy and no room to say what the fields
 * actually affect. Here the title, an optional description and an optional action share a
 * header, so every section reads the same way.
 */
defineProps<{
  title: string
  /** One line on what these fields change, and where it shows up. */
  description?: string
}>()
</script>

<template>
  <Card padding="none">
    <header class="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
      <div class="min-w-0">
        <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
        <p v-if="description" class="mt-1 text-xs leading-relaxed text-gray-500">
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.actions" class="shrink-0">
        <slot name="actions"></slot>
      </div>
    </header>

    <div class="p-5">
      <slot></slot>
    </div>
  </Card>
</template>
