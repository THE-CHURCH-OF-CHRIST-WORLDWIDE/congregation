import { describe, expect, it } from 'vitest'
import { fillLegalTokens, toParagraphs } from '~/utils/legalText'

const church = {
  name: 'Church of Christ, Uyo',
  email: 'hello@example.org',
  phone: '+234 800 000 0000',
  address: '14 Oron Road',
}

describe('fillLegalTokens', () => {
  it('replaces every occurrence of each token', () => {
    expect(
      fillLegalTokens('{church} — {church}. Email {email}, call {phone}, visit {address}.', church)
    ).toBe(
      'Church of Christ, Uyo — Church of Christ, Uyo. Email hello@example.org, call +234 800 000 0000, visit 14 Oron Road.'
    )
  })

  it('leaves unknown braces alone', () => {
    expect(fillLegalTokens('{unknown}', church)).toBe('{unknown}')
  })
})

describe('toParagraphs', () => {
  it('splits on blank lines and keeps single line breaks inside a paragraph', () => {
    expect(toParagraphs('One\n• a\n• b\n\n  \n\nTwo\n')).toEqual(['One\n• a\n• b', 'Two'])
  })

  it('returns nothing for empty text', () => {
    expect(toParagraphs('  \n\n ')).toEqual([])
  })
})
