import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useConfirmStore } from '~/stores/confirm'
import { useConfirm } from '~/composables/useConfirm'

describe('useConfirmStore', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('holds no request until one is asked', () => {
    expect(useConfirmStore().request).toBeNull()
  })

  it('resolves true on confirm and false on cancel, clearing the request either way', async () => {
    const store = useConfirmStore()

    const accepted = store.ask({ title: 'Delete this?' })
    expect(store.request?.title).toBe('Delete this?')
    store.settle(true)
    await expect(accepted).resolves.toBe(true)
    expect(store.request).toBeNull()

    const declined = store.ask({ title: 'Delete this?' })
    store.settle(false)
    await expect(declined).resolves.toBe(false)
    expect(store.request).toBeNull()
  })

  it('fills in labels and variant, so a caller need only supply a title', () => {
    const store = useConfirmStore()
    store.ask({ title: 'Delete this?' })
    expect(store.request).toMatchObject({
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      variant: 'danger',
    })
  })

  it('lets a caller override any of them', () => {
    const store = useConfirmStore()
    store.ask({ title: 'Publish?', confirmLabel: 'Publish', variant: 'primary', message: 'Live.' })
    expect(store.request).toMatchObject({
      title: 'Publish?',
      confirmLabel: 'Publish',
      variant: 'primary',
      message: 'Live.',
    })
  })

  /**
   * A dropped resolver leaves its caller awaiting forever, which in a delete handler means a
   * button that never responds again. A second request declines the first rather than abandoning
   * it.
   */
  it('declines an outstanding request when a second one arrives', async () => {
    const store = useConfirmStore()

    const first = store.ask({ title: 'First?' })
    const second = store.ask({ title: 'Second?' })

    await expect(first).resolves.toBe(false)
    expect(store.request?.title).toBe('Second?')

    store.settle(true)
    await expect(second).resolves.toBe(true)
  })

  it('settling with nothing pending is harmless', () => {
    const store = useConfirmStore()
    expect(() => store.settle(true)).not.toThrow()
    expect(store.request).toBeNull()
  })
})

describe('useConfirm', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('words a delete from the thing being deleted', async () => {
    const store = useConfirmStore()
    const { confirmDelete } = useConfirm()

    const answer = confirmDelete('Grace Etim')

    // The name matters: "Are you sure?" does not tell somebody they clicked the wrong row.
    expect(store.request?.title).toBe('Delete Grace Etim?')
    expect(store.request?.message).toBe('This cannot be undone.')
    expect(store.request?.confirmLabel).toBe('Delete')
    expect(store.request?.variant).toBe('danger')

    store.settle(true)
    await expect(answer).resolves.toBe(true)
  })

  it('lets the caller replace the message with something more specific', () => {
    const store = useConfirmStore()
    useConfirm().confirmDelete('Grace Etim', { message: 'Her visit will be removed.' })
    expect(store.request?.message).toBe('Her visit will be removed.')
    expect(store.request?.title).toBe('Delete Grace Etim?')
  })
})
