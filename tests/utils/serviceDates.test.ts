import { describe, expect, it } from 'vitest'
import { mostRecentWeekday, recentSundays, SUNDAY, yearAsString } from '~/utils/serviceDates'

/** 2026-08-12 is a Wednesday. The Sunday before it is the 9th. */
const WEDNESDAY = new Date(2026, 7, 12)
const SUNDAY_9TH = new Date(2026, 7, 9)

describe('mostRecentWeekday', () => {
  it('walks back to the previous Sunday', () => {
    expect(mostRecentWeekday(SUNDAY, WEDNESDAY).getDate()).toBe(9)
  })

  /** Recording on a Sunday morning means that Sunday, not the week before. */
  it('returns the day itself when it is already a Sunday', () => {
    expect(mostRecentWeekday(SUNDAY, SUNDAY_9TH).getDate()).toBe(9)
  })

  it('handles a weekday other than Sunday', () => {
    // Wednesday from a Wednesday is that same day.
    expect(mostRecentWeekday(3, WEDNESDAY).getDate()).toBe(12)
    // Monday before Wednesday the 12th is the 10th.
    expect(mostRecentWeekday(1, WEDNESDAY).getDate()).toBe(10)
  })

  it('does not mutate the date it was given', () => {
    const from = new Date(2026, 7, 12)
    mostRecentWeekday(SUNDAY, from)
    expect(from.getDate()).toBe(12)
  })
})

describe('yearAsString', () => {
  /**
   * Exists because `v-model` on `<input type="number">` casts through `parseFloat` and hands back
   * a number however the bound property was declared, so a string-typed year reached Firestore as
   * a number and the collection ended up holding both for one field.
   */
  it('turns the number a number input produces into a string', () => {
    expect(yearAsString(2023)).toBe('2023')
    expect(yearAsString('2023')).toBe('2023')
  })

  it('keeps blank blank rather than "NaN" or "0"', () => {
    expect(yearAsString('')).toBe('')
    expect(yearAsString(null)).toBe('')
    expect(yearAsString(undefined)).toBe('')
    expect(yearAsString(Number.NaN)).toBe('')
  })

  it('trims a part-typed value instead of guessing at it', () => {
    expect(yearAsString('  2023 ')).toBe('2023')
    expect(yearAsString('-')).toBe('-')
  })
})

describe('recentSundays', () => {
  it('lists Sundays a week apart, most recent first', () => {
    expect(recentSundays(4, WEDNESDAY)).toEqual([
      '2026-08-09',
      '2026-08-02',
      '2026-07-26',
      '2026-07-19',
    ])
  })

  it('crosses a month and a year boundary', () => {
    // 2026-01-07 is a Wednesday; the Sundays run back into December 2025.
    expect(recentSundays(3, new Date(2026, 0, 7))).toEqual([
      '2026-01-04',
      '2025-12-28',
      '2025-12-21',
    ])
  })

  /**
   * Built from local date components, not `toISOString`. Formatting a UTC-shifted date would file
   * a Sunday's record against the Saturday for anyone west of Greenwich.
   */
  it('returns the local calendar date, not a UTC-shifted one', () => {
    // Late evening local time is the following day in UTC.
    const sundayNight = new Date(2026, 7, 9, 23, 30)
    expect(recentSundays(1, sundayNight)).toEqual(['2026-08-09'])
  })

  it('every entry falls on a Sunday', () => {
    for (const iso of recentSundays(10, WEDNESDAY)) {
      const [y, m, d] = iso.split('-').map(Number)
      expect(new Date(y!, m! - 1, d!).getDay()).toBe(SUNDAY)
    }
  })
})
