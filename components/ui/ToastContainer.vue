<script setup lang="ts">
import type { ToastVariant } from '~/stores/toast'

const store = useToastStore()

const variantStyles: Record<ToastVariant, { wrapper: string; icon: string; iconName: string }> = {
  success: {
    wrapper: 'border-green-200 bg-green-50 text-green-800',
    icon: 'text-green-500',
    iconName: 'mdi:check-circle-outline',
  },
  error: {
    wrapper: 'border-red-200 bg-red-50 text-red-800',
    icon: 'text-red-500',
    iconName: 'mdi:alert-circle-outline',
  },
  info: {
    wrapper: 'border-blue-200 bg-blue-50 text-blue-800',
    icon: 'text-blue-500',
    iconName: 'mdi:information-outline',
  },
  warning: {
    wrapper: 'border-amber-200 bg-amber-50 text-amber-800',
    icon: 'text-amber-500',
    iconName: 'mdi:alert-outline',
  },
}
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed top-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      <TransitionGroup name="toast">
        <div
          v-for="t in store.toasts"
          :key="t.id"
          :class="[
            'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-md',
            variantStyles[t.variant].wrapper,
          ]"
          role="alert"
        >
          <Icon
            :icon="variantStyles[t.variant].iconName"
            :class="['mt-0.5 shrink-0 text-base', variantStyles[t.variant].icon]"
          />
          <p class="flex-1 leading-snug">{{ t.message }}</p>
          <button
            class="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
            :aria-label="`Dismiss ${t.variant} notification`"
            @click="store.dismiss(t.id)"
          >
            <Icon icon="mdi:close" class="text-sm" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.toast-move {
  transition: transform 0.25s ease;
}
</style>
