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
  sm: 'px-2.5 py-1.5 min-h-9 text-[13px]',
  md: 'px-3 py-2 min-h-11 text-[15px] sm:min-h-10 sm:text-sm',
}

const inputId = useId()
const messageId = computed(() => (props.error || props.helper ? `${inputId}-message` : undefined))
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="inputId" :class="['text-sm font-medium text-ink', labelClass]">
      {{ label }}<span v-if="required" class="ml-0.5 text-error" aria-hidden="true">*</span>
    </label>
    <div class="relative">
      <div
        v-if="$slots['icon-left']"
        class="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-ink-subtle"
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
          'w-full rounded-md border bg-surface text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150',
          sizeClasses[size],
          'hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15',
          'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-subtle disabled:hover:border-rule-strong',
          error
            ? 'border-error hover:border-error focus:border-error focus:ring-error/15'
            : 'border-rule-strong',
          $slots['icon-left'] ? 'pl-9' : '',
          $slots['icon-right'] ? 'pr-9' : '',
        ]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <div
        v-if="$slots['icon-right']"
        class="absolute right-3 top-1/2 flex -translate-y-1/2 text-ink-subtle"
      >
        <slot name="icon-right"></slot>
      </div>
    </div>
    <p v-if="error" :id="messageId" class="flex items-start gap-1 text-xs font-medium text-error">
      <Icon icon="mdi:alert-circle-outline" class="mt-px shrink-0 text-sm" aria-hidden="true" />
      {{ error }}
    </p>
    <p v-else-if="helper" :id="messageId" class="text-xs text-ink-subtle">{{ helper }}</p>
  </div>
</template>
