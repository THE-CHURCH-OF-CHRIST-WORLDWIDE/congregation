/**
 * Firestore access for pending invitations.
 *
 * One document per invited email in `invitations`, keyed by the **lower-cased email**. That id
 * is load-bearing: `firestore.rules` compares it against `request.auth.token.email` to decide
 * whether an account may claim the invitation and give itself the named role. Writing a
 * differently-cased id would silently produce an invitation nobody can claim.
 */

import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import type { ChurchRoleId, Invitation } from '~/types'

const COLLECTION = 'invitations'

/** Rules match on the token email verbatim, and Firebase reports it lower-cased. */
export function invitationId(email: string): string {
  return email.trim().toLowerCase()
}

export function useInvitationsRepository() {
  const nuxt = useNuxtApp()

  async function fetchInvitations(): Promise<Invitation[]> {
    const snap = await getDocs(collection(nuxt.$firestore, COLLECTION))
    return snap.docs.map((d) => ({ ...(d.data() as Omit<Invitation, 'email'>), email: d.id }))
  }

  /** The invitation addressed to one email, or null. Used by the claim flow. */
  async function fetchInvitation(email: string): Promise<Invitation | null> {
    const id = invitationId(email)
    const snap = await getDoc(doc(nuxt.$firestore, COLLECTION, id))
    if (!snap.exists()) return null
    return { ...(snap.data() as Omit<Invitation, 'email'>), email: id }
  }

  async function createInvitation(
    email: string,
    roleId: ChurchRoleId,
    invitedBy?: string
  ): Promise<Invitation> {
    const id = invitationId(email)
    const invitation: Invitation = {
      email: id,
      roleId,
      invitedAt: new Date().toISOString(),
      ...(invitedBy ? { invitedBy } : {}),
    }
    await setDoc(doc(nuxt.$firestore, COLLECTION, id), invitation)
    return invitation
  }

  async function deleteInvitation(email: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, COLLECTION, invitationId(email)))
  }

  return { fetchInvitations, fetchInvitation, createInvitation, deleteInvitation }
}
