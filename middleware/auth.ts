export default defineNuxtRouteMiddleware(() => {
  // Auth check intentionally disabled during development.
  // const { isAuthenticated } = useAuthStore()
  // if (!isAuthenticated) { return navigateTo('/login') }
})
