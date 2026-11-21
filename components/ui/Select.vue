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
  sm: 'px-2.5 py-1.5 pr-8 min-h-9 text-[13px]',
  md: 'px-3 py-2 pr-9 min-h-11 text-[15px] sm:min-h-10 sm:text-sm',
}

// See Input.vue — the label sits beside the control, so the association has to be explicit.
const selectId = useId()
const messageId = computed(() => (props.error ? `${selectId}-message` : undefined))
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="selectId" :class="['text-sm font-medium text-ink', labelClass]">
      {{ label }}<span v-if="required" class="ml-0.5 text-error" aria-hidden="true">*</span>
    </label>
    <div class="relative">
      <select
        :id="selectId"
        :value="modelValue"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="messageId"
        :class="[
          'w-full cursor-pointer appearance-none rounded-md border bg-surface shadow-xs outline-none transition-[border-color,box-shadow] duration-150',
          sizeClasses[size],
          'hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15',
          error ? 'border-error focus:border-error focus:ring-error/15' : 'border-rule-strong',
          !modelValue ? 'text-ink-subtle' : 'text-ink',
        ]"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <Icon
        icon="mdi:chevron-down"
        class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-base text-ink-subtle"
        aria-hidden="true"
      />
    </div>
    <p v-if="error" :id="messageId" class="flex items-start gap-1 text-xs font-medium text-error">
      <Icon icon="mdi:alert-circle-outline" class="mt-px shrink-0 text-sm" aria-hidden="true" />
      {{ error }}
    </p>
  </div>
</template>
