/**
 * Firestore access for the church nominal roll.
 *
 * Members live in a top-level `members` collection, one document per member,
 * keyed by the Firestore-generated id. Follows the same shape as
 * `churchSettingsRepository`: the repository owns all Firebase calls so stores
 * and components never import `firebase/firestore` directly.
 *
 * ## Church numbers are unique
 *
 * Firestore has no unique constraint, so uniqueness is enforced with a reservation document at
 * `memberNumbers/{key}` holding the member who owns that number. Claiming happens inside a
 * transaction, which is the only thing that actually stops two secretaries assigning the same
 * number at the same moment — a "is this taken?" query would let both read "no" before either
 * writes. See `utils/churchNumber.ts` for how the key is derived.
 */

import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import type { Member } from '~/types'
import { churchNumberKey } from '~/utils/churchNumber'

const COLLECTION = 'members'
const NUMBERS = 'memberNumbers'

/**
 * Thrown when a church number already belongs to somebody else. Carries the number and the
 * holder so the form can name them rather than just saying "taken".
 */
export class ChurchNumberTakenError extends Error {
  constructor(
    readonly churchNumber: string,
    readonly heldBy?: string
  ) {
    super(
      heldBy
        ? `Church number ${churchNumber} is already assigned to ${heldBy}.`
        : `Church number ${churchNumber} is already assigned to another member.`
    )
    this.name = 'ChurchNumberTakenError'
  }
}

/**
 * Firestore rejects `undefined` field values outright, and optional profile
 * fields are routinely left blank on the public registration form.
 */
function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)) as Partial<T>
}

export function useMembersRepository() {
  const nuxt = useNuxtApp()

  const memberRef = (id: string) => doc(nuxt.$firestore, COLLECTION, id)
  const numberRef = (key: string) => doc(nuxt.$firestore, NUMBERS, key)

  async function fetchMembers(): Promise<Member[]> {
    const snap = await getDocs(query(collection(nuxt.$firestore, COLLECTION), orderBy('name')))
    return snap.docs.map((d) => ({ ...(d.data() as Omit<Member, 'id'>), id: d.id }))
  }

  /**
   * Write a member and move its church-number reservation in the same transaction, so the roll
   * can never hold a number whose reservation failed, nor a reservation for a write that failed.
   *
   * `previousKey` is read from the stored document rather than trusted from the caller: a stale
   * form would otherwise release a number the member no longer holds.
   */
  async function writeWithNumber(
    id: string,
    data: Record<string, unknown>,
    churchNumber: string | undefined,
    creating: boolean
  ): Promise<void> {
    const nextKey = churchNumber ? churchNumberKey(churchNumber) : ''

    await runTransaction(nuxt.$firestore, async (tx) => {
      // Every read must happen before the first write.
      const existing = creating ? null : await tx.get(memberRef(id))
      const previousKey = existing?.exists()
        ? churchNumberKey((existing.data() as Member).churchNumber ?? '')
        : ''
      const claimed = nextKey && nextKey !== previousKey ? await tx.get(numberRef(nextKey)) : null

      if (claimed?.exists()) {
        const holder = claimed.data() as { memberId?: string; name?: string }
        // Re-running the same save is not a clash, only somebody else holding it is.
        if (holder.memberId !== id) {
          throw new ChurchNumberTakenError(churchNumber!, holder.name)
        }
      }

      if (previousKey && previousKey !== nextKey) tx.delete(numberRef(previousKey))
      if (nextKey && nextKey !== previousKey) {
        tx.set(numberRef(nextKey), {
          memberId: id,
          churchNumber,
          name: (data.name as string) ?? (existing?.data() as Member | undefined)?.name ?? '',
        })
      }

      tx.set(memberRef(id), data, { merge: !creating })
    })
  }

  async function createMember(member: Omit<Member, 'id'>): Promise<Member> {
    // Id generated up front rather than by addDoc, because the reservation has to name it.
    const ref = doc(collection(nuxt.$firestore, COLLECTION))
    const payload = {
      ...stripUndefined(member as Record<string, unknown>),
      createdAt: serverTimestamp(),
    }

    if (member.churchNumber) {
      await writeWithNumber(ref.id, payload, member.churchNumber, true)
    } else {
      await setDoc(ref, payload)
    }
    return { ...member, id: ref.id }
  }

  async function updateMember(id: string, updates: Partial<Member>): Promise<void> {
    const payload = {
      ...stripUndefined(updates as Record<string, unknown>),
      updatedAt: serverTimestamp(),
    }

    // Only touch reservations when the number is part of this edit. `''` is meaningful — it
    // clears the number and releases it — so this tests for the key's presence, not its truth.
    if ('churchNumber' in updates) {
      await writeWithNumber(id, payload, updates.churchNumber || undefined, false)
      return
    }
    await setDoc(memberRef(id), payload, { merge: true })
  }

  async function deleteMember(id: string): Promise<void> {
    // Release the number first, so a deleted member never keeps one reserved.
    await runTransaction(nuxt.$firestore, async (tx) => {
      const snap = await tx.get(memberRef(id))
      const key = snap.exists() ? churchNumberKey((snap.data() as Member).churchNumber ?? '') : ''
      if (key) tx.delete(numberRef(key))
      tx.delete(memberRef(id))
    })
  }

  return { fetchMembers, createMember, updateMember, deleteMember }
}
