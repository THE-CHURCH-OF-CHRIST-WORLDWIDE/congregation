<script setup lang="ts">
/**
 * Standard "there's nothing here yet" placeholder.
 *
 * Every list in the app should render this rather than collapsing to nothing —
 * a blank area reads as a broken page, while a worded empty state tells the
 * reader the screen loaded and simply has no records yet.
 */
interface Props {
  /** Iconify name; pick something that matches the content type. */
  icon?: string
  title: string
  /** Optional second line — say what would fill this space, or how to add it. */
  description?: string
  /** `sm` for inline card slots, `md` for full page sections. */
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  icon: 'mdi:inbox-outline',
  size: 'md',
})
</script>

<template>
  <div
    :class="[
      'flex flex-col items-center justify-center text-center',
      size === 'sm' ? 'gap-1.5 py-6' : 'gap-2 py-12',
    ]"
  >
    <div
      :class="[
        'flex items-center justify-center rounded-full bg-gray-50 text-gray-300',
        size === 'sm' ? 'h-9 w-9' : 'h-12 w-12',
      ]"
    >
      <Icon :icon="icon" :class="size === 'sm' ? 'text-lg' : 'text-2xl'" />
    </div>
    <p :class="['font-medium text-gray-600', size === 'sm' ? 'text-xs' : 'text-sm']">
      {{ title }}
    </p>
    <p
      v-if="description"
      :class="['max-w-sm text-gray-400', size === 'sm' ? 'text-[11px]' : 'text-xs']"
    >
      {{ description }}
    </p>
    <div v-if="$slots.action" :class="size === 'sm' ? 'mt-1' : 'mt-2'">
      <slot name="action"></slot>
    </div>
  </div>
</template>
