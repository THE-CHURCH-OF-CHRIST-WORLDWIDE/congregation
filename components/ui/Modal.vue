<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
withDefaults(defineProps<Props>(), { size: 'md' })
const emit = defineEmits<{ 'update:modelValue': [val: boolean] }>()

function close() {
  emit('update:modelValue', false)
}

const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-3xl' }

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }
  document.addEventListener('keydown', handler)
  onUnmounted(() => document.removeEventListener('keydown', handler))
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-root fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="title || undefined"
      >
        <div class="modal-scrim absolute inset-0 bg-overlay" @click="close"></div>
        <div
          :class="[
            'modal-panel relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-xl border border-rule bg-surface text-ink shadow-xl sm:max-h-[88vh] sm:rounded-xl',
            sizeClasses[size],
          ]"
          @click.stop
        >
          <div
            v-if="title"
            class="flex shrink-0 items-center justify-between gap-4 border-b border-rule px-5 py-3.5"
          >
            <h2 class="font-display text-lg font-semibold leading-snug text-ink">{{ title }}</h2>
            <button
              class="-mr-2 inline-flex size-10 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
              aria-label="Close modal"
              @click="close"
            >
              <Icon icon="mdi:close" class="text-xl" />
            </button>
          </div>
          <div class="sidebar-scroll flex-1 overflow-y-auto p-5">
            <slot></slot>
          </div>
          <div
            v-if="$slots.footer"
            class="shrink-0 border-t border-rule bg-surface-muted px-5 py-3.5"
          >
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-base) ease;
}
.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform var(--duration-slow) var(--ease-out-expo);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: translateY(16px);
}
</style>
