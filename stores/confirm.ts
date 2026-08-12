import { defineStore } from 'pinia'

/**
 * The one pending confirmation request, and the promise waiting on its answer.
 *
 * Modelled on `stores/toast.ts`: a single app-level overlay driven by a store, rendered once by a
 * host component in `app.vue`. The alternative — a `<Modal>` plus an open-flag plus a pending-target
 * ref at each of the dozen delete sites — is the same dialog written twelve times, which is how
 * three different confirmation styles (a bespoke modal, `window.confirm`, and nothing at all)
 * ended up in the codebase to begin with.
 *
 * Callers use `useConfirm()`, which turns this into `if (!(await confirmDelete(name))) return`.
 */
export interface ConfirmRequest {
  title: string
  /** Second line. Say what will be lost, not just "are you sure".  */
  message?: string
  confirmLabel: string
  cancelLabel: string
  /** `danger` for anything destructive, which is every current caller. */
  variant: 'danger' | 'primary'
}

export type ConfirmOptions = Partial<ConfirmRequest> & Pick<ConfirmRequest, 'title'>

const DEFAULTS: Omit<ConfirmRequest, 'title'> = {
  message: undefined,
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'danger',
}

export const useConfirmStore = defineStore('confirm', () => {
  const request = ref<ConfirmRequest | null>(null)

  /**
   * Deliberately outside `ref`: a resolver is a one-shot callback, not state anything renders, and
   * wrapping a function in a ref would have Vue treat it as a getter.
   */
  let resolver: ((confirmed: boolean) => void) | null = null

  /** Resolves when the user answers. `false` for cancel, dismissal, or Escape. */
  function ask(options: ConfirmOptions): Promise<boolean> {
    // A second request while one is open cancels the first rather than abandoning its promise —
    // an unresolved resolver leaves its caller awaiting forever.
    settle(false)
    request.value = { ...DEFAULTS, ...options }
    return new Promise<boolean>((resolve) => {
      resolver = resolve
    })
  }

  function settle(confirmed: boolean) {
    const pending = resolver
    resolver = null
    request.value = null
    pending?.(confirmed)
  }

  return { request, ask, settle }
})
