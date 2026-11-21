<script setup lang="ts">
interface Props {
  icon?: string
  label: string
  value: string
  variant?: 'default' | 'warning'
}
withDefaults(defineProps<Props>(), { variant: 'default' })
</script>

<template>
  <div class="flex min-w-0 items-start gap-2.5">
    <div
      class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md"
      :class="variant === 'warning' ? 'bg-warning-soft' : 'bg-primary-soft'"
    >
      <Icon
        v-if="icon"
        :icon="icon"
        class="text-sm"
        :class="variant === 'warning' ? 'text-warning' : 'text-primary-ink'"
      />
    </div>
    <div class="min-w-0">
      <p
        class="mb-0.5 text-2xs leading-tight font-semibold tracking-wide text-ink-subtle uppercase"
      >
        {{ label }}
      </p>
      <!-- `whitespace-pre-line` so a multi-line value (a member's comment) keeps its line
           breaks. No effect on the single-line values every other field holds. -->
      <p class="text-sm leading-snug font-medium wrap-break-word whitespace-pre-line text-ink">
        {{ value }}
      </p>
    </div>
  </div>
</template>
