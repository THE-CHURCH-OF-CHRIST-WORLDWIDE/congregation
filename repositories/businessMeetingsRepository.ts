/**
 * Firestore access for business meeting minutes (`businessMeetings/{id}`).
 *
 * Staff only — minutes record the congregation's internal decisions, so nothing here is public.
 * Who may write, reopen and delete is enforced by firestore.rules; see the `businessMeetings`
 * match block there.
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
import type { BusinessMeeting, BusinessMeetingDraft } from '~/types/businessMeetings'
import { normaliseMeeting } from '~/utils/businessMeetings'

const COLLECTION = 'businessMeetings'

/** Firestore rejects `undefined`; the `id` lives in the document path, not the body. */
function toStored(meeting: Partial<BusinessMeeting>) {
  const { id: _id, ...rest } = meeting
  return JSON.parse(JSON.stringify(rest)) as Record<string, unknown>
}

export function useBusinessMeetingsRepository() {
  const nuxt = useNuxtApp()

  async function fetchMeetings(): Promise<BusinessMeeting[]> {
    const snap = await getDocs(
      query(collection(nuxt.$firestore, COLLECTION), orderBy('date', 'desc'))
    )
    return snap.docs.map((d) => normaliseMeeting(d.id, d.data() as Partial<BusinessMeeting>))
  }

  async function createMeeting(meeting: BusinessMeetingDraft): Promise<string> {
    const ref = await addDoc(collection(nuxt.$firestore, COLLECTION), toStored(meeting))
    return ref.id
  }

  /** Writes the whole document: the editor always holds the complete meeting. */
  async function saveMeeting(meeting: BusinessMeeting): Promise<void> {
    await setDoc(doc(nuxt.$firestore, COLLECTION, meeting.id), toStored(meeting))
  }

  async function deleteMeeting(id: string): Promise<void> {
    await deleteDoc(doc(nuxt.$firestore, COLLECTION, id))
  }

  return { fetchMeetings, createMeeting, saveMeeting, deleteMeeting }
}
