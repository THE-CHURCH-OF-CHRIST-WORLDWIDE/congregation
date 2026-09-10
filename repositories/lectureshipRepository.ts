/**
 * Firestore access for registrations left through the public Bible Lectureship form.
 *
 * Like `messagesRepository`, this collection accepts anonymous creates — `firestore.rules`
 * pins the shape (exactly the expected fields, length caps on each) and a server-stamped
 * `submittedAt`. Nothing here reads back what it wrote: a visitor may create a registration
 * and nothing else.
 */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import type { LectureshipRegistration } from '~/types'

const COLLECTION = 'lectureshipRegistrations'

/** What the public form supplies. Everything else is set here or by the server. */
export type NewLectureshipRegistration = Pick<
  LectureshipRegistration,
  'fullName' | 'email' | 'congregation' | 'phone'
>

export function useLectureshipRepository() {
  const nuxt = useNuxtApp()

  async function createRegistration(input: NewLectureshipRegistration): Promise<void> {
    await addDoc(collection(nuxt.$firestore, COLLECTION), {
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      congregation: input.congregation.trim(),
      phone: input.phone.trim(),
      // Server-stamped: a client clock says nothing reliable about when a registration arrived.
      submittedAt: serverTimestamp(),
    })
  }

  return { createRegistration }
}
