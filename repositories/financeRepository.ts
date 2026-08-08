/**
 * Firestore access for church finances.
 *
 * Two collections, kept separate because they are read and reported on separately and have
 * different shapes: `financeCollections` (money in) and `financeExpenses` (money out).
 *
 * Both were previously held in a plain array in the store — not even localStorage — so every
 * figure vanished on refresh while the UI reported "Collection recorded".
 */

import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore'
import type { FinanceCollection, FinanceExpense } from '~/types'

const COLLECTIONS = 'financeCollections'
const EXPENSES = 'financeExpenses'

export function useFinanceRepository() {
  const nuxt = useNuxtApp()

  /** Newest first — every view of this data is "most recent" first. */
  async function fetchCollections(): Promise<FinanceCollection[]> {
    const snap = await getDocs(
      query(collection(nuxt.$firestore, COLLECTIONS), orderBy('date', 'desc'))
    )
    return snap.docs.map((d) => ({ ...(d.data() as Omit<FinanceCollection, 'id'>), id: d.id }))
  }

  async function fetchExpenses(): Promise<FinanceExpense[]> {
    const snap = await getDocs(
      query(collection(nuxt.$firestore, EXPENSES), orderBy('date', 'desc'))
    )
    return snap.docs.map((d) => ({ ...(d.data() as Omit<FinanceExpense, 'id'>), id: d.id }))
  }

  /** Firestore rejects `undefined`, and optional notes are routinely left blank. */
  function clean<T extends Record<string, unknown>>(input: T) {
    return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined))
  }

  async function createCollection(
    entry: Omit<FinanceCollection, 'id'>
  ): Promise<FinanceCollection> {
    const ref = await addDoc(collection(nuxt.$firestore, COLLECTIONS), clean(entry))
    return { ...entry, id: ref.id }
  }

  async function createExpense(entry: Omit<FinanceExpense, 'id'>): Promise<FinanceExpense> {
    const ref = await addDoc(collection(nuxt.$firestore, EXPENSES), clean(entry))
    return { ...entry, id: ref.id }
  }

  async function deleteCollection(id: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, COLLECTIONS, id))
  }

  async function deleteExpense(id: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, EXPENSES, id))
  }

  return {
    fetchCollections,
    fetchExpenses,
    createCollection,
    createExpense,
    deleteCollection,
    deleteExpense,
  }
}
