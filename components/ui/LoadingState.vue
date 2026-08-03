<script setup lang="ts">
/**
 * Companion to `EmptyState` for the moment before data arrives.
 *
 * The distinction matters: an empty list and a list that is still loading look
 * identical otherwise, and telling a user "no members yet" while the fetch is
 * still in flight is simply wrong.
 */
interface Props {
  /** Shown under the spinner. Say what is being fetched. */
  title?: string
  /** `sm` for inline card slots, `md` for full page sections. */
  size?: 'sm' | 'md'
  /** Render skeleton rows instead of a spinner — better for tables. */
  rows?: number
}

withDefaults(defineProps<Props>(), {
  title: 'Loading…',
  size: 'md',
  rows: 0,
})
</script>

<template>
  <!-- Skeleton variant: mimics the shape of the rows about to appear. -->
  <div v-if="rows > 0" class="flex flex-col gap-2 py-3" role="status" :aria-label="title">
    <div
      v-for="i in rows"
      :key="i"
      class="h-9 animate-pulse rounded-lg bg-gray-100"
      :style="{ animationDelay: `${i * 60}ms` }"
    ></div>
    <span class="sr-only">{{ title }}</span>
  </div>

  <!-- Spinner variant -->
  <div
    v-else
    :class="[
      'flex flex-col items-center justify-center text-center',
      size === 'sm' ? 'gap-1.5 py-6' : 'gap-2 py-12',
    ]"
    role="status"
  >
    <Icon
      icon="mdi:loading"
      :class="['animate-spin text-gray-300', size === 'sm' ? 'text-xl' : 'text-3xl']"
    />
    <p :class="['font-medium text-gray-500', size === 'sm' ? 'text-xs' : 'text-sm']">
      {{ title }}
    </p>
  </div>
</template>
