<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  helper?: string
  rows?: number
  /** Extra classes for the label, e.g. `sr-only` when a heading already names the field. */
  labelClass?: string
}
withDefaults(defineProps<Props>(), { rows: 3 })
const emit = defineEmits<{ 'update:modelValue': [val: string] }>()

const id = useId()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" :class="['text-sm font-medium text-ink', labelClass]">
      {{ label }}
    </label>
    <textarea
      :id="id"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :aria-describedby="helper ? `${id}-helper` : undefined"
      class="w-full resize-y rounded-sm border border-rule-strong bg-surface px-3 py-2 text-sm leading-relaxed text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    <p v-if="helper" :id="`${id}-helper`" class="text-xs text-ink-muted">{{ helper }}</p>
  </div>
</template>
