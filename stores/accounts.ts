import { defineStore } from 'pinia'
import { useUsersRepository } from '~/repositories/usersRepository'
import type { AppUserRecord, ChurchRoleId } from '~/types'

/**
 * Dashboard access: the `users/{uid}` documents that Firestore rules read to authorise
 * writes. Distinct from `useRolesStore`, which records who holds which role in the
 * congregation — a member can be an elder on the nominal roll and have no login at all.
 *
 * The Firebase client SDK cannot list Auth accounts, so this store only ever sees accounts
 * that already have a role document. Granting access to a brand-new account means pasting
 * its UID from the Firebase console.
 */
export const useAccountsStore = defineStore('accounts', () => {
  const records = ref<AppUserRecord[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  function fail(e: unknown, fallback: string): never {
    error.value = e instanceof Error ? e.message : fallback
    useToast().error(error.value)
    throw e
  }

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    error.value = null
    try {
      records.value = await useUsersRepository().fetchUserRecords()
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load account access'
      useToast().error(error.value)
    } finally {
      loading.value = false
    }
  }

  /** Grant or change a role. Rules refuse this unless the caller is a Super Admin. */
  async function grantRole(uid: string, roleId: ChurchRoleId, email?: string) {
    const trimmed = uid.trim()
    if (!trimmed) return
    saving.value = true
    error.value = null
    try {
      await useUsersRepository().setUserRole(trimmed, roleId, email?.trim() || undefined)
      const existing = records.value.findIndex((r) => r.uid === trimmed)
      const next: AppUserRecord = {
        uid: trimmed,
        roleId,
        ...(email?.trim() ? { email: email.trim() } : {}),
      }
      if (existing === -1) records.value.push(next)
      else records.value[existing] = { ...records.value[existing], ...next }
      useToast().success('Access updated')
    } catch (e: unknown) {
      fail(e, 'Failed to update access')
    } finally {
      saving.value = false
    }
  }

  async function revokeAccess(uid: string) {
    saving.value = true
    error.value = null
    try {
      await useUsersRepository().removeUserRecord(uid)
      records.value = records.value.filter((r) => r.uid !== uid)
      useToast().success('Access revoked')
    } catch (e: unknown) {
      fail(e, 'Failed to revoke access')
    } finally {
      saving.value = false
    }
  }

  return { records, loading, saving, error, loaded, load, grantRole, revokeAccess }
})
