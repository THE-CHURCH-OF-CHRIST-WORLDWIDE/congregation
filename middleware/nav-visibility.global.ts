import { NAV_VISIBILITY_ITEMS } from '~/constants'
import { isAtOrBelow, isRouteHiddenIn } from '~/utils/routeVisibility'

/**
 * Blocks a route an admin has switched off from Admin → Settings → Navigation.
 *
 * Companion to `staging-only.global.ts`, but admin-editable at runtime instead of env-based —
 * see `NAV_VISIBILITY_ITEMS` in `~/constants`. Global, and 404s rather than redirecting, for the
 * same reason as that middleware: a hidden page is unreachable however it is entered, and a
 * redirect would tell a visitor there is something there.
 *
 * `home` is the one exception: `/` has nowhere else to send a visitor, so turning it off
 * redirects to the first other enabled, reachable item instead of 404ing — that page becomes the
 * effective landing page. See the `home` note on `NAV_VISIBILITY_ITEMS`.
 *
 * The path check runs first, synchronously, so navigation to anything that isn't one of the
 * handful of guarded route bases (every `/admin/*` route included) never touches Firestore.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const item = NAV_VISIBILITY_ITEMS.find((i) => i.path && isAtOrBelow(to.path, i.path))
  if (!item) return

  const settingsStore = useChurchSettingsStore()
  await settingsStore.load()
  if (settingsStore.settings.navVisibility?.[item.key] ?? true) return

  if (item.key === 'home') {
    const appEnv = String(useRuntimeConfig().public.appEnv || 'development')
    const fallback = NAV_VISIBILITY_ITEMS.find(
      (i) =>
        i.key !== 'home' &&
        i.path &&
        (settingsStore.settings.navVisibility?.[i.key] ?? true) &&
        !isRouteHiddenIn(i.path, appEnv)
    )
    // Nothing else is enabled either — leave `/` alone rather than take the whole site down.
    if (!fallback?.path) return
    return navigateTo(fallback.path, { redirectCode: 302 })
  }

  return abortNavigation(
    createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  )
})
