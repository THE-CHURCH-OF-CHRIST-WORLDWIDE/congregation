<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  helper?: string
  required?: boolean
  disabled?: boolean
}
withDefaults(defineProps<Props>(), { type: 'text' })
const emit = defineEmits<{ 'update:modelValue': [val: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <div
        v-if="$slots['icon-left']"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      >
        <slot name="icon-left"></slot>
      </div>
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :class="[
          'w-full rounded-lg border text-sm px-3 py-2 outline-none transition-all',
          'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
          'disabled:bg-gray-50 disabled:text-gray-400',
          error ? 'border-red-400' : 'border-gray-300',
          $slots['icon-left'] ? 'pl-9' : '',
          $slots['icon-right'] ? 'pr-9' : '',
        ]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <div
        v-if="$slots['icon-right']"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      >
        <slot name="icon-right"></slot>
      </div>
    </div>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-else-if="helper" class="text-xs text-gray-400">{{ helper }}</p>
  </div>
</template>
