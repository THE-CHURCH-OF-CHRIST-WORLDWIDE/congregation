import { useConfirmStore, type ConfirmOptions } from '~/stores/confirm'

/**
 * Ask the user before doing something irreversible.
 *
 * ```ts
 * if (!(await confirmDelete(member.name))) return
 * await membersStore.deleteMember(member.id)
 * ```
 *
 * Rendered by `<ConfirmDialog>` in `app.vue`, so a caller needs no markup or state of its own.
 */
export function useConfirm() {
  const store = useConfirmStore()

  /**
   * Delete confirmation, worded from the thing being deleted.
   *
   * `subject` should name it — "Grace Etim", "this Sunday's figure" — because "Are you sure?" on
   * its own does not tell somebody who clicked the wrong row that they clicked the wrong row.
   */
  function confirmDelete(subject: string, options: Partial<ConfirmOptions> = {}) {
    return store.ask({
      title: `Delete ${subject}?`,
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
      ...options,
    })
  }

  return {
    confirm: (options: ConfirmOptions) => store.ask(options),
    confirmDelete,
  }
}
