import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRolesStore } from '~/stores/roles'
import { ROLE_NAMES } from '~/constants'
import type { AppPage } from '~/types'

vi.mock('~/utils/audit', () => ({ recordAudit: vi.fn() }))

vi.mock('~/repositories/roleAssignmentsRepository', () => ({
  useRoleAssignmentsRepository: () => ({
    fetchAssignments: async () => [],
    createAssignment: vi.fn(),
    deleteAssignment: vi.fn(),
    updateCustomPermissions: vi.fn(),
  }),
}))

vi.mock('~/repositories/rolesRepository', () => ({
  useRolesRepository: () => ({
    fetchRoleOverrides: async () => [],
    saveRolePermissions: vi.fn(),
  }),
}))

/**
 * The Content Editor exists to keep the public website up to date. What it must NOT reach is the
 * point of the role: the congregation's own records. These assertions are the boundary.
 */
describe('the Content Editor role', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const role = () => useRolesStore().roleById('content-editor')

  it('exists as a built-in role', () => {
    expect(role()).toBeTruthy()
    expect(role()!.name).toBe('Content Editor')
  })

  it('is offered when assigning roles', () => {
    expect(ROLE_NAMES).toContain('Content Editor')
  })

  it('can fully manage everything that appears on the public site', () => {
    for (const page of ['Teachings', 'Events', 'Settings'] as AppPage[]) {
      expect(role()!.permissions[page]).toMatchObject({
        view: true,
        add: true,
        edit: true,
        delete: true,
      })
    }
  })

  it('can reach the dashboard, but only to look at it', () => {
    expect(role()!.permissions.Dashboard).toMatchObject({ view: true })
    expect(role()!.permissions.Dashboard?.edit).toBeFalsy()
  })

  /**
   * The whole reason this is a separate role rather than another Admin: someone who updates the
   * events page has no business reading the nominal roll or the books.
   */
  it('cannot see the congregation’s records at all', () => {
    for (const page of ['Nominal Roll', 'Youth', 'Attendance', 'Finance'] as AppPage[]) {
      expect(role()!.permissions[page]).toBeUndefined()
    }
  })

  it('is not a Super Admin, so roles and accounts stay out of reach', () => {
    expect(role()!.id).not.toBe('super-admin')
  })
})
