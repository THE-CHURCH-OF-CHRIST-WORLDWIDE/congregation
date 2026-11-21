/**
 * Chart.js theme for "The Register" design system.
 *
 * Presentation only: colours, fonts, gridlines and tooltips. No chart's data, datasets or
 * calculations live here. Series colours are ordered so neighbours stay distinguishable for
 * common colour-vision deficiencies, and each one holds at least 3:1 against both the light and
 * dark admin surfaces.
 */

/** Categorical series, in order of use. Bookcloth first so a single-series chart is on brand. */
export const chartPalette = {
  bookcloth: '#2f7a5c',
  ink: '#3d5f8f',
  gilt: '#c08a2e',
  margin: '#c2493b',
  slate: '#7a8aa0',
  plum: '#8a5a9e',
  teal: '#2e8a92',
  clay: '#a8683f',
} as const

export const chartSeries: string[] = Object.values(chartPalette)

/** Semantic colours for status-style charts (present/absent, income/expense). */
export const chartStatus = {
  positive: '#2f8a57',
  negative: '#c2493b',
  neutral: '#7a8aa0',
  caution: '#c08a2e',
} as const

/** `#rrggbb` → `rgba(r, g, b, a)` for fills under lines and bars. */
export function chartAlpha(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/** Reads a design token from the document, falling back for non-browser contexts. */
export function chartToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export const chartFontFamily =
  "'Public Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
