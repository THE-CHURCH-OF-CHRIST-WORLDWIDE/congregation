/**
 * Firestore access for the church nominal roll.
 *
 * Members live in a top-level `members` collection, one document per member,
 * keyed by the Firestore-generated id. Follows the same shape as
 * `churchSettingsRepository`: the repository owns all Firebase calls so stores
 * and components never import `firebase/firestore` directly.
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
} from 'firebase/firestore'
import type { Member } from '~/types'

const COLLECTION = 'members'

/**
 * Firestore rejects `undefined` field values outright, and optional profile
 * fields are routinely left blank on the public registration form.
 */
function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)) as Partial<T>
}

export function useMembersRepository() {
  const nuxt = useNuxtApp()

  async function fetchMembers(): Promise<Member[]> {
    const snap = await getDocs(query(collection(nuxt.$firestore, COLLECTION), orderBy('name')))
    return snap.docs.map((d) => ({ ...(d.data() as Omit<Member, 'id'>), id: d.id }))
  }

  async function createMember(member: Omit<Member, 'id'>): Promise<Member> {
    const payload = {
      ...stripUndefined(member as Record<string, unknown>),
      createdAt: serverTimestamp(),
    }
    const ref = await addDoc(collection(nuxt.$firestore, COLLECTION), payload)
    return { ...member, id: ref.id }
  }

  async function updateMember(id: string, updates: Partial<Member>): Promise<void> {
    const ref = doc(nuxt.$firestore, COLLECTION, id)
    await setDoc(
      ref,
      { ...stripUndefined(updates as Record<string, unknown>), updatedAt: serverTimestamp() },
      { merge: true }
    )
  }

  async function deleteMember(id: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, COLLECTION, id))
  }

  return { fetchMembers, createMember, updateMember, deleteMember }
}
