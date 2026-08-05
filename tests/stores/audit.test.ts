import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useAuditStore, auditActionLabel } from '~/stores/audit'
import type { AuditEntry } from '~/types'

/**
 * The log records actions that have already succeeded, so its own failure must stay invisible:
 * a rejected entry cannot be allowed to surface as an error on a save that worked.
 */
let stored: AuditEntry[] = []
let failWrite = false
let failRead = false

const recordEntry = vi.fn(async (entry: Record<string, unknown>) => {
  if (failWrite) throw new Error('Missing or insufficient permissions.')
  stored.unshift({ id: `e-${stored.length + 1}`, ...entry } as AuditEntry)
})

const fetchEntries = vi.fn(async () => {
  if (failRead) throw new Error('Missing or insufficient permissions.')
  return stored
})

vi.mock('~/repositories/auditRepository', () => ({
  useAuditRepository: () => ({ recordEntry, fetchEntries }),
}))

let currentUser: { uid: string; email?: string } | null = { uid: 'uid-1', email: 'a@b.com' }

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({ user: currentUser }),
}))

mockNuxtImport('useNuxtApp', () => () => ({ $auth: { currentUser: null }, $firestore: {} }))

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('useAuditStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    stored = []
    failWrite = false
    failRead = false
    currentUser = { uid: 'uid-1', email: 'a@b.com' }
    recordEntry.mockClear()
    fetchEntries.mockClear()
  })

  it('attributes an entry to the signed-in account', async () => {
    const store = useAuditStore()
    store.record({ action: 'member.create', targetId: 'm-1', targetLabel: 'Grace' })
    await flush()

    expect(recordEntry).toHaveBeenCalledWith({
      action: 'member.create',
      targetId: 'm-1',
      targetLabel: 'Grace',
      actorUid: 'uid-1',
      actorEmail: 'a@b.com',
    })
  })

  it('never throws when the write is refused', async () => {
    const store = useAuditStore()
    failWrite = true

    // Synchronous call must not throw, and the rejection must not escape either.
    expect(() => store.record({ action: 'settings.update' })).not.toThrow()
    await expect(flush()).resolves.toBeUndefined()
  })

  it('records nothing when there is no signed-in actor', async () => {
    currentUser = null
    const store = useAuditStore()
    store.record({ action: 'settings.update' })
    await flush()

    expect(recordEntry).not.toHaveBeenCalled()
  })

  it('loads entries and does not refetch unless forced', async () => {
    stored = [{ id: 'e-1', action: 'member.create', actorUid: 'uid-1' }]
    const store = useAuditStore()
    await store.load()
    expect(store.entries).toHaveLength(1)

    stored = [...stored, { id: 'e-2', action: 'member.delete', actorUid: 'uid-1' }]
    await store.load()
    expect(store.entries).toHaveLength(1)

    await store.load(true)
    expect(store.entries).toHaveLength(2)
  })

  it('surfaces a refused read as an error rather than an empty log', async () => {
    failRead = true
    const store = useAuditStore()
    await store.load()

    expect(store.error).toMatch(/permissions/i)
    expect(store.loaded).toBe(false)
  })

  it('labels every action it can record', () => {
    const actions = [
      'member.create',
      'member.update',
      'member.delete',
      'settings.update',
      'role.permissions',
      'roleAssignment.create',
      'roleAssignment.update',
      'roleAssignment.delete',
      'access.grant',
      'access.revoke',
      'invitation.send',
      'invitation.revoke',
      'invitation.claim',
    ] as const

    for (const action of actions) {
      const label = auditActionLabel(action)
      // A missing entry falls back to the raw key, which would read as debug output.
      expect(label).not.toBe(action)
      expect(label.length).toBeGreaterThan(0)
    }
  })
})
