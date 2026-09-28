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
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import type { LectureshipRegistration, LectureshipSpeaker } from '~/types'
import { toIsoString } from '~/utils/firestoreDates'

const COLLECTION = 'lectureshipRegistrations'
const SPEAKERS_COLLECTION = 'lectureshipSpeakers'
const STATS_COLLECTION = 'lectureshipStats'
const STATS_DOC_ID = 'registrations'

/** What the public form supplies. Everything else is set here or by the server. */
export type NewLectureshipRegistration = Pick<
  LectureshipRegistration,
  'fullName' | 'email' | 'congregation' | 'phone'
>

export type NewLectureshipSpeaker = Omit<LectureshipSpeaker, 'id'>

function clean<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined))
}

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
    // Best-effort — the registration above is what matters; a registrant must never see it fail
    // just because this public counter's bookkeeping write did. `load()` self-heals any drift.
    try {
      await setDoc(
        doc(nuxt.$firestore, STATS_COLLECTION, STATS_DOC_ID),
        { registeredCount: increment(1) },
        { merge: true }
      )
    } catch {
      // Ignored — see above.
    }
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
    // Best-effort, same reasoning as the increment in createRegistration.
    try {
      await setDoc(
        doc(nuxt.$firestore, STATS_COLLECTION, STATS_DOC_ID),
        { registeredCount: increment(-1) },
        { merge: true }
      )
    } catch {
      // Ignored — see above.
    }
  }

  /** The public "X people have registered" figure — never contains any registrant's own data. */
  async function fetchRegisteredCount(): Promise<number> {
    const snap = await getDoc(doc(nuxt.$firestore, STATS_COLLECTION, STATS_DOC_ID))
    const data = snap.data() as { registeredCount?: number } | undefined
    return data?.registeredCount ?? 0
  }

  /** Staff-only direct correction, used to self-heal the counter back to the true total. */
  async function setRegisteredCount(count: number): Promise<void> {
    await setDoc(doc(nuxt.$firestore, STATS_COLLECTION, STATS_DOC_ID), { registeredCount: count })
  }

  /** Speakers and officiating ministers, in display order within their role group. */
  async function fetchSpeakers(): Promise<LectureshipSpeaker[]> {
    const snap = await getDocs(
      query(collection(nuxt.$firestore, SPEAKERS_COLLECTION), orderBy('order'))
    )
    return snap.docs.map((d) => ({ ...(d.data() as Omit<LectureshipSpeaker, 'id'>), id: d.id }))
  }

  async function createSpeaker(input: NewLectureshipSpeaker): Promise<LectureshipSpeaker> {
    const ref = await addDoc(collection(nuxt.$firestore, SPEAKERS_COLLECTION), clean(input))
    return { ...input, id: ref.id }
  }

  async function updateSpeaker(id: string, updates: Partial<NewLectureshipSpeaker>): Promise<void> {
    await setDoc(doc(nuxt.$firestore, SPEAKERS_COLLECTION, id), clean(updates), { merge: true })
  }

  async function deleteSpeaker(id: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, SPEAKERS_COLLECTION, id))
  }

  return {
    fetchRegistrations,
    createRegistration,
    updateAttendance,
    deleteRegistration,
    fetchRegisteredCount,
    setRegisteredCount,
    fetchSpeakers,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
  }
}
