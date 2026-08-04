/**
 * Firestore access for role permission overrides.
 *
 * The seven roles themselves are defined in code (`DEFAULT_ROLES` in `stores/roles.ts`) — their
 * ids, names, colours and descriptions are not editable. Only the permission matrix is, so a
 * document here holds nothing but `permissions`, keyed by the role id it overrides.
 *
 * Storing overrides rather than whole roles means a role added to the code later still appears,
 * and a stored document for a role that no longer exists is simply ignored on load.
 */

import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import type { ChurchRoleId, RolePermissions } from '~/types'

const COLLECTION = 'roles'

export interface RolePermissionOverride {
  id: ChurchRoleId
  permissions: RolePermissions
}

export function useRolesRepository() {
  const nuxt = useNuxtApp()

  async function fetchRoleOverrides(): Promise<RolePermissionOverride[]> {
    const snap = await getDocs(collection(nuxt.$firestore, COLLECTION))
    return snap.docs.map((d) => ({
      id: d.id as ChurchRoleId,
      permissions: (d.data().permissions ?? {}) as RolePermissions,
    }))
  }

  async function saveRolePermissions(roleId: string, permissions: RolePermissions): Promise<void> {
    await setDoc(doc(nuxt.$firestore, COLLECTION, roleId), { permissions }, { merge: true })
  }

  return { fetchRoleOverrides, saveRolePermissions }
}
