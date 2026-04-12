<script setup lang="ts">
const props = defineProps<{
  tags: string[]
  active: string
}>()

const emit = defineEmits<{
  'update:active': [value: string]
}>()
</script>

<template>
  <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
    <button
      v-for="tag in props.tags"
      :key="tag"
      :class="[
        'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
        props.active === tag
          ? 'bg-[#2563EB] text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      ]"
      @click="emit('update:active', tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>
