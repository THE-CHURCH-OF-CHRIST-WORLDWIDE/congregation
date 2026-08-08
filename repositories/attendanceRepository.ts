/**
 * Firestore access for attendance registers.
 *
 * Document ids are deterministic — `{service}__{date}__{memberId}` — so marking the same cell
 * again updates the same document instead of adding another. With random ids, re-opening a
 * register and re-ticking someone would quietly double-count them.
 *
 * Saves go through a batch because a register is marked a screenful at a time: one round trip
 * for the whole sitting, and either all of it lands or none of it does.
 */

import { collection, getDocs, query, writeBatch, doc } from 'firebase/firestore'
import type { AttendanceRecord } from '~/types'

const COLLECTION = 'attendance'

/** Stable key for one member at one service on one date. */
export function attendanceDocId(
  record: Pick<AttendanceRecord, 'serviceType' | 'date' | 'memberId'>
) {
  const service = record.serviceType.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `${service}__${record.date}__${record.memberId}`
}

export function useAttendanceRepository() {
  const nuxt = useNuxtApp()

  async function fetchRecords(): Promise<AttendanceRecord[]> {
    const snap = await getDocs(query(collection(nuxt.$firestore, COLLECTION)))
    return snap.docs.map((d) => ({ ...(d.data() as Omit<AttendanceRecord, 'id'>), id: d.id }))
  }

  /** Upserts every supplied record in one batch. */
  async function saveRecords(records: AttendanceRecord[]): Promise<void> {
    if (!records.length) return
    const batch = writeBatch(nuxt.$firestore)
    for (const record of records) {
      const { id: _ignored, ...data } = record
      batch.set(doc(nuxt.$firestore, COLLECTION, attendanceDocId(record)), data, { merge: true })
    }
    await batch.commit()
  }

  return { fetchRecords, saveRecords }
}
