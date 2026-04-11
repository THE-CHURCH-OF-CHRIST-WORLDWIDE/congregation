<script setup lang="ts">
interface Option { label: string; value: string }
interface Props {
  modelValue?: string
  options: Option[]
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
}
withDefaults(defineProps<Props>(), { placeholder: 'Select...' })
const emit = defineEmits<{ 'update:modelValue': [val: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <select
        :value="modelValue"
        :required="required"
        :class="[
          'w-full appearance-none rounded-lg border text-sm px-3 py-2 pr-8 outline-none transition-all bg-white',
          'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
          error ? 'border-red-400' : 'border-gray-300',
          !modelValue ? 'text-gray-400' : 'text-gray-900',
        ]"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <Icon icon="mdi:chevron-down" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
