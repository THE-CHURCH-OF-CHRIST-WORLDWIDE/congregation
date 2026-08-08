import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFinanceStore } from '~/stores/finance'
import type { FinanceCollection, FinanceExpense } from '~/types'

/**
 * Finance used to live in a plain array — not even localStorage — so every figure vanished on
 * refresh while the UI said "Collection recorded". These pin down the thing that matters now:
 * what is on screen matches what Firestore accepted, and a refused write leaves no trace.
 */
let storedCollections: FinanceCollection[] = []
let storedExpenses: FinanceExpense[] = []
let failNextWrite = false

const createCollection = vi.fn(async (entry: Omit<FinanceCollection, 'id'>) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  const created = { ...entry, id: `c-${storedCollections.length + 1}` }
  storedCollections.push(created)
  return created
})

const createExpense = vi.fn(async (entry: Omit<FinanceExpense, 'id'>) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  const created = { ...entry, id: `e-${storedExpenses.length + 1}` }
  storedExpenses.push(created)
  return created
})

const deleteCollection = vi.fn(async (id: string) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  storedCollections = storedCollections.filter((c) => c.id !== id)
})

const deleteExpense = vi.fn(async (id: string) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  storedExpenses = storedExpenses.filter((e) => e.id !== id)
})

vi.mock('~/repositories/financeRepository', () => ({
  useFinanceRepository: () => ({
    fetchCollections: async () => storedCollections,
    fetchExpenses: async () => storedExpenses,
    createCollection,
    createExpense,
    deleteCollection,
    deleteExpense,
  }),
}))

vi.mock('~/utils/audit', () => ({ recordAudit: vi.fn() }))

const collection = (amount: number, date = '2026-08-02') => ({ date, amount, description: 'Tithe' })
const expense = (amount: number, date = '2026-08-02') =>
  ({ date, amount, category: 'Building', description: 'Roof' }) as Omit<FinanceExpense, 'id'>

describe('useFinanceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    storedCollections = []
    storedExpenses = []
    failNextWrite = false
    createCollection.mockClear()
    createExpense.mockClear()
    deleteCollection.mockClear()
    deleteExpense.mockClear()
  })

  it('loads both books from the repository', async () => {
    storedCollections = [{ id: 'c-1', date: '2026-08-02', amount: 5000 }]
    storedExpenses = [
      { id: 'e-1', date: '2026-08-02', amount: 1200, category: 'Building', description: 'Roof' },
    ]

    const store = useFinanceStore()
    await store.load()

    expect(store.collections).toHaveLength(1)
    expect(store.expenses).toHaveLength(1)
    expect(store.loaded).toBe(true)
  })

  it('keeps the id Firestore generated rather than inventing one', async () => {
    const store = useFinanceStore()
    await store.addCollection(collection(5000))

    // The old code used String(Date.now()), which collides for two entries in the same tick.
    expect(store.collections[0]!.id).toBe('c-1')
  })

  it('does not show a collection that was refused', async () => {
    const store = useFinanceStore()
    failNextWrite = true

    await expect(store.addCollection(collection(5000))).rejects.toThrow()

    // A figure on screen that is not in the books is the worst outcome here.
    expect(store.collections).toHaveLength(0)
    expect(store.saving).toBe(false)
  })

  it('does not show an expense that was refused', async () => {
    const store = useFinanceStore()
    failNextWrite = true

    await expect(store.addExpense(expense(1200))).rejects.toThrow()

    expect(store.expenses).toHaveLength(0)
  })

  it('removes a deleted entry, and keeps it when the delete is refused', async () => {
    const store = useFinanceStore()
    await store.addCollection(collection(5000))
    expect(store.collections).toHaveLength(1)

    failNextWrite = true
    await expect(store.deleteCollection('c-1')).rejects.toThrow()
    expect(store.collections).toHaveLength(1)

    failNextWrite = false
    await store.deleteCollection('c-1')
    expect(store.collections).toHaveLength(0)
  })

  it('ignores a delete for an entry it does not hold', async () => {
    const store = useFinanceStore()
    await store.deleteCollection('nope')

    expect(deleteCollection).not.toHaveBeenCalled()
  })

  it('feeds the totals from stored records', async () => {
    const store = useFinanceStore()
    await store.addCollection(collection(5000))
    await store.addCollection(collection(2500))
    await store.addExpense(expense(1200))

    expect(store.totalIncome).toBe(7500)
    expect(store.totalExpenses).toBe(1200)
    expect(store.netBalance).toBe(6300)
  })
})
