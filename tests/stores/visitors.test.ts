import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useVisitorsStore } from '~/stores/visitors'
import type { ChildrenCount, Visitor } from '~/types'

vi.mock('~/utils/audit', () => ({ recordAudit: vi.fn() }))

const repo = {
  fetchVisitors: vi.fn(async (): Promise<Visitor[]> => []),
  fetchChildrenCounts: vi.fn(async (): Promise<ChildrenCount[]> => []),
  createVisitor: vi.fn(async (v: Omit<Visitor, 'id'>): Promise<Visitor> => ({ ...v, id: 'v-new' })),
  updateVisitor: vi.fn(async () => {}),
  deleteVisitor: vi.fn(async () => {}),
  saveChildrenCount: vi.fn(
    async (c: Omit<ChildrenCount, 'id'>): Promise<ChildrenCount> => ({
      ...c,
      id: `sunday-worship__${c.date}`,
    })
  ),
  deleteChildrenCount: vi.fn(async () => {}),
}

vi.mock('~/repositories/visitorsRepository', () => ({
  useVisitorsRepository: () => repo,
  childrenDocId: (r: { serviceType: string; date: string }) =>
    `${r.serviceType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}__${r.date}`,
}))

const SERVICE = 'Sunday Worship'

function makeVisitor(overrides: Partial<Visitor> = {}): Visitor {
  return {
    id: 'v1',
    name: 'Grace Etim',
    date: '2026-08-09',
    serviceType: SERVICE,
    ...overrides,
  }
}

describe('useVisitorsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads both sets once per session', async () => {
    repo.fetchVisitors.mockResolvedValueOnce([makeVisitor()])
    repo.fetchChildrenCounts.mockResolvedValueOnce([
      { id: 'sunday-worship__2026-08-09', date: '2026-08-09', serviceType: SERVICE, count: 24 },
    ])
    const store = useVisitorsStore()

    await store.load()
    expect(store.visitors).toHaveLength(1)
    expect(store.childrenCounts).toHaveLength(1)

    await store.load()
    expect(repo.fetchVisitors).toHaveBeenCalledOnce()
  })

  it('filters visitors by service and date', () => {
    const store = useVisitorsStore()
    store.visitors = [
      makeVisitor({ id: 'a', date: '2026-08-09' }),
      makeVisitor({ id: 'b', date: '2026-08-02' }),
      makeVisitor({ id: 'c', date: '2026-08-09', serviceType: 'Bible Class' }),
    ]
    expect(store.visitorsOn('2026-08-09', SERVICE).map((v) => v.id)).toEqual(['a'])
  })

  it('records a visitor and puts them at the top of the list', async () => {
    const store = useVisitorsStore()
    store.visitors = [makeVisitor({ id: 'existing' })]

    await store.addVisitor({ name: 'New Guest', date: '2026-08-09', serviceType: SERVICE })

    expect(store.visitors.map((v) => v.id)).toEqual(['v-new', 'existing'])
    expect(repo.createVisitor).toHaveBeenCalledOnce()
  })

  it('updates and deletes a visitor', async () => {
    const store = useVisitorsStore()
    store.visitors = [makeVisitor({ id: 'v1' })]

    await store.updateVisitor('v1', { church: 'Church of Christ, Uyo' })
    expect(store.visitors[0]!.church).toBe('Church of Christ, Uyo')

    await store.deleteVisitor('v1')
    expect(store.visitors).toEqual([])
    expect(repo.deleteVisitor).toHaveBeenCalledWith('v1')
  })

  it('leaves local state alone when a write fails', async () => {
    repo.createVisitor.mockRejectedValueOnce(new Error('offline'))
    const store = useVisitorsStore()

    await expect(
      store.addVisitor({ name: 'Nobody', date: '2026-08-09', serviceType: SERVICE })
    ).rejects.toThrow('offline')
    expect(store.visitors).toEqual([])
    expect(store.error).toBe('offline')
  })

  describe("children's figures", () => {
    /**
     * The distinction the whole shape of this rests on: an unrecorded service is not a service
     * with no children. Reporting 0 for both would make a missed count look like an empty class.
     */
    it('reports null when nobody counted, and the figure when they did', async () => {
      const store = useVisitorsStore()
      expect(store.childrenOn('2026-08-09', SERVICE)).toBe(null)

      await store.setChildrenCount('2026-08-09', SERVICE, 0)
      expect(store.childrenOn('2026-08-09', SERVICE)).toBe(0)
    })

    it('corrects an existing figure rather than adding a second one', async () => {
      const store = useVisitorsStore()

      await store.setChildrenCount('2026-08-09', SERVICE, 24)
      await store.setChildrenCount('2026-08-09', SERVICE, 26)

      expect(store.childrenCounts).toHaveLength(1)
      expect(store.childrenOn('2026-08-09', SERVICE)).toBe(26)
    })

    it('clearing the figure removes the record instead of storing zero', async () => {
      const store = useVisitorsStore()
      await store.setChildrenCount('2026-08-09', SERVICE, 24)

      await store.setChildrenCount('2026-08-09', SERVICE, null)

      expect(store.childrenCounts).toEqual([])
      expect(store.childrenOn('2026-08-09', SERVICE)).toBe(null)
      expect(repo.deleteChildrenCount).toHaveBeenCalledWith('sunday-worship__2026-08-09')
      expect(repo.saveChildrenCount).toHaveBeenCalledOnce() // only the first save
    })
  })

  it('lists every date with something recorded, most recent first', async () => {
    const store = useVisitorsStore()
    store.visitors = [makeVisitor({ id: 'a', date: '2026-08-02' })]
    await store.setChildrenCount('2026-08-09', SERVICE, 12)

    expect(store.recordedDates).toEqual(['2026-08-09', '2026-08-02'])
  })
})
