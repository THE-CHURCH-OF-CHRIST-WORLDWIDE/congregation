import { defineStore } from 'pinia'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const { $auth } = useNuxtApp()

  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  /**
   * Resolves the first time Firebase reports an auth state. Firebase restores a
   * persisted session asynchronously, so anything that branches on
   * `isAuthenticated` — the route guard above all — must wait for this or it
   * will read `false` for a user who is in fact signed in.
   */
  let ready: Promise<void> | null = null

  function init() {
    if (ready) return ready
    ready = new Promise<void>((resolve) => {
      onAuthStateChanged($auth, (firebaseUser) => {
        user.value = firebaseUser
        loading.value = false
        resolve()
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
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    }
  }

  async function logout() {
    await signOut($auth)
    user.value = null
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    init,
    whenReady,
    login,
    logout,
  }
})
