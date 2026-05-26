import { defineStore } from 'pinia'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  /** Auto-dismiss delay in ms. Set to 0 to keep until manually dismissed. */
  duration: number
}

const DEFAULT_DURATION = 3000

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function show(message: string, variant: ToastVariant = 'info', duration = DEFAULT_DURATION) {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    toasts.value.push({ id, message, variant, duration })
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function clear() {
    toasts.value = []
  }

  return { toasts, show, dismiss, clear }
})
