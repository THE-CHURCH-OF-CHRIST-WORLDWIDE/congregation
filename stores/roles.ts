import { defineStore } from 'pinia'
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

// ─── Store ────────────────────────────────────────────────────────────────────
export const useRolesStore = defineStore('roles', () => {
  const roles = ref<ChurchRole[]>(DEFAULT_ROLES)
  const assignments = ref<RoleAssignment[]>([])

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
  function updateRolePermissions(roleId: string, permissions: RolePermissions) {
    const idx = roles.value.findIndex((r) => r.id === roleId)
    if (idx !== -1) roles.value[idx] = { ...roles.value[idx]!, permissions }
  }

  // ── Assignment CRUD ─────────────────────────────────────────────────────────
  function assignRole(memberId: string, roleId: string, customPermissions?: RolePermissions) {
    // Prevent duplicate assignment of same role to same member
    const exists = assignments.value.find((a) => a.memberId === memberId && a.roleId === roleId)
    if (exists) return

    assignments.value.push({
      id: String(Date.now()),
      memberId,
      roleId,
      customPermissions,
      assignedAt: new Date().toISOString().slice(0, 10),
    })
  }

  function revokeAssignment(assignmentId: string) {
    assignments.value = assignments.value.filter((a) => a.id !== assignmentId)
  }

  function updateCustomPermissions(assignmentId: string, customPermissions: RolePermissions) {
    const idx = assignments.value.findIndex((a) => a.id === assignmentId)
    if (idx !== -1) assignments.value[idx] = { ...assignments.value[idx]!, customPermissions }
  }

  return {
    roles,
    assignments,
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
