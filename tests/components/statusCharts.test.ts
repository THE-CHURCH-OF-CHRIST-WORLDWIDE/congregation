import { describe, expect, it } from 'vitest'
import { MEMBER_STATUSES } from '~/constants'
import { readFileSync } from 'node:fs'

/**
 * Both status charts used to hand-write their buckets and silently omitted statuses —
 * Disfellowshipped members were missing from the role chart entirely, and the youth donut
 * dropped three of the eight. Driving them off MEMBER_STATUSES is what prevents that, so this
 * asserts they still do rather than re-listing the statuses here (which would reintroduce the
 * exact duplication that caused the bug).
 */
describe('status charts cover every member status', () => {
  const sources = {
    'youth donut': 'pages/admin/youth/index.vue',
    'role summary chart': 'components/nominal-roll/RoleSummaryChart.vue',
  }

  for (const [name, file] of Object.entries(sources)) {
    it(`${name} derives its buckets from MEMBER_STATUSES`, () => {
      const src = readFileSync(file, 'utf8')
      expect(src).toContain("import { MEMBER_STATUSES } from '~/constants'")
      expect(src).toMatch(/MEMBER_STATUSES\.map\(/)
    })

    it(`${name} gives every status a colour`, () => {
      const src = readFileSync(file, 'utf8')
      const block = src.slice(
        src.indexOf('STATUS_COLORS'),
        src.indexOf('}', src.indexOf('STATUS_COLORS'))
      )
      for (const status of MEMBER_STATUSES) {
        expect(block).toContain(status)
      }
    })
  }
})
