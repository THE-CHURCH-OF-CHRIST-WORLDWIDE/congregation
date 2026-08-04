import { defineStore } from 'pinia'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { useUsersRepository } from '~/repositories/usersRepository'
import type { ChurchRoleId } from '~/types'

/** Roles that may write church data. Mirrors `isStaff()` in firestore.rules. */
const STAFF_ROLES: ChurchRoleId[] = [
  'super-admin',
  'elder',
  'deacon',
  'preacher',
  'secretary',
  'youth-leader',
  'financial-secretary',
]

export const useAuthStore = defineStore('auth', () => {
  const { $auth } = useNuxtApp()

  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  /**
   * The role granted to this account by `users/{uid}`, which is also what Firestore rules
   * enforce against. Null means signed in with no role — the account can reach the
   * dashboard shell but every write will be refused.
   */
  const roleId = ref<ChurchRoleId | null>(null)
  const roleLoaded = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isSuperAdmin = computed(() => roleId.value === 'super-admin')
  const isStaff = computed(() => !!roleId.value && STAFF_ROLES.includes(roleId.value))

  /**
   * Resolves the first time Firebase reports an auth state. Firebase restores a
   * persisted session asynchronously, so anything that branches on
   * `isAuthenticated` — the route guard above all — must wait for this or it
   * will read `false` for a user who is in fact signed in.
   */
  let ready: Promise<void> | null = null

  /**
   * Never let this block `ready`: the route guard awaits `whenReady()` on every admin
   * navigation, so waiting on a Firestore read here would stall routing whenever the
   * connection is slow. A missing or unreadable record simply means "no role".
   */
  async function loadRole(uid: string) {
    try {
      const record = await useUsersRepository().fetchUserRecord(uid)
      roleId.value = record?.roleId ?? null
    } catch {
      roleId.value = null
    } finally {
      roleLoaded.value = true
    }
  }

  function init() {
    if (ready) return ready
    ready = new Promise<void>((resolve) => {
      onAuthStateChanged($auth, (firebaseUser) => {
        user.value = firebaseUser
        loading.value = false
        // Resolve first, then fetch the role in the background.
        resolve()

        if (firebaseUser) {
          roleLoaded.value = false
          void loadRole(firebaseUser.uid)
        } else {
          roleId.value = null
          roleLoaded.value = true
        }
      })
    })
    return ready
  }

  /** Await the initial auth check, starting it if it hasn't begun. */
  function whenReady() {
    return init()
  }

  async function login(email: string, password: string) {
    error.value = null
    try {
      const credential = await signInWithEmailAndPassword($auth, email, password)
      user.value = credential.user
      await loadRole(credential.user.uid)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    }
  }

  async function logout() {
    await signOut($auth)
    user.value = null
    roleId.value = null
    roleLoaded.value = true
  }

  return {
    user,
    loading,
    error,
    roleId,
    roleLoaded,
    isAuthenticated,
    isSuperAdmin,
    isStaff,
    init,
    whenReady,
    login,
    logout,
  }
})
