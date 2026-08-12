import { Timestamp } from 'firebase/firestore'

/**
 * Read a Firestore timestamp back as an ISO string.
 *
 * Fields written with `serverTimestamp()` come back as a `Timestamp`, but not always: between
 * a local write and the server's acknowledgement the field reads as `null` from the offline
 * cache, and older documents may hold a plain string. All three are handled, so callers get an
 * ISO string or nothing rather than a value whose type depends on timing.
 */
export function toIsoString(value: unknown): string | undefined {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return undefined
}
