<script setup lang="ts">
import type { FieldSize } from '~/composables/useFieldDensity'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  helper?: string
  required?: boolean
  disabled?: boolean
  /** Omit to inherit the density of the surrounding container. */
  size?: FieldSize
  /**
   * Extra classes for the label. Lets a repeating row keep the label for screen readers and
   * stacked mobile layouts while hiding it at widths where a column heading is shown.
   */
  labelClass?: string
}
const props = withDefaults(defineProps<Props>(), { type: 'text' })
const emit = defineEmits<{ 'update:modelValue': [val: string] }>()

// The label is a sibling of the input rather than a wrapper, so it needs an explicit
// `for`/`id` pair — without one, clicking the label does not focus the field and
// assistive technology reports the input as unnamed.
const size = useFieldSize(() => props.size)

const sizeClasses: Record<FieldSize, string> = {
  sm: 'px-2.5 py-1.5 text-[13px]',
  md: 'px-3 py-2 text-sm',
}

const inputId = useId()
const messageId = computed(() => (props.error || props.helper ? `${inputId}-message` : undefined))
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="inputId" :class="['text-sm font-medium text-gray-700', labelClass]">
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
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="messageId"
        :class="[
          'w-full rounded-lg border outline-none transition-all',
          sizeClasses[size],
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
    <p v-if="error" :id="messageId" class="text-xs text-red-500">{{ error }}</p>
    <p v-else-if="helper" :id="messageId" class="text-xs text-gray-400">{{ helper }}</p>
  </div>
</template>
