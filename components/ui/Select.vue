<script setup lang="ts">
import type { FieldSize } from '~/composables/useFieldDensity'

interface Option {
  label: string
  value: string
}
interface Props {
  modelValue?: string
  options: Option[]
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  /** Omit to inherit the density of the surrounding container. */
  size?: FieldSize
  /**
   * Extra classes for the label. Lets a repeating row keep the label for screen readers and
   * stacked mobile layouts while hiding it at widths where a column heading is shown.
   */
  labelClass?: string
}
const props = withDefaults(defineProps<Props>(), { placeholder: 'Select...' })
const emit = defineEmits<{ 'update:modelValue': [val: string] }>()

const size = useFieldSize(() => props.size)

const sizeClasses: Record<FieldSize, string> = {
  sm: 'px-2.5 py-1.5 pr-8 text-[13px]',
  md: 'px-3 py-2 pr-8 text-sm',
}

// See Input.vue — the label sits beside the control, so the association has to be explicit.
const selectId = useId()
const messageId = computed(() => (props.error ? `${selectId}-message` : undefined))
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="selectId" :class="['text-sm font-medium text-gray-700', labelClass]">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <select
        :id="selectId"
        :value="modelValue"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="messageId"
        :class="[
          'w-full appearance-none rounded-lg border outline-none transition-all bg-white',
          sizeClasses[size],
          'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
          error ? 'border-red-400' : 'border-gray-300',
          !modelValue ? 'text-gray-400' : 'text-gray-900',
        ]"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <Icon
        icon="mdi:chevron-down"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
    <p v-if="error" :id="messageId" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
