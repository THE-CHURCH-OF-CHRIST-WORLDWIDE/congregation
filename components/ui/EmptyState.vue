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
      size === 'sm' ? 'gap-1.5 px-4 py-6' : 'gap-2.5 px-6 py-14',
    ]"
  >
    <div
      :class="[
        'flex items-center justify-center rounded-full border border-rule-strong text-accent',
        size === 'sm' ? 'mb-1 size-10' : 'mb-2 size-14',
      ]"
      aria-hidden="true"
    >
      <Icon :icon="icon" :class="size === 'sm' ? 'text-lg' : 'text-2xl'" />
    </div>
    <p
      :class="[
        size === 'sm'
          ? 'text-sm font-semibold text-ink'
          : 'font-display text-[1.5rem] leading-tight text-ink',
      ]"
    >
      {{ title }}
    </p>
    <p
      v-if="description"
      :class="[
        'max-w-sm leading-relaxed text-ink-muted',
        size === 'sm' ? 'text-xs' : 'text-[15px]',
      ]"
    >
      {{ description }}
    </p>
    <div v-if="$slots.action" :class="size === 'sm' ? 'mt-2' : 'mt-4'">
      <slot name="action"></slot>
    </div>
  </div>
</template>
