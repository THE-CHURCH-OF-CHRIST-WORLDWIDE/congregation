/**
 * Per-row pending state for async actions in a list.
 *
 * A store's shared `saving` flag is wrong for row-level buttons: binding every row to it makes
 * all of them spin when one is clicked. This tracks pending work by key — usually the row id —
 * so only the row being acted on shows a spinner, and re-clicking it while in flight is ignored.
 *
 * ```ts
 * const { isPending, run } = usePendingAction()
 * // template: :loading="isPending(member.id)"  @click="run(member.id, () => remove(member.id))"
 * ```
 */
export function usePendingAction() {
  const keys = ref(new Set<string>())

  const isPending = (key: string) => keys.value.has(key)
  const anyPending = computed(() => keys.value.size > 0)

  async function run(key: string, action: () => Promise<unknown> | unknown) {
    if (keys.value.has(key)) return
    keys.value = new Set(keys.value).add(key)
    try {
      await action()
    } finally {
      const next = new Set(keys.value)
      next.delete(key)
      keys.value = next
    }
  }

  return { isPending, anyPending, run }
}
