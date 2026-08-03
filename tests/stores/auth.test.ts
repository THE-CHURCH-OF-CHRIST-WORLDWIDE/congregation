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
