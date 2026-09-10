import { NAV_VISIBILITY_ITEMS } from '~/constants'
import type { NavVisibilityKey } from '~/constants'

/**
 * Admin-editable nav visibility, on top of `useRouteVisibility`'s env-based one.
 *
 * Reads `ChurchSettings.navVisibility`, so it follows whatever `useChurchSettingsStore` currently
 * holds — reactive once the settings doc loads, `true` (visible) before it does or for a key a
 * stored document predates. See `constants/index.ts` for the full item list and what each guards.
 *
 * ```vue
 * <li v-if="isNavItemVisible('events')">...</li>
 * ```
 */
export function useNavVisibility() {
  const settingsStore = useChurchSettingsStore()

  function isNavItemVisible(key: NavVisibilityKey): boolean {
    return settingsStore.settings.navVisibility?.[key] ?? true
  }

  return {
    isNavItemVisible,
    items: NAV_VISIBILITY_ITEMS,
  }
}
