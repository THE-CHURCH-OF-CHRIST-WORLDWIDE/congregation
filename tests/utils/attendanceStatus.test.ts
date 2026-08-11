import { describe, expect, it } from 'vitest'
import {
  ABSENCE_LOOKBACK,
  absenceStreaks,
  consecutiveSundayAbsences,
  heldSundays,
  INACTIVITY_SERVICE,
  nextStatusFor,
  statusUpdatesForRoll,
  summariseStatusUpdates,
} from '~/utils/attendanceStatus'
import type { AttendanceRecord, Member } from '~/types'

function member(overrides: Partial<Member> = {}): Member {
  return {
    id: 'm1',
    name: 'Grace Etim',
    gender: 'Female',
    phone: '+2348030000000',
    email: 'grace@example.com',
    status: 'Active',
    absenceCount: 0,
    ...overrides,
  }
}

/** One register line. `serviceType` defaults to the Sunday service the rule watches. */
function rec(
  memberId: string,
  date: string,
  present: boolean,
  serviceType: string = INACTIVITY_SERVICE
): AttendanceRecord {
  return {
    id: `${memberId}-${date}-${serviceType}`,
    memberId,
    serviceId: 'sid',
    date,
    present,
    serviceType,
  }
}

describe('heldSundays', () => {
  it('lists the dates a register was taken, most recent first', () => {
    const records = [
      rec('m1', '2026-01-04', true),
      rec('m2', '2026-01-18', false),
      rec('m1', '2026-01-11', true),
    ]
    expect(heldSundays(records)).toEqual(['2026-01-18', '2026-01-11', '2026-01-04'])
  })

  it('ignores other services, so Sunday School cannot stand in for Sunday Worship', () => {
    const records = [rec('m1', '2026-01-11', true, 'Sunday School'), rec('m1', '2026-01-04', true)]
    expect(heldSundays(records)).toEqual(['2026-01-04'])
  })

  /**
   * The reason held Sundays come from the register rather than the calendar: a week nobody
   * registered must not read as a week everybody missed.
   */
  it('is empty when no register was ever taken', () => {
    expect(heldSundays([])).toEqual([])
    expect(heldSundays([rec('m1', '2026-01-07', true, 'Bible Class')])).toEqual([])
  })
})

describe('consecutiveSundayAbsences', () => {
  const sundays = ['2026-01-18', '2026-01-11', '2026-01-04']

  it('counts a missing record as an absence, the same as one marked not-present', () => {
    // Absent on the 18th by omission, explicitly absent on the 11th.
    const present = new Set(['m1|2026-01-04'])
    expect(consecutiveSundayAbsences(member(), sundays, present)).toBe(2)
  })

  it('stops counting at the first Sunday they attended', () => {
    const present = new Set(['m1|2026-01-18'])
    expect(consecutiveSundayAbsences(member(), sundays, present)).toBe(0)
  })

  it('does not count Sundays before the member joined the roll', () => {
    const joinedAfterAll = member({ dateJoined: '2026-01-20' })
    expect(consecutiveSundayAbsences(joinedAfterAll, sundays, new Set())).toBe(0)

    const joinedMidway = member({ dateJoined: '2026-01-12' })
    expect(consecutiveSundayAbsences(joinedMidway, sundays, new Set())).toBe(1)
  })

  it('ignores a joining date that is not a plain ISO date', () => {
    const odd = member({ dateJoined: 'last Christmas' })
    expect(consecutiveSundayAbsences(odd, sundays, new Set())).toBe(3)
  })
})

describe('nextStatusFor', () => {
  const sundays = ['2026-01-18', '2026-01-11']

  it('marks an Active member Inactive after two missed Sundays', () => {
    expect(nextStatusFor(member(), sundays, new Set())).toBe('Inactive')
  })

  it('leaves an Active member alone after only one missed Sunday', () => {
    const present = new Set(['m1|2026-01-11'])
    expect(nextStatusFor(member(), sundays, present)).toBe(null)
  })

  it('restores an Inactive member who turns up again', () => {
    const present = new Set(['m1|2026-01-18'])
    expect(nextStatusFor(member({ status: 'Inactive' }), sundays, present)).toBe('Active')
  })

  it('keeps an Inactive member inactive while they stay away', () => {
    expect(nextStatusFor(member({ status: 'Inactive' }), sundays, new Set())).toBe(null)
  })

  /**
   * The guarantee that matters most: these six statuses are decisions somebody recorded on
   * purpose, and each says more than "has not been seen lately".
   */
  it('never touches a pastoral status, however long the absence', () => {
    const protectedStatuses: Member['status'][] = [
      'Backslider',
      'Weak',
      'Distant',
      'Withdrawal',
      'Disfellowshipped',
      'Transfer',
      'Late',
    ]
    for (const status of protectedStatuses) {
      expect(nextStatusFor(member({ status }), sundays, new Set())).toBe(null)
    }
  })
})

