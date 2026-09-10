/**
 * Firestore access for registrations left through the public Bible Lectureship form.
 *
 * Like `messagesRepository`, this collection accepts anonymous creates — `firestore.rules`
 * pins the shape (exactly the expected fields, length caps on each) and a server-stamped
 * `submittedAt`. A visitor may only create a registration; staff read and manage the list from
 * Admin → Lectureship.
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
import type { LectureshipRegistration } from '~/types'
import { toIsoString } from '~/utils/firestoreDates'

const COLLECTION = 'lectureshipRegistrations'

/** What the public form supplies. Everything else is set here or by the server. */
export type NewLectureshipRegistration = Pick<
  LectureshipRegistration,
  'fullName' | 'email' | 'congregation' | 'phone'
>

export function useLectureshipRepository() {
  const nuxt = useNuxtApp()

  /** Newest first — staff read from the top. */
  async function fetchRegistrations(): Promise<LectureshipRegistration[]> {
    const snap = await getDocs(
      query(collection(nuxt.$firestore, COLLECTION), orderBy('submittedAt', 'desc'))
    )
    return snap.docs.map((d) => {
      const data = d.data() as Omit<LectureshipRegistration, 'id'>
      return { ...data, id: d.id, submittedAt: toIsoString(data.submittedAt) }
    })
  }

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

  /**
   * Check a registrant in for the day. Always sends both flags together — `firestore.rules`
   * requires both to be booleans on every write, so a partial update on a record that has
   * never been touched (both fields absent) would otherwise be rejected.
   */
  async function updateAttendance(
    id: string,
    attendance: Pick<LectureshipRegistration, 'attendedSat' | 'attendedSun'>
  ): Promise<void> {
    await setDoc(doc(nuxt.$firestore, COLLECTION, id), attendance, { merge: true })
  }

  async function deleteRegistration(id: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, COLLECTION, id))
  }

  return { fetchRegistrations, createRegistration, updateAttendance, deleteRegistration }
}
