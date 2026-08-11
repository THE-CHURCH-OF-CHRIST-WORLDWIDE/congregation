/**
 * Deriving `Active` / `Inactive` from the Sunday register.
 *
 * A member who misses the last two Sunday Worship services is marked `Inactive`; attending the
 * most recent one puts them back to `Active`. Pure functions, no store or Firebase access, so the
 * rule can be tested against fabricated registers rather than by clicking through the app.
 *
 * ## What this deliberately does not do
 *
 * It never touches the other six statuses. `Backslider`, `Weak`, `Distant`, `Withdrawal`,
 * `Transfer` and `Late` are pastoral judgements a person recorded on purpose, and each says
 * something more specific than "has not been seen lately" — overwriting one with `Inactive`
 * would destroy information the church acted on. Only the `Active` ⇄ `Inactive` pair is
 * automatic, which also means a secretary can park somebody on any other status and the
 * automation will leave them there.
 */

import type { AttendanceRecord, Member } from '~/types'

/** The main Sunday service. Sunday School keeps a separate register and is not counted. */
export const INACTIVITY_SERVICE = 'Sunday Worship'

/** How many consecutive missed Sundays earn the label. */
export const INACTIVITY_THRESHOLD = 2

/** Consecutive missed Sundays that put somebody on the dashboard's follow-up list. */
export const BACKSLIDER_THRESHOLD = 3

/**
 * How many registers back a streak is counted, for display purposes.
 *
 * Bounded for the same reason the labelling window is: a member imported without a joining date
 * sits behind however much history the church has recorded, and an unbounded streak would report
 * them as having missed all of it. Roughly a quarter of Sundays — long enough to tell a lapse from
 * a lapse of years.
 */
export const ABSENCE_LOOKBACK = 12

/** `YYYY-MM-DD`, so plain string comparison orders dates correctly. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * The dates a Sunday Worship register was actually taken, most recent first.
 *
 * Derived from the records rather than the calendar on purpose: a Sunday nobody registered is a
 * Sunday we know nothing about. Counting those as absences would mark the entire roll inactive
 * the moment the church skips a week or the secretary is away.
 */
export function heldSundays(records: AttendanceRecord[]): string[] {
  const dates = new Set<string>()
  for (const record of records) {
    if (record.serviceType === INACTIVITY_SERVICE && record.date) dates.add(record.date)
  }
  return [...dates].sort().reverse()
}

/** `memberId|date` for every Sunday somebody was actually ticked present. */
function presentKeys(records: AttendanceRecord[]): Set<string> {
  const keys = new Set<string>()
  for (const record of records) {
    if (record.serviceType === INACTIVITY_SERVICE && record.present) {
      keys.add(`${record.memberId}|${record.date}`)
    }
  }
  return keys
}

/**
 * How many of the given Sundays — most recent first — this member missed in a row.
 *
 * Absence is the absence of a tick: no record at all counts the same as one marked not-present,
 * because a register usually only lists who turned up.
 *
 * Sundays that fall before the member joined are skipped rather than counted. Someone registered
 * last Thursday has not "missed" the Sundays before they existed on the roll.
 */
export function consecutiveSundayAbsences(
  member: Pick<Member, 'id' | 'dateJoined'>,
  sundays: string[],
  present: Set<string>
): number {
  const joined = member.dateJoined && ISO_DATE.test(member.dateJoined) ? member.dateJoined : null
  let streak = 0
  for (const date of sundays) {
    if (joined && date < joined) break
    if (present.has(`${member.id}|${date}`)) break
    streak++
  }
  return streak
}

/**
 * The status this member should hold, or `null` to leave them exactly as they are.
 *
 * Only ever proposes a change within the `Active` ⇄ `Inactive` pair, and only when it differs
 * from what is already recorded.
 */
export function nextStatusFor(
  member: Pick<Member, 'id' | 'status' | 'dateJoined'>,
  sundays: string[],
  present: Set<string>
): Member['status'] | null {
  if (member.status !== 'Active' && member.status !== 'Inactive') return null

  const missed = consecutiveSundayAbsences(member, sundays, present)

  // Restored only by turning up: `missed === 0` means present at the most recent register.
  // Still being short of the threshold is not enough — otherwise an Inactive member who missed
  // one more Sunday would be quietly promoted back to Active for having a shorter streak.
  if (member.status === 'Inactive') return missed === 0 ? 'Active' : null

  return missed >= INACTIVITY_THRESHOLD ? 'Inactive' : null
}

export interface StatusUpdate {
  id: string
  name: string
  from: Member['status']
  to: Member['status']
}

/**
 * Every status change the current register implies, for the whole roll.
 *
 * Only the most recent `INACTIVITY_THRESHOLD` registers are examined. Looking further back would
 * mean a member imported without a joining date, who happens to predate a long run of registers,
 * lands on `Inactive` from history alone — the question asked here is only "were they at the last
 * two?".
 */
export function statusUpdatesForRoll(
  members: Member[],
  records: AttendanceRecord[]
): StatusUpdate[] {
  const sundays = heldSundays(records).slice(0, INACTIVITY_THRESHOLD)
  if (!sundays.length) return []

  const present = presentKeys(records)
  const updates: StatusUpdate[] = []

  for (const member of members) {
    const next = nextStatusFor(member, sundays, present)
    if (next && next !== member.status) {
      updates.push({ id: member.id, name: member.name, from: member.status, to: next })
    }
  }

  return updates
}

/**
 * Consecutive missed Sundays for every member on the roll, keyed by member id.
 *
 * Derived on demand rather than kept as a counter on the member record. A stored count would need
 * a write for every member every Sunday — the whole roll, every week — and would go stale the
 * moment a register was corrected after the fact. This cannot drift: it is a function of the
 * registers themselves.
 *
 * Members with an unbroken run of zero are still included, so a caller can show "0" rather than
 * having to tell "no absences" apart from "member not found".
 */
export function absenceStreaks(
  members: Pick<Member, 'id' | 'dateJoined'>[],
  records: AttendanceRecord[]
): Map<string, number> {
  const sundays = heldSundays(records).slice(0, ABSENCE_LOOKBACK)
  const present = presentKeys(records)
  return new Map(members.map((m) => [m.id, consecutiveSundayAbsences(m, sundays, present)]))
}

/** "3 marked inactive, 1 restored" — the one-line summary shown after a register is saved. */
export function summariseStatusUpdates(updates: StatusUpdate[]): string {
  const marked = updates.filter((u) => u.to === 'Inactive').length
  const restored = updates.filter((u) => u.to === 'Active').length
  const parts: string[] = []
  if (marked) parts.push(`${marked} marked inactive`)
  if (restored) parts.push(`${restored} restored to active`)
  return parts.join(', ')
}
