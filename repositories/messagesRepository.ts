/**
 * Firestore access for messages left through the public contact form.
 *
 * This is the only collection an anonymous visitor may write to, which makes it the app's
 * spam surface. Two things keep that bounded, and both matter:
 *
 *   * `firestore.rules` pins the shape — exactly the expected fields, length caps on each,
 *     and `read`/`handled` forced to false so a submission cannot arrive pre-dismissed.
 *   * Nothing here reads back what it wrote. A visitor may create a message and nothing else:
 *     they cannot list, read, edit or delete any of them.
 *
 * Rules cannot rate-limit, so a determined flood is still possible; see README § Contact
 * messages for the options if that ever happens.
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
import type { ContactMessage } from '~/types'
import { toIsoString } from '~/utils/firestoreDates'

const COLLECTION = 'messages'

/** What the public form supplies. Everything else is set here or by the server. */
export type NewContactMessage = Pick<ContactMessage, 'name' | 'email' | 'phone' | 'message'>

export function useMessagesRepository() {
  const nuxt = useNuxtApp()

  /** Newest first — an inbox is read from the top. */
  async function fetchMessages(): Promise<ContactMessage[]> {
    const snap = await getDocs(
      query(collection(nuxt.$firestore, COLLECTION), orderBy('submittedAt', 'desc'))
    )
    return snap.docs.map((d) => {
      const data = d.data() as Omit<ContactMessage, 'id'>
      return { ...data, id: d.id, submittedAt: toIsoString(data.submittedAt) }
    })
  }

  async function createMessage(input: NewContactMessage): Promise<void> {
    await addDoc(collection(nuxt.$firestore, COLLECTION), {
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      message: input.message.trim(),
      // Server-stamped: a client clock says nothing reliable about when a message arrived.
      submittedAt: serverTimestamp(),
      read: false,
      handled: false,
    })
  }

  async function updateMessage(
    id: string,
    updates: Partial<Pick<ContactMessage, 'read' | 'handled'>>
  ): Promise<void> {
    await setDoc(doc(nuxt.$firestore, COLLECTION, id), updates, { merge: true })
  }

  async function deleteMessage(id: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, COLLECTION, id))
  }

  return { fetchMessages, createMessage, updateMessage, deleteMessage }
}
