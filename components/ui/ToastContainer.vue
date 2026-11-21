<script setup lang="ts">
import type { ToastVariant } from '~/stores/toast'

const store = useToastStore()

const variantStyles: Record<ToastVariant, { wrapper: string; icon: string; iconName: string }> = {
  success: {
    wrapper: 'border-success/35 bg-success-soft',
    icon: 'text-success',
    iconName: 'mdi:check-circle-outline',
  },
  error: {
    wrapper: 'border-error/35 bg-error-soft',
    icon: 'text-error',
    iconName: 'mdi:alert-circle-outline',
  },
  info: {
    wrapper: 'border-info/35 bg-info-soft',
    icon: 'text-info',
    iconName: 'mdi:information-outline',
  },
  warning: {
    wrapper: 'border-warning/35 bg-warning-soft',
    icon: 'text-warning',
    iconName: 'mdi:alert-outline',
  },
}
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-3 top-3 z-[200] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-sm"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      <TransitionGroup name="toast">
        <div
          v-for="t in store.toasts"
          :key="t.id"
          :class="[
            'pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-sm border py-3 pl-4 pr-2 text-sm text-ink shadow-md',
            variantStyles[t.variant].wrapper,
          ]"
          role="alert"
        >
          <Icon
            :icon="variantStyles[t.variant].iconName"
            :class="['mt-0.5 shrink-0 text-base', variantStyles[t.variant].icon]"
          />
          <p class="flex-1 pt-px leading-snug">{{ t.message }}</p>
          <button
            class="-my-1 inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
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
    opacity var(--duration-base) ease,
    transform var(--duration-slow) var(--ease-out-expo);
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
