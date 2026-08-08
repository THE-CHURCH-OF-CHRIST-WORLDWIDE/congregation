import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useMembersStore } from '~/stores/members'
import type { Member } from '~/types'

/**
 * Logging is bookkeeping about a write that already succeeded. If the audit collection refuses
 * the entry, the member must still be added and the user must still see success.
 */
let auditFails = false
const recordEntry = vi.fn(async () => {
  if (auditFails) throw new Error('Missing or insufficient permissions.')
})

vi.mock('~/repositories/auditRepository', () => ({
  useAuditRepository: () => ({ recordEntry, fetchEntries: async () => [] }),
}))

vi.mock('~/repositories/membersRepository', () => ({
  useMembersRepository: () => ({
    fetchMembers: async () => [],
    createMember: async (m: Omit<Member, 'id'>) => ({ ...m, id: 'm-1' }) as Member,
    updateMember: vi.fn(),
    deleteMember: vi.fn(),
  }),
}))

mockNuxtImport('useNuxtApp', () => () => ({
  $auth: { currentUser: { uid: 'u1' } },
  $firestore: {},
}))

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('audit logging does not interfere with the write', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    auditFails = false
    recordEntry.mockClear()
  })

  it('adds the member and records an entry', async () => {
    const store = useMembersStore()
    const created = await store.addMember({ name: 'Grace' } as Omit<Member, 'id'>)
    await flush()

    expect(created.id).toBe('m-1')
    expect(recordEntry).toHaveBeenCalledOnce()
  })

  it('still adds the member when the log write is refused', async () => {
    auditFails = true
    const store = useMembersStore()

    const created = await store.addMember({ name: 'Grace' } as Omit<Member, 'id'>)
    await flush()

    // The write succeeded; only the bookkeeping failed.
    expect(created.id).toBe('m-1')
    expect(store.members).toHaveLength(1)
    expect(store.error).toBe(null)
  })
})
