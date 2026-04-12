<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
const props = withDefaults(defineProps<Props>(), { size: 'md' })
const emit = defineEmits<{ 'update:modelValue': [val: boolean] }>()

function close() { emit('update:modelValue', false) }

const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }

onMounted(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
  document.addEventListener('keydown', handler)
  onUnmounted(() => document.removeEventListener('keydown', handler))
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div
          :class="['relative bg-white rounded-2xl shadow-xl w-full flex flex-col max-h-[90vh]', sizeClasses[size]]"
          @click.stop
        >
          <div v-if="title" class="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h2 class="text-base font-semibold text-gray-900">{{ title }}</h2>
            <button
              class="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
              @click="close"
            >
              <Icon icon="mdi:close" class="text-lg" />
            </button>
          </div>
          <div class="p-5 overflow-y-auto flex-1 sidebar-scroll">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-5 pb-5 shrink-0 border-t border-gray-100 pt-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
