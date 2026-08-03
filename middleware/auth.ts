/**
 * Route guard for the admin dashboard.
 *
 * Applied per page via `definePageMeta({ middleware: ['auth'] })`. Firestore
 * rules are the real enforcement — this only stops signed-out visitors from
 * reaching a dashboard shell they have no data for.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // SPA build (`ssr: false`), so there is no server pass to guard.
  if (import.meta.server) return

  const authStore = useAuthStore()

  // Firebase restores a persisted session asynchronously. Without this wait,
  // refreshing an admin page would read `isAuthenticated === false` and bounce
  // a user who is in fact signed in.
  await authStore.whenReady()

  if (authStore.isAuthenticated) return

  // Carry the destination so login can return them where they meant to go.
  return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
})
