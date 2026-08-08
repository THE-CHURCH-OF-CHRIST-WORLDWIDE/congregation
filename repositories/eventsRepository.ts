/**
 * Firestore access for church events.
 *
 * One `events` collection holding both kinds, discriminated by a `kind` field, because the two
 * lists are always loaded together and a single collection keeps that one read instead of two.
 * The stored shape is otherwise the app's own `UpcomingEvent` / `PastEvent`.
 *
 * Publicly readable — the /events page lists these to visitors who are not signed in.
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
import type { PastEvent, UpcomingEvent } from '~/types/events'

const COLLECTION = 'events'

export type EventKind = 'upcoming' | 'past'

function clean<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined))
}

export function useEventsRepository() {
  const nuxt = useNuxtApp()

  async function fetchEvents(): Promise<{ upcoming: UpcomingEvent[]; past: PastEvent[] }> {
    const snap = await getDocs(query(collection(nuxt.$firestore, COLLECTION), orderBy('date')))
    const upcoming: UpcomingEvent[] = []
    const past: PastEvent[] = []
    for (const d of snap.docs) {
      const { kind, ...data } = d.data() as { kind: EventKind } & Record<string, unknown>
      if (kind === 'past') past.push({ ...(data as Omit<PastEvent, 'id'>), id: d.id })
      else upcoming.push({ ...(data as Omit<UpcomingEvent, 'id'>), id: d.id })
    }
    return { upcoming, past }
  }

  async function createEvent<T extends { id: string }>(
    kind: EventKind,
    event: Omit<T, 'id'>
  ): Promise<T> {
    const ref = await addDoc(collection(nuxt.$firestore, COLLECTION), clean({ ...event, kind }))
    return { ...event, id: ref.id } as T
  }

  async function updateEvent(id: string, updates: Record<string, unknown>): Promise<void> {
    await setDoc(doc(nuxt.$firestore, COLLECTION, id), clean(updates), { merge: true })
  }

  async function deleteEvent(id: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, COLLECTION, id))
  }

  return { fetchEvents, createEvent, updateEvent, deleteEvent }
}
