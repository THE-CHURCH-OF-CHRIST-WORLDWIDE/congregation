import { describe, expect, it } from 'vitest'
import { isAtOrBelow, isRouteHiddenIn, isStagingOnlyRoute } from '~/utils/routeVisibility'
import { STAGING_ONLY_ROUTES } from '~/constants'

/**
 * These use their own fixture lists rather than the real `STAGING_ONLY_ROUTES`, so the tests keep
 * describing the mechanism no matter which pages get added to that list later.
 */
const HIDDEN = ['/admin/finance', '/salvation']

describe('isAtOrBelow', () => {
  it('matches the route itself and everything beneath it', () => {
    expect(isAtOrBelow('/admin/finance', '/admin/finance')).toBe(true)
    expect(isAtOrBelow('/admin/finance/reports', '/admin/finance')).toBe(true)
    expect(isAtOrBelow('/admin/finance/reports/2026', '/admin/finance')).toBe(true)
  })

  it('does not match a sibling that merely starts with the same characters', () => {
    // The bug a naive startsWith() would introduce.
    expect(isAtOrBelow('/admin/finance-archive', '/admin/finance')).toBe(false)
    expect(isAtOrBelow('/admin/financials', '/admin/finance')).toBe(false)
  })

  it('ignores query strings, hashes and trailing slashes', () => {
    expect(isAtOrBelow('/salvation#hear', '/salvation')).toBe(true)
    expect(isAtOrBelow('/salvation?ref=footer', '/salvation')).toBe(true)
    expect(isAtOrBelow('/salvation/', '/salvation')).toBe(true)
  })

  it('treats the site root as the root only', () => {
    expect(isAtOrBelow('/', '/')).toBe(true)
    // Listing '/' must not hide the entire site.
    expect(isAtOrBelow('/about-us', '/')).toBe(false)
  })
})

describe('isStagingOnlyRoute', () => {
  it('reports list membership regardless of environment', () => {
    expect(isStagingOnlyRoute('/salvation', HIDDEN)).toBe(true)
    expect(isStagingOnlyRoute('/admin/nominal-roll', HIDDEN)).toBe(false)
  })

  it('reads the shipped list by default', () => {
    // Whatever is configured, the check must agree with production behaviour.
    for (const route of STAGING_ONLY_ROUTES) {
      expect(isStagingOnlyRoute(route)).toBe(true)
      expect(isRouteHiddenIn(route, 'production')).toBe(true)
      expect(isRouteHiddenIn(route, 'staging')).toBe(false)
    }
  })
})

describe('isRouteHiddenIn', () => {
  it('hides listed routes in production only', () => {
    expect(isRouteHiddenIn('/admin/finance', 'production', HIDDEN)).toBe(true)
    expect(isRouteHiddenIn('/admin/finance', 'staging', HIDDEN)).toBe(false)
    expect(isRouteHiddenIn('/admin/finance', 'development', HIDDEN)).toBe(false)
  })

  it('leaves unlisted routes alone everywhere', () => {
    expect(isRouteHiddenIn('/admin/nominal-roll', 'production', HIDDEN)).toBe(false)
  })

  it('hides nested routes of a listed one', () => {
    expect(isRouteHiddenIn('/admin/finance/reports', 'production', HIDDEN)).toBe(true)
  })

  it('hides nothing when the list is empty', () => {
    expect(isRouteHiddenIn('/admin/finance', 'production', [])).toBe(false)
  })
})

describe('the shipped list', () => {
  it('contains only absolute paths', () => {
    for (const route of STAGING_ONLY_ROUTES) {
      expect(route.startsWith('/')).toBe(true)
    }
  })

  it('never hides the routes needed to reach or run the dashboard', () => {
    // Whatever is on the list, these must stay reachable in production or the app is unusable.
    for (const essential of ['/login', '/invite', '/admin', '/admin/settings', '/register']) {
      expect(isRouteHiddenIn(essential, 'production')).toBe(false)
    }
  })

  it('listing the root hides only the landing page, not the whole site', () => {
    // '/' is a legitimate entry; segment matching stops it swallowing everything below it.
    expect(isAtOrBelow('/about-us', '/')).toBe(false)
    expect(isAtOrBelow('/admin', '/')).toBe(false)
  })
})
