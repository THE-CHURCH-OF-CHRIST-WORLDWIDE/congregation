<script setup lang="ts">
/**
 * A list of people as removable chips: type a name and press Enter (or comma) to add it.
 * Suggestions come from the `<datalist>` named by `list` — the nominal roll on the minutes page —
 * but any name may be typed, since visitors and guests are not on the roll.
 */
const props = defineProps<{
  modelValue: string[]
  label: string
  helper?: string
  list?: string
  placeholder?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [names: string[]] }>()

const id = useId()
const text = ref('')

function add() {
  const names = text.value
    .split(/[,\n]/)
    .map((n) => n.trim())
    .filter(Boolean)
  if (!names.length) return
  const existing = new Set(props.modelValue.map((n) => n.toLowerCase()))
  const fresh = names.filter((n) => !existing.has(n.toLowerCase()))
  if (fresh.length) emit('update:modelValue', [...props.modelValue, ...fresh])
  text.value = ''
}

function remove(i: number) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, j) => j !== i)
  )
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    add()
  } else if (e.key === 'Backspace' && !text.value && props.modelValue.length) {
    remove(props.modelValue.length - 1)
  }
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-baseline justify-between gap-2">
      <label :for="id" class="text-sm font-medium text-ink">{{ label }}</label>
      <span class="num text-xs text-ink-subtle">{{ modelValue.length }}</span>
    </div>
    <div
      class="flex min-h-11 flex-wrap items-center gap-1.5 rounded-sm border border-rule-strong bg-surface px-2 py-1.5 transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15 hover:border-ink-subtle"
    >
      <span
        v-for="(name, i) in modelValue"
        :key="`${name}-${i}`"
        class="inline-flex items-center gap-1 rounded-sm bg-surface-sunken py-0.5 pr-0.5 pl-2 text-[13px] text-ink"
      >
        {{ name }}
        <button
          type="button"
          class="inline-flex size-6 items-center justify-center rounded-sm text-ink-subtle hover:bg-error-soft hover:text-error"
          :aria-label="`Remove ${name}`"
          @click="remove(i)"
        >
          <Icon icon="mdi:close" class="text-xs" />
        </button>
      </span>
      <input
        :id="id"
        v-model="text"
        :list="list"
        :placeholder="modelValue.length ? '' : (placeholder ?? 'Type a name and press Enter')"
        :aria-describedby="helper ? `${id}-helper` : undefined"
        class="min-w-[10rem] flex-1 bg-transparent px-1 py-1 text-sm text-ink outline-none placeholder:text-ink-subtle"
        @keydown="onKeydown"
        @change="add"
        @blur="add"
      />
    </div>
    <p v-if="helper" :id="`${id}-helper`" class="text-xs text-ink-muted">{{ helper }}</p>
  </div>
</template>
