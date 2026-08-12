import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VisitorDetailPanel from '~/components/attendance/VisitorDetailPanel.vue'
import { useVisitorsStore } from '~/stores/visitors'
import { useConfirmStore } from '~/stores/confirm'
import type { Visitor } from '~/types'

vi.mock('~/utils/audit', () => ({ recordAudit: vi.fn() }))

const deleteVisitor = vi.fn(async () => {})
vi.mock('~/repositories/visitorsRepository', () => ({
  useVisitorsRepository: () => ({
    fetchVisitors: async () => [],
    fetchChildrenCounts: async () => [],
    createVisitor: vi.fn(),
    updateVisitor: vi.fn(),
    deleteVisitor,
    saveChildrenCount: vi.fn(),
    deleteChildrenCount: vi.fn(),
  }),
  childrenDocId: (r: { serviceType: string; date: string }) => `${r.serviceType}__${r.date}`,
}))

const stubs = {
  Icon: true,
  Avatar: true,
  Badge: { template: '<span><slot /></span>' },
  InfoField: {
    props: ['label', 'value'],
    template:
      '<div class="info"><span class="label">{{ label }}</span><span class="value">{{ value }}</span></div>',
  },
  // Rendered in place so the panel's contents are queryable without a real body teleport.
  Teleport: { template: '<div><slot /></div>' },
}

function visitor(overrides: Partial<Visitor> = {}): Visitor {
  return {
    id: 'v1',
    name: 'Grace Etim',
    date: '2026-08-09',
    serviceType: 'Sunday Worship',
    ...overrides,
  }
}

function render(v: Visitor | null, open = true) {
  return mount(VisitorDetailPanel, {
    props: { visitor: v, modelValue: open },
    global: { stubs },
  })
}

/** Value text of the InfoField carrying a given label. */
function fieldValue(w: ReturnType<typeof render>, label: string) {
  const field = w.findAll('.info').find((f) => f.find('.label').text() === label)
  return field?.find('.value').text()
}

describe('VisitorDetailPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('shows the full biodata', () => {
    const w = render(
      visitor({
        phone: '+2348030000000',
        email: 'grace@example.com',
        church: 'Church of Christ, Uyo',
        address: 'No. 8 Convent Road',
      })
    )

    expect(w.text()).toContain('Grace Etim')
    expect(fieldValue(w, 'Phone Number')).toBe('+2348030000000')
    expect(fieldValue(w, 'Email Address')).toBe('grace@example.com')
    expect(fieldValue(w, 'Church')).toBe('Church of Christ, Uyo')
    expect(fieldValue(w, 'Address')).toBe('No. 8 Convent Road')
  })

  /** Most visitors give a name and little else; blanks must read as unanswered, not as errors. */
  it('says "Not given" for details the visitor withheld', () => {
    const w = render(visitor())
    expect(fieldValue(w, 'Phone Number')).toBe('Not given')
    expect(fieldValue(w, 'Church')).toBe('Not given')
  })

  it('renders nothing when closed or with no visitor', () => {
    expect(render(visitor(), false).find('aside').exists()).toBe(false)
    expect(render(null).find('aside').exists()).toBe(false)
  })

  describe('reach-out links', () => {
    it('offers Call and Email only for details that were given', () => {
      const both = render(visitor({ phone: '+234', email: 'g@example.com' }))
      expect(both.find('a[href^="tel:"]').exists()).toBe(true)
      expect(both.find('a[href^="mailto:"]').exists()).toBe(true)

      // A dead mailto: opening an empty mail client is worse than no button.
      const phoneOnly = render(visitor({ phone: '+234' }))
      expect(phoneOnly.find('a[href^="tel:"]').exists()).toBe(true)
      expect(phoneOnly.find('a[href^="mailto:"]').exists()).toBe(false)

      const neither = render(visitor())
      expect(neither.find('a[href^="tel:"]').exists()).toBe(false)
      expect(neither.find('a[href^="mailto:"]').exists()).toBe(false)
    })
  })

  describe('other visits', () => {
    it('lists other services recorded under the same name, most recent first', () => {
      useVisitorsStore().visitors = [
        visitor({ id: 'v1', date: '2026-08-09' }),
        visitor({ id: 'v2', date: '2026-07-05' }),
        visitor({ id: 'v3', date: '2026-07-26' }),
        visitor({ id: 'other', name: 'Someone Else', date: '2026-08-02' }),
      ]

      const w = render(visitor({ id: 'v1' }))
      const dates = w.findAll('li').map((li) => li.text())

      expect(dates).toHaveLength(2)
      expect(dates[0]).toContain('26 July 2026')
      expect(dates[1]).toContain('5 July 2026')
      // The visit being shown is not listed as an "other" visit.
      expect(w.text()).not.toContain('9 August 2026 ')
    })

    it('says so when there are none', () => {
      useVisitorsStore().visitors = [visitor({ id: 'v1' })]
      expect(render(visitor({ id: 'v1' })).text()).toContain('No other services recorded')
    })
  })

  it('emits edit rather than editing in place — the form owns validation', async () => {
    const w = render(visitor())
    await w
      .findAll('button')
      .find((b) => b.text().includes('Edit Details'))!
      .trigger('click')
    expect(w.emitted('edit')?.[0]).toEqual([visitor()])
  })

  describe('delete', () => {
    /** The dialog lives in `app.vue`, so a component test answers it through the store. */
    async function clickDelete(w: ReturnType<typeof render>) {
      await w
        .findAll('button')
        .find((b) => b.text().includes('Delete'))!
        .trigger('click')
      await flushPromises()
    }

    it('asks first, then deletes and closes once confirmed', async () => {
      const confirmStore = useConfirmStore()
      useVisitorsStore().visitors = [visitor()]
      const w = render(visitor())

      await clickDelete(w)

      // Nothing has happened yet — the request is waiting on an answer.
      expect(confirmStore.request?.title).toContain('Grace Etim')
      expect(deleteVisitor).not.toHaveBeenCalled()

      confirmStore.settle(true)
      await flushPromises()

      expect(deleteVisitor).toHaveBeenCalledWith('v1')
      expect(w.emitted('delete')).toBeTruthy()
      expect(w.emitted('update:modelValue')?.at(-1)).toEqual([false])
    })

    it('does nothing at all when declined', async () => {
      const confirmStore = useConfirmStore()
      useVisitorsStore().visitors = [visitor()]
      const w = render(visitor())

      await clickDelete(w)
      confirmStore.settle(false)
      await flushPromises()

      expect(deleteVisitor).not.toHaveBeenCalled()
      expect(w.emitted('delete')).toBeUndefined()
      // The panel stays open, so the record is still in front of whoever declined.
      expect(w.emitted('update:modelValue')).toBeUndefined()
    })
  })
})
