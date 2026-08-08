/**
 * Route visibility for the current environment.
 *
 * Reads `APP_ENV` once and exposes the check components need, so no component has to know how
 * the environment is plumbed. See `STAGING_ONLY_ROUTES` in `~/constants` for the list.
 *
 * ```vue
 * <NuxtLink v-if="!isHidden('/admin/finance')" to="/admin/finance">Finance</NuxtLink>
 * ```
 */
export function useRouteVisibility() {
  const appEnv = String(useRuntimeConfig().public.appEnv || 'development')

  return {
    appEnv,
    isProduction: appEnv === 'production',
    /** True when this route is hidden in the current environment. */
    isHidden: (path: string) => isRouteHiddenIn(path, appEnv),
    /** Convenience for nav arrays: keeps only the entries that should be visible. */
    visible: <T extends { to: string }>(items: T[]) =>
      items.filter((item) => !isRouteHiddenIn(item.to, appEnv)),
  }
}
