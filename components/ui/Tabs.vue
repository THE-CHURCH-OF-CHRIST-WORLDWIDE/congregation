<script setup lang="ts">
interface Tab { label: string; value: string }
interface Props {
  modelValue: string
  tabs: Tab[]
}
defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [val: string] }>()
</script>

<template>
  <div class="flex gap-1 border-b border-gray-200">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      :class="[
        'px-3 py-2 text-sm font-normal transition-all border-b-2 -mb-px cursor-pointer',
        modelValue === tab.value
          ? 'text-blue-600 border-blue-600 font-medium'
          : 'text-gray-500 border-transparent hover:text-gray-700',
      ]"
      @click="emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
