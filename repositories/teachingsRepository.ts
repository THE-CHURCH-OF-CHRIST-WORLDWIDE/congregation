/**
 * Firestore access for teachings — sermons and Sunday School lessons.
 *
 * Previously the store kept these in a plain array with a fake progress bar ticking to 100%,
 * so an "upload" was a one-second animation followed by data that disappeared on refresh.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import type { Sermon } from '~/types'

const COLLECTION = 'teachings'

function clean<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined))
}

export function useTeachingsRepository() {
  const nuxt = useNuxtApp()

  async function fetchSermons(): Promise<Sermon[]> {
    const snap = await getDocs(
      query(collection(nuxt.$firestore, COLLECTION), orderBy('createdAt', 'desc'))
    )
    return snap.docs.map((d) => ({ ...(d.data() as Omit<Sermon, 'id'>), id: d.id }))
  }

  async function createSermon(sermon: Omit<Sermon, 'id'>): Promise<Sermon> {
    const ref = await addDoc(collection(nuxt.$firestore, COLLECTION), clean(sermon))
    return { ...sermon, id: ref.id }
  }

  async function updateSermon(id: string, updates: Partial<Sermon>): Promise<void> {
    await setDoc(doc(nuxt.$firestore, COLLECTION, id), clean(updates), { merge: true })
  }

  async function deleteSermon(id: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, COLLECTION, id))
  }

  return { fetchSermons, createSermon, updateSermon, deleteSermon }
}
