/**
 * Working out which Sundays to offer when recording a service.
 *
 * Kept separate from `utils/date.ts`, which only formats: these answer "which dates could this
 * record belong to", and getting them wrong means a register filed against the wrong morning.
 */

/** 0 = Sunday, matching `Date.prototype.getDay` and `ServiceConfig.dayOfWeek`. */
export const SUNDAY = 0

/**
 * A year from a form field, as the string the `Member` type says it is.
 *
 * `v-model` on an `<input type="number">` does not give back a string: Vue casts through
 * `parseFloat`, so the bound property holds a **number** for anything parseable regardless of how
 * it was declared. Fields typed as strings therefore reach Firestore as numbers, and a collection
 * ends up holding both for the same field — which breaks ordering and equality on it later.
 *
 * Coercing at the save boundary keeps one type in the database. Blank stays blank rather than
 * becoming `"NaN"` or `"0"`.
 */
export function yearAsString(value: unknown): string {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''
  return String(value).trim()
}

/**
 * The most recent occurrence of a weekday, on or before `from`.
 *
 * Returns `from` itself when it already falls on that day — recording on a Sunday morning should
 * default to that Sunday, not the one before it.
 */
export function mostRecentWeekday(dayOfWeek: number = SUNDAY, from: Date = new Date()): Date {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const back = (date.getDay() - dayOfWeek + 7) % 7
  date.setDate(date.getDate() - back)
  return date
}

/**
 * The last `count` Sundays as ISO dates, most recent first.
 *
 * Built from local date components rather than `toISOString`, which shifts the date by the UTC
 * offset and would file a record against Saturday for anyone west of Greenwich. `formatDate(_,
 * 'iso')` does the same thing elsewhere in the app for the same reason.
 */
export function recentSundays(count = 12, from: Date = new Date()): string[] {
  const latest = mostRecentWeekday(SUNDAY, from)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(latest.getFullYear(), latest.getMonth(), latest.getDate() - i * 7)
    return formatDate(d, 'iso')
  })
}
