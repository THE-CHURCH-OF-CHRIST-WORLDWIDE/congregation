import { describe, expect, it } from 'vitest'
import { useImportCsv } from '~/composables/useImportCsv'

const { parse } = useImportCsv()

/** Every row needs a name and phone, or it is rejected before the schooling columns matter. */
const REQUIRED = 'Name,Phone'
const REQUIRED_VALUES = 'Grace Etim,+2348030000000'

describe('useImportCsv — schooling columns', () => {
  it('maps the canonical headers', () => {
    const { rows } = parse(
      `${REQUIRED},School,Department,Course of Study,Programme,Level,Hall of Residence,Year of Entry,Year of Exit,Comment\n` +
        `${REQUIRED_VALUES},University of Uyo,Microbiology,Industrial Microbiology,Bachelor's,300,Akpan Isemin Hall,2023,2027,Leads the choir`
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      school: 'University of Uyo',
      department: 'Microbiology',
      courseOfStudy: 'Industrial Microbiology',
      program: "Bachelor's",
      level: '300',
      hallOfResidence: 'Akpan Isemin Hall',
      yearOfEntry: '2023',
      yearOfExit: '2027',
      comment: 'Leads the choir',
      valid: true,
    })
  })

  /**
   * These sheets are kept by hand, so the same column arrives under whichever name the secretary
   * happened to type. Aliases are the whole point of the header map.
   */
  it('accepts the aliases and ignores case, spacing and punctuation', () => {
    const { rows } = parse(
      `${REQUIRED},institution,dept,course,degree,year of study,hostel,Year_Of_Admission,year-of-graduation,Remarks\n` +
        `${REQUIRED_VALUES},Uniuyo,Physics,Geophysics,HND,200,Hall 3,2022,2026,Transferred in`
    )

    expect(rows[0]).toMatchObject({
      school: 'Uniuyo',
      department: 'Physics',
      courseOfStudy: 'Geophysics',
      program: 'HND',
      level: '200',
      hallOfResidence: 'Hall 3',
      yearOfEntry: '2022',
      yearOfExit: '2026',
      comment: 'Transferred in',
    })
  })

  it('leaves absent schooling columns blank rather than undefined', () => {
    const { rows } = parse(`${REQUIRED}\n${REQUIRED_VALUES}`)
    expect(rows[0]).toMatchObject({ school: '', level: '', comment: '' })
  })

  it('flags a backwards year range without rejecting the row', () => {
    const { rows } = parse(`${REQUIRED},Year of Entry,Year of Exit\n${REQUIRED_VALUES},2027,2023`)
    expect(rows[0]!.errors).toContain('Year of exit is before year of entry')
    // Still importable — the rest of the record is usable and the warning is visible in the preview.
    expect(rows[0]!.valid).toBe(true)
  })

  it('does not flag a student with no exit year yet', () => {
    const { rows } = parse(`${REQUIRED},Year of Entry\n${REQUIRED_VALUES},2023`)
    expect(rows[0]!.errors).toEqual([])
  })
})
