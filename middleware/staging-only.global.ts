/**
 * Blocks staging-only routes in production.
 *
 * Global, so a hidden page is unreachable however it is entered — a nav link, a bookmark, a
 * pasted URL. It 404s rather than redirecting, because from production's point of view the page
 * genuinely does not exist; a redirect would tell a visitor there is something there.
 *
 * Hiding is not securing: the page's code is still in the production bundle. Real restrictions
 * belong in `firestore.rules`.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const appEnv = String(useRuntimeConfig().public.appEnv || 'development')
  if (!isRouteHiddenIn(to.path, appEnv)) return

  return abortNavigation(
    createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  )
})
