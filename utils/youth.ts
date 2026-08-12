/**
 * Who counts as youth.
 *
 * Youth membership is derived, not recorded: there is no flag on a member and no separate
 * collection, only a date of birth falling inside an age band. The rule lived inline in
 * `stores/members.ts` until the detail panel needed it too — it decides whether to offer the
 * schooling fields — and two copies of an age band is how the Youth page and the profile it
 * opens end up disagreeing about the same person.
 */

import type { Member } from '~/types'

export const YOUTH_MIN_AGE = 13
export const YOUTH_MAX_AGE = 35

/**
 * Age in whole years by calendar year alone, ignoring whether the birthday has passed.
 *
 * Deliberately kept as it was when extracted: correcting it would move members in and out of
 * the Youth roll around the 13 and 35 boundaries, which is a decision about the roll rather
 * than a refactor.
 */
function ageInYears(dob: string, now: Date): number {
  return now.getFullYear() - new Date(dob).getFullYear()
}

/** A member with no date of birth is not youth — it cannot be worked out, so it is not assumed. */
export function isYouth(member: Pick<Member, 'dob'>, now: Date = new Date()): boolean {
  if (!member.dob) return false
  const age = ageInYears(member.dob, now)
  return age >= YOUTH_MIN_AGE && age <= YOUTH_MAX_AGE
}

/**
 * Whether any schooling detail has been recorded.
 *
 * Drives display for members outside the age band: someone who has aged past 35 keeps the
 * school record they filled in at 24, and hiding it would look like data loss.
 */
export function hasSchoolingDetails(member: Member): boolean {
  return Boolean(
    member.school ||
    member.department ||
    member.courseOfStudy ||
    member.program ||
    member.level ||
    member.hallOfResidence ||
    member.yearOfEntry ||
    member.yearOfExit ||
    member.comment
  )
}
