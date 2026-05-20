import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '~/stores/ui'

describe('useUiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('defaults sidebar open on desktop and closed on mobile', () => {
    const store = useUiStore()
    expect(store.sidebarOpen).toBe(true)
    expect(store.mobileSidebarOpen).toBe(false)
  })

  it('toggleSidebar flips the mobile sidebar without touching the desktop sidebar', () => {
    const store = useUiStore()
    store.toggleSidebar()
    expect(store.mobileSidebarOpen).toBe(true)
    expect(store.sidebarOpen).toBe(true)
    store.toggleSidebar()
    expect(store.mobileSidebarOpen).toBe(false)
  })

  it('closeMobileSidebar forces the mobile sidebar shut', () => {
    const store = useUiStore()
    store.toggleSidebar()
    expect(store.mobileSidebarOpen).toBe(true)
    store.closeMobileSidebar()
    expect(store.mobileSidebarOpen).toBe(false)
  })
})
