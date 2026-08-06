import { defineStore } from 'pinia'
import { recordAudit } from '~/utils/audit'
import { useRoleAssignmentsRepository } from '~/repositories/roleAssignmentsRepository'
import { useRolesRepository } from '~/repositories/rolesRepository'
import type { ChurchRole, RoleAssignment, RolePermissions, AppPage, AppAction } from '~/types'

// ─── All pages and actions ─────────────────────────────────────────────────────
export const ALL_PAGES: AppPage[] = [
  'Dashboard',
  'Nominal Roll',
  'Youth',
  'Attendance',
  'Teachings',
  'Events',
  'Finance',
  'Settings',
]

export const ALL_ACTIONS: AppAction[] = ['view', 'add', 'edit', 'delete', 'export']

// ─── Helper to build a permission set ─────────────────────────────────────────
function perm(pages: AppPage[], actions: AppAction[]): RolePermissions {
  const result: RolePermissions = {}
  for (const page of pages) {
    result[page] = Object.fromEntries(actions.map((a) => [a, true])) as Record<AppAction, boolean>
  }
  return result
}

function allPerms(): RolePermissions {
  return perm(ALL_PAGES, ALL_ACTIONS)
}

// ─── Default role definitions ─────────────────────────────────────────────────
const DEFAULT_ROLES: ChurchRole[] = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    color: '#6366f1',
    description: 'Full access to all pages and actions across the system.',
    permissions: allPerms(),
  },
  {
    id: 'admin',
    name: 'Admin',
    color: '#ec4899',
    description:
      'Full access to church records and site content. Cannot manage accounts or roles, or view the audit log.',
    permissions: allPerms(),
  },
  {
    id: 'elder',
    name: 'Elder',
    color: '#0ea5e9',
    description: 'Oversees church operations. Access to most modules.',
    permissions: {
      ...perm(
        ['Dashboard', 'Nominal Roll', 'Youth', 'Attendance', 'Teachings', 'Events'],
        ['view', 'add', 'edit', 'delete', 'export']
      ),
      ...perm(['Finance'], ['view', 'export']),
      ...perm(['Settings'], ['view']),
    },
  },
  {
    id: 'deacon',
    name: 'Deacon',
    color: '#f59e0b',
    description: 'Assists in church administration and member welfare.',
    permissions: {
      ...perm(['Dashboard', 'Nominal Roll', 'Youth', 'Attendance'], ['view', 'add', 'edit']),
      ...perm(['Teachings', 'Events'], ['view']),
      ...perm(['Finance'], ['view']),
    },
  },
  {
    id: 'preacher',
    name: 'Preacher',
    color: '#8b5cf6',
    description: 'Manages teachings, sermons, and member spiritual records.',
    permissions: {
      ...perm(['Dashboard', 'Teachings', 'Events'], ['view', 'add', 'edit', 'delete', 'export']),
      ...perm(['Nominal Roll', 'Youth', 'Attendance'], ['view']),
    },
  },
  {
    id: 'secretary',
    name: 'Secretary',
    color: '#10b981',
    description: 'Handles records, correspondence, and administrative tasks.',
    permissions: {
      ...perm(
        ['Dashboard', 'Nominal Roll', 'Youth', 'Attendance', 'Teachings', 'Events'],
        ['view', 'add', 'edit', 'export']
      ),
      ...perm(['Finance'], ['view', 'export']),
      ...perm(['Settings'], ['view']),
    },
  },
  {
    id: 'youth-leader',
    name: 'Youth Leader',
    color: '#f43f5e',
    description: 'Manages youth members, activities, and attendance.',
    permissions: {
      ...perm(['Dashboard', 'Youth', 'Attendance'], ['view', 'add', 'edit', 'export']),
      ...perm(['Teachings', 'Events', 'Nominal Roll'], ['view']),
    },
  },
  {
    id: 'financial-secretary',
    name: 'Financial Secretary',
    color: '#14b8a6',
    description: 'Manages all church financial records and reports.',
    permissions: {
      ...perm(['Dashboard', 'Finance'], ['view', 'add', 'edit', 'delete', 'export']),
      ...perm(['Nominal Roll'], ['view']),
    },
  },
]

/**
 * A fresh copy of the built-in roles. `ref(DEFAULT_ROLES)` would hand out the module-level
 * array itself, so editing a permission mutated the constant for the rest of the session —
 * and, in tests, leaked across cases with a fresh Pinia.
 */
