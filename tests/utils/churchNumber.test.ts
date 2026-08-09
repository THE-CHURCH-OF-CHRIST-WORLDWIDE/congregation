import { describe, expect, it } from 'vitest'
import { churchNumberKey, normaliseChurchNumber } from '~/utils/churchNumber'

describe('normaliseChurchNumber', () => {
  it('tidies without changing what was typed', () => {
    expect(normaliseChurchNumber('  COC/001  ')).toBe('COC/001')
    expect(normaliseChurchNumber('COC   001')).toBe('COC 001')
    // Case is the church's business, not ours.
    expect(normaliseChurchNumber('coc/001')).toBe('coc/001')
  })
})

describe('churchNumberKey', () => {
  it('treats cosmetic differences as the same number', () => {
    const key = churchNumberKey('COC/001')
    for (const variant of ['coc/001', 'COC-001', ' coc 001 ', 'COC_001']) {
      expect(churchNumberKey(variant)).toBe(key)
    }
  })

  it('keeps genuinely different numbers apart', () => {
    expect(churchNumberKey('COC/001')).not.toBe(churchNumberKey('COC/002'))
    expect(churchNumberKey('1')).not.toBe(churchNumberKey('01'))
  })

  it('never produces a slash, which Firestore forbids in a document id', () => {
    // The key is used as a document id, so a number like COC/2026/17 must not create subpaths.
    expect(churchNumberKey('COC/2026/17')).toBe('coc-2026-17')
    expect(churchNumberKey('COC/2026/17')).not.toContain('/')
  })

  it('has no leading or trailing separator to collide on', () => {
    // '#001' and '001' are the same number to a human writing it down.
    expect(churchNumberKey('#001#')).toBe('001')
    expect(churchNumberKey('001')).toBe('001')
  })

  it('is empty for a blank number, so nothing gets reserved', () => {
    expect(churchNumberKey('')).toBe('')
    expect(churchNumberKey('   ')).toBe('')
    // Punctuation alone is not a number.
    expect(churchNumberKey('///')).toBe('')
  })
})
