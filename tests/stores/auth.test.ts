import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useAuthStore } from '~/stores/auth'

/**
 * Firebase reports auth state asynchronously. The route guard depends on
 * `whenReady()` resolving only *after* that first report — otherwise refreshing
 * an admin page signs the user out. These tests pin that contract down.
 */
type AuthCallback = (user: { uid: string } | null) => void
let registered: AuthCallback[] = []

/** Resolves only when the test says so, standing in for a slow Firestore read. */
let releaseRoleFetch: (() => void) | null = null
let roleRecord: { roleId: string } | null = null
let roleFetchCalls = 0

vi.mock('~/repositories/usersRepository', () => ({
  useUsersRepository: () => ({
    fetchUserRecord: async () => {
      roleFetchCalls++
      if (releaseRoleFetch) {
        await new Promise<void>((resolve) => {
          releaseRoleFetch = resolve
        })
      }
      return roleRecord
    },
  }),
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, cb: AuthCallback) => {
    registered.push(cb)
    return () => {}
  },
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}))

mockNuxtImport('useNuxtApp', () => () => ({ $auth: {} }))

/** Lets a pending promise settle without asserting on timing. */
const flush = () => new Promise((r) => setTimeout(r, 0))

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    registered = []
    releaseRoleFetch = null
    roleRecord = null
    roleFetchCalls = 0
  })

  it('does not resolve whenReady() until Firebase reports a state', async () => {
    const store = useAuthStore()
    let resolved = false
    store.whenReady().then(() => {
      resolved = true
    })

    await flush()
    // Firebase has not called back yet — the guard must still be waiting.
    expect(resolved).toBe(false)
    expect(store.loading).toBe(true)

    registered[0]!({ uid: 'abc' })
    await flush()

    expect(resolved).toBe(true)
    expect(store.loading).toBe(false)
    expect(store.isAuthenticated).toBe(true)
  })

  it('reports signed-out once Firebase reports null', async () => {
    const store = useAuthStore()
    const ready = store.whenReady()

    registered[0]!(null)
    await ready

    expect(store.isAuthenticated).toBe(false)
    expect(store.loading).toBe(false)
  })

  it('registers a single listener no matter how often init/whenReady are called', async () => {
    const store = useAuthStore()
    store.init()
    store.whenReady()
    store.init()

    expect(registered).toHaveLength(1)
  })

  it('whenReady() resolves immediately once the first check has completed', async () => {
    const store = useAuthStore()
    const first = store.whenReady()
    registered[0]!({ uid: 'abc' })
    await first

    // A later navigation must not hang waiting for a second callback.
    await expect(store.whenReady()).resolves.toBeUndefined()
    expect(registered).toHaveLength(1)
  })
})

/**
 * Firestore rules authorise writes from `users/{uid}`, so the store has to surface that
 * role — but the route guard awaits `whenReady()` on every admin navigation, so fetching
 * it must never be on that path.
 */
describe('useAuthStore roles', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    registered = []
    releaseRoleFetch = null
    roleRecord = null
    roleFetchCalls = 0
  })

  it('does not make whenReady() wait on the role fetch', async () => {
    releaseRoleFetch = () => {} // fetch will hang until released
    const store = useAuthStore()
    const ready = store.whenReady()

    registered[0]!({ uid: 'abc' })

    // Routing proceeds even though the role read has not come back.
    await expect(ready).resolves.toBeUndefined()
    expect(store.roleLoaded).toBe(false)
  })

  it('exposes staff and super-admin from the role record', async () => {
    roleRecord = { roleId: 'super-admin' }
    const store = useAuthStore()
    store.init()
    registered[0]!({ uid: 'abc' })
    await flush()

    expect(store.roleId).toBe('super-admin')
    expect(store.isStaff).toBe(true)
    expect(store.isSuperAdmin).toBe(true)
  })

  it('treats a non-admin staff role as staff but not super admin', async () => {
    roleRecord = { roleId: 'deacon' }
    const store = useAuthStore()
    store.init()
    registered[0]!({ uid: 'abc' })
    await flush()

    expect(store.isStaff).toBe(true)
    expect(store.isSuperAdmin).toBe(false)
  })

  it('reports no role when the account has no users/{uid} document', async () => {
    roleRecord = null
    const store = useAuthStore()
    store.init()
    registered[0]!({ uid: 'abc' })
    await flush()

    expect(store.roleId).toBe(null)
    expect(store.isStaff).toBe(false)
    expect(store.roleLoaded).toBe(true)
  })

  it('does not attempt a role fetch for a signed-out visitor', async () => {
    const store = useAuthStore()
    store.init()
    registered[0]!(null)
    await flush()

    expect(roleFetchCalls).toBe(0)
    expect(store.roleLoaded).toBe(true)
    expect(store.isStaff).toBe(false)
  })
})
