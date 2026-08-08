import { STAGING_ONLY_ROUTES } from '~/constants'

/**
 * Whether `path` is at or below `base`.
 *
 * Prefix matching by segment, not by string: `/admin/finance` covers `/admin/finance/reports`
 * but must not swallow `/admin/finance-archive`.
 */
export function isAtOrBelow(path: string, base: string): boolean {
  const clean = (value: string) => {
    const withoutQuery = value.split('?')[0]!.split('#')[0]!
    return withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, '') : withoutQuery
  }
  const p = clean(path)
  const b = clean(base)
  return p === b || p.startsWith(`${b}/`)
}

/** Is this route on the staging-only list? */
export function isStagingOnlyRoute(path: string, routes: string[] = STAGING_ONLY_ROUTES): boolean {
  return routes.some((base) => isAtOrBelow(path, base))
}

/**
 * Should this route be hidden in the given environment?
 *
 * Only `production` hides anything — staging and local development show everything, which is the
 * point: the work is reachable where it is being reviewed.
 */
export function isRouteHiddenIn(
  path: string,
  appEnv: string,
  routes: string[] = STAGING_ONLY_ROUTES
): boolean {
  return appEnv === 'production' && isStagingOnlyRoute(path, routes)
}
