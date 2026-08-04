/**
 * Firestore access for role assignments — which nominal-roll member holds which role.
 *
 * One document per assignment in `roleAssignments`, keyed by a Firestore-generated id. This
 * is presentational: it records who is an elder or a deacon in the congregation. It does NOT
 * grant access to the dashboard — that comes solely from `users/{uid}` (see usersRepository).
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
import type { RoleAssignment, RolePermissions } from '~/types'

const COLLECTION = 'roleAssignments'

export function useRoleAssignmentsRepository() {
  const nuxt = useNuxtApp()

  async function fetchAssignments(): Promise<RoleAssignment[]> {
    const snap = await getDocs(
      query(collection(nuxt.$firestore, COLLECTION), orderBy('assignedAt', 'desc'))
    )
    return snap.docs.map((d) => ({ ...(d.data() as Omit<RoleAssignment, 'id'>), id: d.id }))
  }

  async function createAssignment(assignment: Omit<RoleAssignment, 'id'>): Promise<RoleAssignment> {
    // Firestore rejects undefined outright, and customPermissions is usually absent.
    const payload = Object.fromEntries(
      Object.entries(assignment).filter(([, value]) => value !== undefined)
    )
    const ref = await addDoc(collection(nuxt.$firestore, COLLECTION), payload)
    return { ...assignment, id: ref.id }
  }

  async function updateCustomPermissions(
    id: string,
    customPermissions: RolePermissions
  ): Promise<void> {
    await setDoc(doc(nuxt.$firestore, COLLECTION, id), { customPermissions }, { merge: true })
  }

  async function deleteAssignment(id: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, COLLECTION, id))
  }

  return { fetchAssignments, createAssignment, updateCustomPermissions, deleteAssignment }
}
