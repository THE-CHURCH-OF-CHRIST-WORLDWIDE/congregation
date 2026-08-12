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
  <div class="flex items-start gap-2 min-w-0">
    <div
      class="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
      :style="variant === 'warning' ? { backgroundColor: '#FFFCF5' } : undefined"
      :class="variant === 'default' ? 'bg-blue-50' : ''"
    >
      <Icon
        v-if="icon"
        :icon="icon"
        class="text-xs"
        :style="variant === 'warning' ? { color: '#F3A218' } : undefined"
        :class="variant === 'default' ? 'text-blue-500' : ''"
      />
    </div>
    <div class="min-w-0">
      <p class="text-[10px] text-gray-400 leading-tight mb-0.5">{{ label }}</p>
      <!-- `whitespace-pre-line` so a multi-line value (a member's comment) keeps its line
           breaks. No effect on the single-line values every other field holds. -->
      <p class="text-xs font-medium leading-snug wrap-break-word whitespace-pre-line text-gray-800">
        {{ value }}
      </p>
    </div>
  </div>
</template>
