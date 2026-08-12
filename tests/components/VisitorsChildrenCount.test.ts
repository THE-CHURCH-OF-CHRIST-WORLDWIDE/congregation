import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VisitorsAndChildren from '~/components/attendance/VisitorsAndChildren.vue'
import { useVisitorsStore } from '~/stores/visitors'
import { useConfirmStore } from '~/stores/confirm'
import type { ChildrenCount } from '~/types'

vi.mock('~/utils/audit', () => ({ recordAudit: vi.fn() }))

const saveChildrenCount = vi.fn(
  async (c: Omit<ChildrenCount, 'id'>): Promise<ChildrenCount> => ({
    ...c,
    id: `sunday-worship__${c.date}`,
  })
)
const deleteChildrenCount = vi.fn(async () => {})

vi.mock('~/repositories/visitorsRepository', () => ({
  useVisitorsRepository: () => ({
    fetchVisitors: async () => [],
    fetchChildrenCounts: async () => [],
    createVisitor: vi.fn(),
    updateVisitor: vi.fn(),
    deleteVisitor: vi.fn(),
    saveChildrenCount,
    deleteChildrenCount,
  }),
  childrenDocId: (r: { serviceType: string; date: string }) =>
    `${r.serviceType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}__${r.date}`,
}))

const stubs = {
  Card: { template: '<div><slot /></div>' },
  Icon: true,
  Avatar: true,
  Badge: { template: '<span><slot /></span>' },
  EmptyState: { template: '<div />' },
  LoadingState: { template: '<div />' },
  VisitorFormModal: { template: '<div />' },
  VisitorDetailPanel: { template: '<div />' },
  EditField: { props: ['label'], template: '<label><slot /></label>' },
  // Real Button, so the assertions see its actual disabled state.
}

function render() {
  return mount(VisitorsAndChildren, { global: { stubs } })
}

const countInput = (w: ReturnType<typeof render>) => w.find('input[type="number"]')
const saveButton = (w: ReturnType<typeof render>) =>
  w.findAll('button').find((b) => b.text().includes('Save'))!
const clearButton = (w: ReturnType<typeof render>) =>
  w.findAll('button').find((b) => b.text().includes('Clear'))

describe("children's figure", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  /**
   * The regression this exists for. `v-model` on `<input type="number">` casts through
   * `parseFloat`, so the bound ref holds a *number*, not a string. Treating it as a string threw
   * inside the computed that enables Save, which killed the update — a typed figure could not be
   * saved at all, and nothing in the suite noticed.
   */
  it('enables Save as soon as a number is typed, and records it', async () => {
    const w = render()
    await flushPromises()

    expect(saveButton(w).attributes('disabled')).toBeDefined()

    await countInput(w).setValue('24')
    await flushPromises()

    expect(saveButton(w).attributes('disabled')).toBeUndefined()

    await saveButton(w).trigger('click')
    await flushPromises()

    expect(saveChildrenCount).toHaveBeenCalledOnce()
    expect(saveChildrenCount.mock.calls[0]![0]).toMatchObject({ count: 24 })
  })

  it('stays disabled while the box matches what is stored', async () => {
    const w = render()
    await flushPromises()

    await countInput(w).setValue('24')
    await saveButton(w).trigger('click')
    await flushPromises()

    // Saved, so there is nothing pending.
    expect(saveButton(w).attributes('disabled')).toBeDefined()

    await countInput(w).setValue('26')
    await flushPromises()
    expect(saveButton(w).attributes('disabled')).toBeUndefined()
  })

  it('records zero as a real figure rather than treating it as empty', async () => {
    const w = render()
    await flushPromises()

    await countInput(w).setValue('0')
    await flushPromises()

    expect(saveButton(w).attributes('disabled')).toBeUndefined()
    await saveButton(w).trigger('click')
    await flushPromises()

    expect(saveChildrenCount.mock.calls[0]![0]).toMatchObject({ count: 0 })
  })

  it('refuses a figure above the limit the rules would reject', async () => {
    const w = render()
    await flushPromises()

    await countInput(w).setValue('99999')
    await flushPromises()

    expect(w.find('[role="alert"]').text()).toContain('limit')
    expect(saveButton(w).attributes('disabled')).toBeDefined()
  })

  it('offers Clear only once a figure exists, and removes it', async () => {
    const w = render()
    await flushPromises()

    expect(clearButton(w)).toBeUndefined()

    await countInput(w).setValue('24')
    await saveButton(w).trigger('click')
    await flushPromises()

    expect(w.text()).toContain('Recorded for this service')

    const shownDate = (w.find('select').element as HTMLSelectElement).value
    await clearButton(w)!.trigger('click')
    await flushPromises()

    // Removing a figure is confirmed like any other delete.
    const confirmStore = useConfirmStore()
    expect(confirmStore.request).not.toBeNull()
    expect(deleteChildrenCount).not.toHaveBeenCalled()

    confirmStore.settle(true)
    await flushPromises()

    expect(deleteChildrenCount).toHaveBeenCalledWith(`sunday-worship__${shownDate}`)
    expect(w.text()).toContain('Not counted yet')
  })

  it('follows the selected service date', async () => {
    const store = useVisitorsStore()
    const w = render()
    await flushPromises()

    const dates = w.findAll('select option').map((o) => o.attributes('value')!)
    store.childrenCounts = [
      {
        id: `sunday-worship__${dates[1]}`,
        date: dates[1]!,
        serviceType: 'Sunday Worship',
        count: 31,
      },
    ]

    // Nothing on the latest Sunday yet.
    expect(w.text()).toContain('Not counted yet')

    await w.find('select').setValue(dates[1])
    await flushPromises()

    expect(w.text()).toContain('recorded for this service')
    expect((countInput(w).element as HTMLInputElement).value).toBe('31')
  })
})
