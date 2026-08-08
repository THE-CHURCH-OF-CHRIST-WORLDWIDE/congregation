/**
 * Firestore access for the audit log.
 *
 * `auditLog/{autoId}`, append-only: rules allow `create` and `read` but never `update` or
 * `delete`, so an entry cannot be edited or quietly removed — not even by a Super Admin.
 * Reading is Super-Admin-only; writing is open to any staff account, because every staff
 * action needs to be able to record itself.
 *
 * The `at` field is written with `serverTimestamp()` so the time comes from Firestore rather
 * than the client's clock, and is normalised to an ISO string on read.
 */

import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  limit as limitTo,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import type { AuditEntry } from '~/types'

const COLLECTION = 'auditLog'

/** What the caller supplies; `actorUid`, `actorEmail` and `at` are filled in by the store. */
export type AuditDraft = Pick<AuditEntry, 'action' | 'targetId' | 'targetLabel'>

function toIso(value: unknown): string | undefined {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return undefined
}

export function useAuditRepository() {
  const nuxt = useNuxtApp()

  async function recordEntry(
    entry: AuditDraft & { actorUid: string; actorEmail?: string }
  ): Promise<void> {
    const payload = Object.fromEntries(
      Object.entries({ ...entry, at: serverTimestamp() }).filter(([, v]) => v !== undefined)
    )
    await addDoc(collection(nuxt.$firestore, COLLECTION), payload)
  }

  /** Newest first. Capped because the log grows without bound and nobody reads page 40. */
  async function fetchEntries(max = 200): Promise<AuditEntry[]> {
    const snap = await getDocs(
      query(collection(nuxt.$firestore, COLLECTION), orderBy('at', 'desc'), limitTo(max))
    )
    return snap.docs.map((d) => {
      const data = d.data()
      return {
        ...(data as Omit<AuditEntry, 'id' | 'at'>),
        id: d.id,
        at: toIso(data.at),
      }
    })
  }

  return { recordEntry, fetchEntries }
}