function cloneDefaultRoles(): ChurchRole[] {
  return DEFAULT_ROLES.map((role) => ({ ...role, permissions: structuredClone(role.permissions) }))
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useRolesStore = defineStore('roles', () => {
  const roles = ref<ChurchRole[]>(cloneDefaultRoles())
  const assignments = ref<RoleAssignment[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  function fail(e: unknown, fallback: string): never {
    error.value = e instanceof Error ? e.message : fallback
    useToast().error(error.value)
    throw e
  }

  /**
   * Assignments and permission overrides both come from Firestore. Roles are rebuilt from the
   * code defaults each time so a stored override for a role that no longer exists is ignored,
   * and a role added to the code later still shows up.
   */
  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    error.value = null
    try {
      const [fetchedAssignments, overrides] = await Promise.all([
        useRoleAssignmentsRepository().fetchAssignments(),
        useRolesRepository().fetchRoleOverrides(),
      ])
      assignments.value = fetchedAssignments
      roles.value = cloneDefaultRoles().map((role) => {
        const override = overrides.find((o) => o.id === role.id)
        return override ? { ...role, permissions: override.permissions } : role
      })
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load roles'
      useToast().error(error.value)
    } finally {
      loading.value = false
    }
  }

  // ── Lookups ─────────────────────────────────────────────────────────────────
  function roleById(id: string) {
    return roles.value.find((r) => r.id === id)
  }

  function assignmentsByMember(memberId: string) {
    return assignments.value.filter((a) => a.memberId === memberId)
  }

  function assignmentsWithRole() {
    return assignments.value.map((a) => ({
      ...a,
      role: roleById(a.roleId),
    }))
  }

  // ── Effective permissions for a member (merged from all their role assignments) ──
  function effectivePermissions(memberId: string): RolePermissions {
    const memberAssignments = assignmentsByMember(memberId)
    const merged: RolePermissions = {}

    for (const assignment of memberAssignments) {
      const base = roleById(assignment.roleId)?.permissions ?? {}
      const custom = assignment.customPermissions ?? {}

      for (const page of ALL_PAGES) {
        if (!merged[page]) merged[page] = {}
        const basePagePerms = base[page] ?? {}
        const customPagePerms = custom[page] ?? {}
        for (const action of ALL_ACTIONS) {
          if (customPagePerms[action] !== undefined) {
            merged[page]![action] = customPagePerms[action]
          } else if (basePagePerms[action]) {
            merged[page]![action] = true
          }
        }
      }
    }

    return merged
  }

  // ── Role CRUD ───────────────────────────────────────────────────────────────
  async function updateRolePermissions(roleId: string, permissions: RolePermissions) {
    const idx = roles.value.findIndex((r) => r.id === roleId)
    if (idx === -1) return
    saving.value = true
    error.value = null
    try {
      await useRolesRepository().saveRolePermissions(roleId, permissions)
      roles.value[idx] = { ...roles.value[idx]!, permissions }
      recordAudit({
        action: 'role.permissions',
        targetId: roleId,
        targetLabel: roles.value[idx]!.name,
      })
      useToast().success(`${roles.value[idx]!.name} permissions updated`)
    } catch (e: unknown) {
      fail(e, 'Failed to update permissions')
    } finally {
      saving.value = false
    }
  }

  // ── Assignment CRUD ─────────────────────────────────────────────────────────
  async function assignRole(memberId: string, roleId: string, customPermissions?: RolePermissions) {
    // Prevent duplicate assignment of same role to same member
    const exists = assignments.value.find((a) => a.memberId === memberId && a.roleId === roleId)
    if (exists) {
      useToast().warning('Role already assigned to this member')
      return
    }

    saving.value = true
    error.value = null
    try {
      const created = await useRoleAssignmentsRepository().createAssignment({
        memberId,
        roleId,
        customPermissions,
        assignedAt: new Date().toISOString().slice(0, 10),
      })
      assignments.value.push(created)
      const roleName = roles.value.find((r) => r.id === roleId)?.name ?? 'Role'
      recordAudit({
        action: 'roleAssignment.create',
        targetId: created.id,
        targetLabel: roleName,
      })
      useToast().success(`${roleName} assigned`)
    } catch (e: unknown) {
      fail(e, 'Failed to assign role')
    } finally {
      saving.value = false
    }
  }

  async function revokeAssignment(assignmentId: string) {
    if (!assignments.value.some((a) => a.id === assignmentId)) return
    saving.value = true
    error.value = null
    try {
      await useRoleAssignmentsRepository().deleteAssignment(assignmentId)
      assignments.value = assignments.value.filter((a) => a.id !== assignmentId)
      recordAudit({ action: 'roleAssignment.delete', targetId: assignmentId })
      useToast().success('Role revoked')
    } catch (e: unknown) {
      fail(e, 'Failed to revoke role')
    } finally {
      saving.value = false
    }
  }

  async function updateCustomPermissions(assignmentId: string, customPermissions: RolePermissions) {
    const idx = assignments.value.findIndex((a) => a.id === assignmentId)
    if (idx === -1) return
    saving.value = true
    error.value = null
    try {
      await useRoleAssignmentsRepository().updateCustomPermissions(assignmentId, customPermissions)
      assignments.value[idx] = { ...assignments.value[idx]!, customPermissions }
      recordAudit({ action: 'roleAssignment.update', targetId: assignmentId })
      useToast().success('Custom permissions updated')
    } catch (e: unknown) {
      fail(e, 'Failed to update custom permissions')
    } finally {
      saving.value = false
    }
  }

  return {
    roles,
    assignments,
    loading,
    saving,
    error,
    loaded,
    load,
    roleById,
    assignmentsByMember,
    assignmentsWithRole,
    effectivePermissions,
    updateRolePermissions,
    assignRole,
    revokeAssignment,
    updateCustomPermissions,
  }
})
