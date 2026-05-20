import { useToastStore, type ToastVariant } from '~/stores/toast'

interface ToastOptions {
  duration?: number
}

export function useToast() {
  const store = useToastStore()

  function show(message: string, variant: ToastVariant = 'info', opts: ToastOptions = {}) {
    return store.show(message, variant, opts.duration)
  }

  return {
    success: (message: string, opts?: ToastOptions) => show(message, 'success', opts),
    error: (message: string, opts?: ToastOptions) => show(message, 'error', opts),
    info: (message: string, opts?: ToastOptions) => show(message, 'info', opts),
    warning: (message: string, opts?: ToastOptions) => show(message, 'warning', opts),
    dismiss: store.dismiss,
    clear: store.clear,
  }
}
