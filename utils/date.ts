/**
 * Date formatting helpers. Thin wrapper over date-fns so call sites stay
 * consistent and the underlying library can be swapped later without grepping
 * the whole repo.
 *
 * Inputs accept `Date | string | number`. Strings are parsed by the native
 * `Date` constructor (ISO 8601 or `YYYY-MM-DD`). Invalid inputs return `''`
 * so they never blow up the UI.
 */

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

export type DateInput = Date | string | number | null | undefined

export type DateStyle =
  /** "5 Mar 2026" — most common compact display */
  | 'short'
  /** "5 March 2026" — formal/long */
  | 'long'
  /** "Friday, 5 March 2026" — full date with weekday */
  | 'full'
  /** "05/03/2026" — numeric only */
  | 'numeric'
  /** "5 Mar" — no year, e.g. week labels */
  | 'dayMonth'
  /** "March 2026" — month + year only */
  | 'monthYear'
  /** ISO date "2026-03-05" — for storage / form inputs */
  | 'iso'

const PATTERNS: Record<DateStyle, string> = {
  short: 'd MMM yyyy',
  long: 'd MMMM yyyy',
  full: 'EEEE, d MMMM yyyy',
  numeric: 'dd/MM/yyyy',
  dayMonth: 'd MMM',
  monthYear: 'MMMM yyyy',
  iso: 'yyyy-MM-dd',
}

function toDate(input: DateInput): Date | null {
  if (input == null || input === '') return null
  if (input instanceof Date) return isValid(input) ? input : null
  if (typeof input === 'number') {
    const d = new Date(input)
    return isValid(d) ? d : null
  }
  // String: try ISO first (preserves date-only without TZ shifts), then fall
  // back to the native constructor for other formats.
  const iso = parseISO(input)
  if (isValid(iso)) return iso
  const fallback = new Date(input)
  return isValid(fallback) ? fallback : null
}

/**
 * Format a date for display. Returns `''` for invalid input.
 *
 * @example
 *   formatDate('2026-03-05')              // "5 Mar 2026"
 *   formatDate(member.dob, 'long')         // "5 March 2026"
 *   formatDate(week.start, 'dayMonth')     // "5 Mar"
 */
export function formatDate(input: DateInput, style: DateStyle = 'short'): string {
  const d = toDate(input)
  if (!d) return ''
  return format(d, PATTERNS[style])
}

/**
 * Human-readable distance from now, e.g. "2 days ago", "in 5 minutes".
 * Returns `''` for invalid input.
 */
export function formatRelative(input: DateInput): string {
  const d = toDate(input)
  if (!d) return ''
  return formatDistanceToNow(d, { addSuffix: true })
}

/**
 * Format a date range, collapsing repeated parts intelligently.
 *
 * @example
 *   formatDateRange('2026-03-05', '2026-03-11')   // "5 – 11 Mar 2026"
 *   formatDateRange('2026-03-05', '2026-04-02')   // "5 Mar – 2 Apr 2026"
 *   formatDateRange('2026-03-05', '2027-01-10')   // "5 Mar 2026 – 10 Jan 2027"
 */
export function formatDateRange(start: DateInput, end: DateInput): string {
  const s = toDate(start)
  const e = toDate(end)
  if (!s || !e) return formatDate(s ?? e)

  const sameYear = s.getFullYear() === e.getFullYear()
  const sameMonth = sameYear && s.getMonth() === e.getMonth()

  if (sameMonth) return `${format(s, 'd')} – ${format(e, 'd MMM yyyy')}`
  if (sameYear) return `${format(s, 'd MMM')} – ${format(e, 'd MMM yyyy')}`
  return `${format(s, 'd MMM yyyy')} – ${format(e, 'd MMM yyyy')}`
}

/**
 * ISO date string (`YYYY-MM-DD`) — safe for Firestore storage and `<input type="date">`.
 * Returns `''` for invalid input.
 */
export function toISODate(input: DateInput): string {
  return formatDate(input, 'iso')
}
