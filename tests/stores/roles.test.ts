import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRolesStore } from '~/stores/roles'
import type { RoleAssignment, RolePermissions } from '~/types'

/**
 * Assignments used to live only in memory, so every one vanished on reload. They now go to
 * Firestore — these tests pin down that local state follows what was actually written.
 */
let stored: RoleAssignment[] = []
let failNextWrite = false
let nextId = 1

const createAssignment = vi.fn(async (assignment: Omit<RoleAssignment, 'id'>) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  const created = { ...assignment, id: `a-${nextId++}` }
  stored.push(created)
  return created
})

const deleteAssignment = vi.fn(async (id: string) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  stored = stored.filter((a) => a.id !== id)
})

const updateCustomPermissions = vi.fn(async () => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
})

vi.mock('~/repositories/roleAssignmentsRepository', () => ({
  useRoleAssignmentsRepository: () => ({
    fetchAssignments: async () => stored,
    createAssignment,
    deleteAssignment,
    updateCustomPermissions,
  }),
}))

let storedOverrides: { id: string; permissions: RolePermissions }[] = []

const saveRolePermissions = vi.fn(async () => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
})

vi.mock('~/repositories/rolesRepository', () => ({
  useRolesRepository: () => ({
    fetchRoleOverrides: async () => storedOverrides,
    saveRolePermissions,
  }),
}))

describe('useRolesStore assignments', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    stored = []
    storedOverrides = []
    failNextWrite = false
    nextId = 1
    createAssignment.mockClear()
    deleteAssignment.mockClear()
    updateCustomPermissions.mockClear()
    saveRolePermissions.mockClear()
  })

  it('loads assignments from the repository', async () => {
    stored = [{ id: 'a-9', memberId: 'm-1', roleId: 'elder', assignedAt: '2026-01-01' }]
    const store = useRolesStore()
    await store.load()

    expect(store.assignments).toHaveLength(1)
    expect(store.loaded).toBe(true)
  })

  it('keeps the id Firestore generated rather than inventing one', async () => {
    const store = useRolesStore()
    await store.assignRole('m-1', 'elder')

    expect(store.assignments[0]!.id).toBe('a-1')
  })

  it('refuses to assign the same role twice to one member', async () => {
    const store = useRolesStore()
    await store.assignRole('m-1', 'elder')
    await store.assignRole('m-1', 'elder')

    expect(createAssignment).toHaveBeenCalledTimes(1)
    expect(store.assignments).toHaveLength(1)
  })

  it('does not add the assignment locally when the write is refused', async () => {
    const store = useRolesStore()
    failNextWrite = true

    await expect(store.assignRole('m-1', 'elder')).rejects.toThrow()

    expect(store.assignments).toHaveLength(0)
    expect(store.saving).toBe(false)
  })

  it('removes a revoked assignment', async () => {
    const store = useRolesStore()
    await store.assignRole('m-1', 'elder')
    await store.revokeAssignment('a-1')

    expect(deleteAssignment).toHaveBeenCalledWith('a-1')
    expect(store.assignments).toHaveLength(0)
  })

  it('keeps the assignment when revoking is refused', async () => {
    const store = useRolesStore()
    await store.assignRole('m-1', 'elder')
    failNextWrite = true

    await expect(store.revokeAssignment('a-1')).rejects.toThrow()

    expect(store.assignments).toHaveLength(1)
  })

  it('persists custom permissions and merges them into effective permissions', async () => {
    const store = useRolesStore()
    await store.assignRole('m-1', 'deacon')
    await store.updateCustomPermissions('a-1', { Finance: { view: true, export: true } })

    expect(updateCustomPermissions).toHaveBeenCalledWith('a-1', {
      Finance: { view: true, export: true },
    })
    expect(store.effectivePermissions('m-1').Finance?.export).toBe(true)
  })

  it('ignores an unknown assignment id without calling the repository', async () => {
    const store = useRolesStore()
    await store.updateCustomPermissions('nope', {})

    expect(updateCustomPermissions).not.toHaveBeenCalled()
  })
})

/**
 * Role definitions are seeded in code and only their permission matrix is editable, so a
 * stored document overrides `permissions` and nothing else.
 */
describe('useRolesStore permission overrides', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    stored = []
    storedOverrides = []
    failNextWrite = false
    saveRolePermissions.mockClear()
  })

  it('starts from the built-in defaults', () => {
    const store = useRolesStore()

    expect(store.roleById('elder')?.permissions.Finance).toEqual({ view: true, export: true })
  })

  it('applies a stored override over the default matrix', async () => {
    storedOverrides = [{ id: 'elder', permissions: { Finance: { view: true, delete: true } } }]
    const store = useRolesStore()
    await store.load()

    expect(store.roleById('elder')?.permissions.Finance).toEqual({ view: true, delete: true })
    // Name and colour stay code-defined — an override cannot rename a role.
    expect(store.roleById('elder')?.name).toBe('Elder')
  })

  it('ignores an override for a role id that no longer exists', async () => {
    storedOverrides = [{ id: 'archdeacon', permissions: { Finance: { view: true } } }]
    const store = useRolesStore()
    await store.load()

    expect(store.roles.map((r) => r.id)).not.toContain('archdeacon')
    expect(store.roles).toHaveLength(8)
  })

  it('persists an edited matrix', async () => {
    const store = useRolesStore()
    await store.updateRolePermissions('deacon', { Finance: { view: true, export: true } })

    expect(saveRolePermissions).toHaveBeenCalledWith('deacon', {
      Finance: { view: true, export: true },
    })
    expect(store.roleById('deacon')?.permissions.Finance).toEqual({ view: true, export: true })
  })

  it('does not apply the edit locally when the write is refused', async () => {
    const store = useRolesStore()
    // JSON round-trip, not structuredClone: the store's value is a reactive proxy.
    const before = JSON.parse(JSON.stringify(store.roleById('deacon')!.permissions))
    failNextWrite = true

    await expect(
      store.updateRolePermissions('deacon', { Finance: { delete: true } })
    ).rejects.toThrow()

    expect(store.roleById('deacon')?.permissions).toEqual(before)
    expect(store.saving).toBe(false)
  })

  it('does not leak an edit into the built-in defaults', async () => {
    const first = useRolesStore()
    await first.updateRolePermissions('deacon', { Finance: { delete: true } })
    expect(first.roleById('deacon')?.permissions.Finance).toEqual({ delete: true })

    // A fresh store must see the code defaults again, not the previous edit.
    setActivePinia(createPinia())
    const second = useRolesStore()
    expect(second.roleById('deacon')?.permissions.Finance).toEqual({ view: true })
  })
})