describe('statusUpdatesForRoll', () => {
  it('reports only the members whose status actually changes', () => {
    const members = [
      member({ id: 'away', name: 'Away Member' }),
      member({ id: 'came', name: 'Came Back', status: 'Inactive' }),
      member({ id: 'here', name: 'Here Every Week' }),
      member({ id: 'transferred', name: 'Transferred Out', status: 'Transfer' }),
    ]
    const records = [
      // Register taken on two Sundays. 'away' appears on neither.
      rec('came', '2026-01-18', true),
      rec('here', '2026-01-18', true),
      rec('came', '2026-01-11', false),
      rec('here', '2026-01-11', true),
    ]

    expect(statusUpdatesForRoll(members, records)).toEqual([
      { id: 'away', name: 'Away Member', from: 'Active', to: 'Inactive' },
      { id: 'came', name: 'Came Back', from: 'Inactive', to: 'Active' },
    ])
  })

  it('changes nothing when no Sunday register exists', () => {
    expect(statusUpdatesForRoll([member()], [])).toEqual([])
  })

  it('changes nothing off a single register — two absences cannot have happened yet', () => {
    const records = [rec('other', '2026-01-18', true)]
    expect(statusUpdatesForRoll([member()], records)).toEqual([])
  })

  /**
   * Only the last two registers are examined. A member imported without a joining date sits
   * behind years of history they were never part of; that history must not label them.
   */
  it('looks no further back than the two most recent registers', () => {
    const records = [
      rec('m1', '2026-01-18', true),
      rec('m1', '2026-01-11', true),
      rec('m1', '2026-01-04', false),
      rec('m1', '2025-12-28', false),
    ]
    expect(statusUpdatesForRoll([member()], records)).toEqual([])
  })
})

describe('absenceStreaks', () => {
  it('gives every member on the roll an entry, including those with none', () => {
    const members = [member({ id: 'away' }), member({ id: 'here' })]
    const records = [
      rec('here', '2026-01-18', true),
      rec('here', '2026-01-11', true),
      rec('away', '2026-01-18', false),
    ]

    const streaks = absenceStreaks(members, records)
    expect(streaks.get('away')).toBe(2)
    expect(streaks.get('here')).toBe(0)
    // Present as 0 rather than absent, so "no absences" is distinguishable from "unknown member".
    expect(streaks.has('here')).toBe(true)
  })

  /** Unlike the labelling window, this counts a long run — that is the point of the number. */
  it('counts past the two-Sunday labelling window', () => {
    const records = ['2026-01-25', '2026-01-18', '2026-01-11', '2026-01-04'].map((d) =>
      rec('m1', d, false)
    )
    expect(absenceStreaks([member()], records).get('m1')).toBe(4)
  })

  it('stops at the lookback bound rather than counting all recorded history', () => {
    // 20 registers, every one missed. The streak is capped at ABSENCE_LOOKBACK.
    const records = Array.from({ length: 20 }, (_, i) =>
      rec('m1', `2026-01-${String(i + 1).padStart(2, '0')}`, false)
    )
    expect(absenceStreaks([member()], records).get('m1')).toBe(ABSENCE_LOOKBACK)
  })

  it('does not count Sundays before the member joined', () => {
    const records = ['2026-01-25', '2026-01-18', '2026-01-11'].map((d) => rec('m1', d, false))
    const joinedLate = member({ dateJoined: '2026-01-20' })
    expect(absenceStreaks([joinedLate], records).get('m1')).toBe(1)
  })
})

describe('summariseStatusUpdates', () => {
  it('names both directions', () => {
    const updates = [
      { id: 'a', name: 'A', from: 'Active' as const, to: 'Inactive' as const },
      { id: 'b', name: 'B', from: 'Active' as const, to: 'Inactive' as const },
      { id: 'c', name: 'C', from: 'Inactive' as const, to: 'Active' as const },
    ]
    expect(summariseStatusUpdates(updates)).toBe('2 marked inactive, 1 restored to active')
  })

  it('is empty when nothing changed', () => {
    expect(summariseStatusUpdates([])).toBe('')
  })
})
