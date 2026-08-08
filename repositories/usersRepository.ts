/**
 * Firestore access for account roles.
 *
 * One document per Firebase Auth account at `users/{uid}`, holding the role that account
 * carries. Firestore rules read the same document to authorise writes, so this collection —
 * not anything in the UI — is what actually grants privilege.
 *
 * The first document has to be created by hand in the Firebase console; rules only let a
 * Super Admin write here, so there is no way to bootstrap the first one from the app.
 * See docs/firebase-setup.md § Account roles.
 */

import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import type { AppUserRecord, ChurchRoleId } from '~/types'

const COLLECTION = 'users'

export function useUsersRepository() {
  const nuxt = useNuxtApp()

  /** The signed-in account's role record, or null when no role has been granted. */
  async function fetchUserRecord(uid: string): Promise<AppUserRecord | null> {
    const snap = await getDoc(doc(nuxt.$firestore, COLLECTION, uid))
    if (!snap.exists()) return null
    return { ...(snap.data() as Omit<AppUserRecord, 'uid'>), uid }
  }

  /**
   * Every account that has been granted a role. Note this lists role *documents*, not
   * Firebase Auth accounts — the client SDK cannot enumerate Auth users, so an account with
   * no role document simply does not appear here.
   */
  async function fetchUserRecords(): Promise<AppUserRecord[]> {
    const snap = await getDocs(collection(nuxt.$firestore, COLLECTION))
    return snap.docs.map((d) => ({ ...(d.data() as Omit<AppUserRecord, 'uid'>), uid: d.id }))
  }

  /** Grant or change an account's role. Rules restrict this to a Super Admin. */
  async function setUserRole(
    uid: string,
    roleId: ChurchRoleId,
    email?: string,
    memberId?: string
  ): Promise<void> {
    const payload: Record<string, unknown> = { roleId }
    if (email) payload.email = email
    if (memberId) payload.memberId = memberId
    await setDoc(doc(nuxt.$firestore, COLLECTION, uid), payload, { merge: true })
  }

  /** Revoke all access. The Auth account itself is untouched — it just loses its role. */
  async function removeUserRecord(uid: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, COLLECTION, uid))
  }

  return { fetchUserRecord, fetchUserRecords, setUserRole, removeUserRecord }
}
