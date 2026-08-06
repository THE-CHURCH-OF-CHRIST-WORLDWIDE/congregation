import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useMembersStore } from '~/stores/members'
import type { Member } from '~/types'

/**
 * Reproduces a real failure: editing a member saved correctly to Firestore, then the audit call
 * threw while *resolving the store* — outside `record()`'s own guard — so the catch turned a
 * successful write into an error toast and the success message never appeared.
 *
 * The audit log describes work that already succeeded. Nothing about it may reach the user.
 */
let auditThrows = false

vi.mock('~/stores/audit', () => ({
  useAuditStore: () => {
    if (auditThrows) throw new ReferenceError('useAuditStore is not defined')
    return { record: vi.fn() }
  },
  auditActionLabel: (a: string) => a,
}))

const updateMember = vi.fn(async () => {})

vi.mock('~/repositories/membersRepository', () => ({
  useMembersRepository: () => ({
    fetchMembers: async () => [],
    createMember: async (m: Omit<Member, 'id'>) => ({ ...m, id: 'm-1' }) as Member,
    updateMember,
    deleteMember: vi.fn(),
  }),
}))

mockNuxtImport('useNuxtApp', () => () => ({
  $auth: { currentUser: { uid: 'u1' } },
  $firestore: {},
}))

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('a failing audit log cannot break the write it describes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    auditThrows = false
    updateMember.mockClear()
  })

  async function seedOne() {
    const store = useMembersStore()
    await store.addMember({ name: 'Grace', status: 'Active' } as Omit<Member, 'id'>)
    await flush()
    return store
  }

  it('updates the member and reports success when the log resolves', async () => {
    const store = await seedOne()

    await store.updateMember('m-1', { name: 'Grace Effiong' })
    await flush()

    expect(updateMember).toHaveBeenCalledOnce()
    expect(store.members[0]!.name).toBe('Grace Effiong')
    expect(store.error).toBe(null)
  })

  it('still updates the member, with no error, when the audit store throws', async () => {
    const store = await seedOne()
    auditThrows = true

    await store.updateMember('m-1', { name: 'Grace Effiong' })
    await flush()

    // The write landed…
    expect(updateMember).toHaveBeenCalledOnce()
    expect(store.members[0]!.name).toBe('Grace Effiong')
    // …and nothing about the failed logging surfaced.
    expect(store.error).toBe(null)
  })

  it('still adds and deletes members when the audit store throws', async () => {
    auditThrows = true
    const store = useMembersStore()

    const created = await store.addMember({ name: 'Ada', status: 'Active' } as Omit<Member, 'id'>)
    await flush()
    expect(created.id).toBe('m-1')
    expect(store.error).toBe(null)

    await store.deleteMember('m-1')
    await flush()
    expect(store.members).toHaveLength(0)
    expect(store.error).toBe(null)
  })
})
