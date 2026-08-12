/**
 * Firestore access for the people at a service who are not on the nominal roll.
 *
 * Two collections, held in one repository because they answer the same question about a service
 * from two directions — who else was here, and how many children:
 *
 *   `visitors`          — one document per visit, carrying the visitor's biodata.
 *   `childrenAttendance` — one document per service, carrying a count.
 *
 * They are shaped differently on purpose. Visitors are people, worth listing, searching and
 * exporting; the children's class is not on the roll, so there is nobody to tick and nothing to
 * record but a number.
 *
 * Children documents use a deterministic id — `{service}__{date}` — the same convention as
 * `attendanceRepository`. Recording the same Sunday twice then corrects the figure rather than
 * leaving two contradictory counts for one morning, which random ids would allow.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import type { ChildrenCount, Visitor } from '~/types'
import { toIsoString } from '~/utils/firestoreDates'

const VISITORS = 'visitors'
const CHILDREN = 'childrenAttendance'

/** Stable key for one service on one date. */
export function childrenDocId(record: Pick<ChildrenCount, 'serviceType' | 'date'>) {
  const service = record.serviceType.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `${service}__${record.date}`
}

/** Firestore rejects `undefined`, and most of a visitor's biodata is optional. */
function clean<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined))
}

export function useVisitorsRepository() {
  const nuxt = useNuxtApp()

  /** Most recent service first — every view of this data starts from the latest Sunday. */
  async function fetchVisitors(): Promise<Visitor[]> {
    const snap = await getDocs(
      query(collection(nuxt.$firestore, VISITORS), orderBy('date', 'desc'))
    )
    return snap.docs.map((d) => {
      const data = d.data() as Omit<Visitor, 'id'>
      return { ...data, createdAt: toIsoString(data.createdAt), id: d.id }
    })
  }

  async function fetchChildrenCounts(): Promise<ChildrenCount[]> {
    const snap = await getDocs(
      query(collection(nuxt.$firestore, CHILDREN), orderBy('date', 'desc'))
    )
    return snap.docs.map((d) => ({ ...(d.data() as Omit<ChildrenCount, 'id'>), id: d.id }))
  }

  async function createVisitor(visitor: Omit<Visitor, 'id'>): Promise<Visitor> {
    const ref = await addDoc(
      collection(nuxt.$firestore, VISITORS),
      clean({ ...visitor, createdAt: serverTimestamp() })
    )
    return { ...visitor, id: ref.id }
  }

  async function updateVisitor(id: string, updates: Partial<Omit<Visitor, 'id'>>): Promise<void> {
    await updateDoc(doc(nuxt.$firestore, VISITORS, id), clean(updates))
  }

  async function deleteVisitor(id: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, VISITORS, id))
  }

  /**
   * Record — or correct — the children's figure for one service. Upsert rather than create, since
   * the deterministic id means the document may already exist.
   */
  async function saveChildrenCount(entry: Omit<ChildrenCount, 'id'>): Promise<ChildrenCount> {
    const id = childrenDocId(entry)
    await setDoc(
      doc(nuxt.$firestore, CHILDREN, id),
      { ...entry, updatedAt: serverTimestamp() },
      { merge: true }
    )
    return { ...entry, id }
  }

  async function deleteChildrenCount(id: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, CHILDREN, id))
  }

  return {
    fetchVisitors,
    fetchChildrenCounts,
    createVisitor,
    updateVisitor,
    deleteVisitor,
    saveChildrenCount,
    deleteChildrenCount,
  }
}
