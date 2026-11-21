/**
 * Chart.js theme for "The Nave" design system.
 *
 * Presentation only: colours, fonts, gridlines and tooltips. No chart's data, datasets or
 * calculations live here. The series are earth and pigment tones drawn from the world (forest,
 * slate, bronze, brick, warm stone, plum, teal, olive), ordered so neighbours differ in both hue
 * and lightness for common colour-vision deficiencies. Each holds at least 3:1 against the ivory
 * surface (#faf8f3), so a bar or line stays legible without a border.
 */

/** Categorical series, in order of use. Forest first so a single-series chart is on brand. */
export const chartPalette = {
  bookcloth: '#3f6b4a', // forest, 5.8:1
  ink: '#3e5a73', // slate blue, 6.8:1
  gilt: '#a07534', // bronze, 3.9:1
  margin: '#a3452f', // brick, 5.7:1
  slate: '#857f70', // warm stone, 3.8:1
  plum: '#7d5470', // plum, 5.9:1
  teal: '#2f7a7a', // muted teal, 4.7:1
  clay: '#7a7a2e', // olive, 4.3:1
} as const

export const chartSeries: string[] = Object.values(chartPalette)

/** Semantic colours for status-style charts (present/absent, income/expense). */
export const chartStatus = {
  positive: '#2f6b43',
  negative: '#a3321f',
  neutral: '#857f70',
  caution: '#a07534',
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
  "'Manrope', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
