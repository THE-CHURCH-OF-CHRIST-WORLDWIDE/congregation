import { defineStore } from 'pinia'
import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signOut,
  type User,
} from 'firebase/auth'
import { useUsersRepository } from '~/repositories/usersRepository'
import type { ChurchRoleId } from '~/types'

/**
 * Roles that may write church data. Mirrors `isStaff()` in firestore.rules.
 *
 * Exported so a test can compare the two lists directly. The comment saying "keep them in step"
 * had no way of noticing when they drifted, and a role missing from the rules can sign in and then
 * fail every read — which looks like a broken app rather than a missing entry in a list.
 */
export const STAFF_ROLES: ChurchRoleId[] = [
  'super-admin',
  'admin',
  'elder',
  'deacon',
  'preacher',
  'secretary',
  'youth-leader',
  'financial-secretary',
  'content-editor',
]

/** Firebase reports configuration problems as bare codes; name the setting instead. */
function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email link sign-in is not enabled for this Firebase project. Ask an administrator to enable Authentication → Sign-in method → Email/Password → Email link.'
    case 'auth/unauthorized-continue-uri':
    case 'auth/invalid-continue-uri':
      return 'This site is not an authorised domain in Firebase Authentication. Ask an administrator to add it.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/user-not-found':
      // Deliberately vague: confirming which addresses exist is an account-enumeration leak.
      return 'If that address has an account, a message is on its way.'
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'That sign-in link has expired or has already been used. Request a new one.'
    default:
      return e instanceof Error ? e.message : 'Something went wrong. Try again.'
  }
}

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

  /**
   * Email a one-time sign-in link.
   *
   * Invited accounts are created by email link and therefore have no password, so without this
   * they could never sign in again after signing out or moving to another device — the form
   * only offers a password they do not have.
   */
  async function sendLoginLink(email: string) {
    error.value = null
    try {
      await sendSignInLinkToEmail($auth, email.trim().toLowerCase(), {
        url: `${window.location.origin}/login?email=${encodeURIComponent(email.trim().toLowerCase())}`,
        handleCodeInApp: true,
      })
    } catch (err: unknown) {
      error.value = authErrorMessage(err)
      throw err
    }
  }

  /** Is this URL a sign-in link Firebase can complete? */
  function isLoginLink(href: string) {
    return isSignInWithEmailLink($auth, href)
  }

  /** Finish a link sign-in. The role loads exactly as it does for a password sign-in. */
  async function completeLinkSignIn(email: string, href: string) {
    error.value = null
    try {
      const credential = await signInWithEmailLink($auth, email.trim(), href)
      user.value = credential.user
      await loadRole(credential.user.uid)
    } catch (err: unknown) {
      error.value = authErrorMessage(err)
      throw err
    }
  }

  /**
   * Also the way a link-only account gains a password: Firebase lets an account with no password
   * set one through the reset flow.
   */
  async function sendReset(email: string) {
    error.value = null
    try {
      await sendPasswordResetEmail($auth, email.trim().toLowerCase())
    } catch (err: unknown) {
      error.value = authErrorMessage(err)
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
    sendLoginLink,
    isLoginLink,
    completeLinkSignIn,
    sendReset,
    logout,
  }
})
