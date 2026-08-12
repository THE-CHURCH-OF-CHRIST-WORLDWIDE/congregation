import { describe, expect, it } from 'vitest'
import { hasSchoolingDetails, isYouth, YOUTH_MAX_AGE, YOUTH_MIN_AGE } from '~/utils/youth'
import type { Member } from '~/types'

/** A fixed "now" so the band edges are exact rather than dependent on when the suite runs. */
const NOW = new Date('2026-06-15T00:00:00Z')

function member(overrides: Partial<Member> = {}): Member {
  return {
    id: 'm1',
    name: 'Test Member',
    gender: 'Male',
    phone: '+2348000000000',
    email: 'test@example.com',
    status: 'Active',
    absenceCount: 0,
    ...overrides,
  }
}

describe('isYouth', () => {
  it('includes both ends of the age band', () => {
    const youngest = `${NOW.getFullYear() - YOUTH_MIN_AGE}-01-01`
    const oldest = `${NOW.getFullYear() - YOUTH_MAX_AGE}-01-01`
    expect(isYouth({ dob: youngest }, NOW)).toBe(true)
    expect(isYouth({ dob: oldest }, NOW)).toBe(true)
  })

  it('excludes anyone outside it', () => {
    expect(isYouth({ dob: `${NOW.getFullYear() - YOUTH_MIN_AGE + 1}-01-01` }, NOW)).toBe(false)
    expect(isYouth({ dob: `${NOW.getFullYear() - YOUTH_MAX_AGE - 1}-01-01` }, NOW)).toBe(false)
  })

  it('treats an unknown date of birth as not youth rather than guessing', () => {
    expect(isYouth({ dob: undefined }, NOW)).toBe(false)
    expect(isYouth({ dob: '' }, NOW)).toBe(false)
  })
})

describe('hasSchoolingDetails', () => {
  it('is false for a member with nothing recorded', () => {
    expect(hasSchoolingDetails(member())).toBe(false)
  })

  it('is true when any single field is filled in', () => {
    const fields: (keyof Member)[] = [
      'school',
      'department',
      'courseOfStudy',
      'program',
      'level',
      'hallOfResidence',
      'yearOfEntry',
      'yearOfExit',
      'comment',
    ]
    for (const field of fields) {
      expect(hasSchoolingDetails(member({ [field]: 'x' }))).toBe(true)
    }
  })

  /**
   * The reason this helper exists: someone who filled these in at 24 is no longer youth at 36,
   * and the panel must still show what was recorded instead of appearing to have lost it.
   */
  it('keeps details visible for a member who has aged out of the youth band', () => {
    const agedOut = member({ dob: '1980-01-01', school: 'University of Uyo' })
    expect(isYouth(agedOut, NOW)).toBe(false)
    expect(hasSchoolingDetails(agedOut)).toBe(true)
  })
})
