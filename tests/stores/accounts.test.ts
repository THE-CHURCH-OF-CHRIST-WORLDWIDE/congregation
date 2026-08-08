import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAccountsStore } from '~/stores/accounts'
import type { AppUserRecord } from '~/types'

/**
 * `users/{uid}` is what Firestore rules read to authorise writes, so the store's job is to
 * keep its local copy honest: never show access that was not actually written, and never
 * keep showing access that was revoked.
 */
let stored: AppUserRecord[] = []
let failNextWrite = false

const setUserRole = vi.fn(
  async (uid: string, roleId: string, email?: string, memberId?: string) => {
    if (failNextWrite) throw new Error('Missing or insufficient permissions.')
    const existing = stored.findIndex((r) => r.uid === uid)
    const record = {
      uid,
      roleId,
      ...(email ? { email } : {}),
      ...(memberId ? { memberId } : {}),
    } as AppUserRecord
    if (existing === -1) stored.push(record)
    else stored[existing] = record
  }
)

const removeUserRecord = vi.fn(async (uid: string) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  stored = stored.filter((r) => r.uid !== uid)
})

vi.mock('~/repositories/usersRepository', () => ({
  useUsersRepository: () => ({
    fetchUserRecord: vi.fn(),
    fetchUserRecords: async () => stored,
    setUserRole,
    removeUserRecord,
  }),
}))

describe('useAccountsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    stored = [{ uid: 'uid-1', roleId: 'super-admin', email: 'admin@example.com' }]
    failNextWrite = false
    setUserRole.mockClear()
    removeUserRecord.mockClear()
  })

  it('loads the accounts that hold a role', async () => {
    const store = useAccountsStore()
    await store.load()

    expect(store.records).toHaveLength(1)
    expect(store.records[0]!.roleId).toBe('super-admin')
    expect(store.loaded).toBe(true)
  })

  it('does not reload once loaded unless forced', async () => {
    const store = useAccountsStore()
    await store.load()
    stored = [...stored, { uid: 'uid-2', roleId: 'deacon' }]

    await store.load()
    expect(store.records).toHaveLength(1)

    await store.load(true)
    expect(store.records).toHaveLength(2)
  })

  it('adds a newly granted account', async () => {
    const store = useAccountsStore()
    await store.load()

    await store.grantRole('uid-2', 'deacon', 'deacon@example.com')

    expect(setUserRole).toHaveBeenCalledWith('uid-2', 'deacon', 'deacon@example.com', undefined)
    expect(store.records.map((r) => r.uid)).toEqual(['uid-1', 'uid-2'])
  })

  it('records the linked member when one is given', async () => {
    const store = useAccountsStore()
    await store.load()

    await store.grantRole('uid-2', 'deacon', 'deacon@example.com', 'm-42')

    expect(setUserRole).toHaveBeenCalledWith('uid-2', 'deacon', 'deacon@example.com', 'm-42')
    expect(store.records.find((r) => r.uid === 'uid-2')?.memberId).toBe('m-42')
  })

  it('changes the role of an existing account in place', async () => {
    const store = useAccountsStore()
    await store.load()

    await store.grantRole('uid-1', 'elder')

    expect(store.records).toHaveLength(1)
    expect(store.records[0]!.roleId).toBe('elder')
  })

  it('ignores a blank uid rather than writing an empty document', async () => {
    const store = useAccountsStore()
    await store.load()

    await store.grantRole('   ', 'deacon')

    expect(setUserRole).not.toHaveBeenCalled()
    expect(store.records).toHaveLength(1)
  })

  it('keeps the account listed when the write is refused', async () => {
    const store = useAccountsStore()
    await store.load()
    failNextWrite = true

    await expect(store.grantRole('uid-2', 'deacon')).rejects.toThrow()

    // A rejected write must not appear to have succeeded.
    expect(store.records.map((r) => r.uid)).toEqual(['uid-1'])
    expect(store.saving).toBe(false)
  })

  it('drops the account once access is revoked', async () => {
    const store = useAccountsStore()
    await store.load()

    await store.revokeAccess('uid-1')

    expect(removeUserRecord).toHaveBeenCalledWith('uid-1')
    expect(store.records).toHaveLength(0)
  })

  it('keeps the account when revoking is refused', async () => {
    const store = useAccountsStore()
    await store.load()
    failNextWrite = true

    await expect(store.revokeAccess('uid-1')).rejects.toThrow()

    expect(store.records).toHaveLength(1)
  })
})
