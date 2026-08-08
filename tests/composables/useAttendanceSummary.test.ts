import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAttendanceSummary } from '~/composables/useAttendanceSummary'
import { useAttendanceStore } from '~/stores/attendance'
import type { AttendanceRecord } from '~/types'

vi.mock('~/repositories/auditRepository', () => ({
  useAuditRepository: () => ({ recordEntry: vi.fn(), fetchEntries: async () => [] }),
}))

const SERVICE = 'Sunday Worship'
const TODAY = new Date('2026-08-05T10:00:00Z')

function record(date: string, present: boolean, memberId = 'm-1'): AttendanceRecord {
  return {
    id: `${date}-${memberId}`,
    memberId,
    serviceId: `${SERVICE}-${date}`,
    date,
    serviceType: SERVICE,
    present,
  }
}

function seed(records: AttendanceRecord[]) {
  useAttendanceStore().records = records
}

describe('useAttendanceSummary', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    seed([])
  })

  /**
   * The bug this replaces: the dashboard printed 75% / 65% / 85% regardless of the data. With no
   * records, every figure must be null so the card can render "—".
   */
  it('reports nothing when no attendance has been recorded', () => {
    const s = useAttendanceSummary(SERVICE, TODAY)

    expect(s.hasData.value).toBe(false)
    expect(s.thisMonthRate.value).toBe(null)
    expect(s.averageWeekly.value).toBe(null)
    expect(s.annualRate.value).toBe(null)
    // No sparkline data either — a flat invented line is still an invention.
    expect(s.rateTrend.value).toBeUndefined()
  })

  it('distinguishes "nothing recorded" from a genuine 0%', () => {
    seed([record('2026-08-02', false), record('2026-08-09', false)])
    const s = useAttendanceSummary(SERVICE, TODAY)

    // Everyone marked absent is a real 0%, not a blank.
    expect(s.thisMonthRate.value).toBe(0)
    expect(s.hasData.value).toBe(true)
  })

  it('computes this month from its own records only', () => {
    seed([
      record('2026-08-02', true),
      record('2026-08-09', true),
      record('2026-08-16', false),
      record('2026-07-05', false), // last month must not drag it down
    ])
    const s = useAttendanceSummary(SERVICE, TODAY)

    expect(s.thisMonthRate.value).toBe(67) // 2 of 3
  })

  it('reports a month-on-month change only when both months have records', () => {
    seed([record('2026-08-02', true), record('2026-08-09', true)])
    expect(useAttendanceSummary(SERVICE, TODAY).monthOnMonthChange.value).toBeUndefined()

    setActivePinia(createPinia())
    seed([
      record('2026-08-02', true),
      record('2026-08-09', true), // 100% this month
      record('2026-07-05', true),
      record('2026-07-12', false), // 50% last month
    ])
    expect(useAttendanceSummary(SERVICE, TODAY).monthOnMonthChange.value).toBe(50)
  })

  it('weights the annual rate by records, not by month', () => {
    seed([
      record('2026-01-04', true),
      record('2026-01-11', true),
      record('2026-01-18', true),
      record('2026-01-25', true), // 4 records, all present
      record('2026-08-02', false), // 1 record, absent
    ])
    const s = useAttendanceSummary(SERVICE, TODAY)

    // 4 of 5 present = 80%. Averaging the two months' rates would wrongly give 50%.
    expect(s.annualRate.value).toBe(80)
  })

  it('excludes other services', () => {
    const store = useAttendanceStore()
    store.records = [
      record('2026-08-02', true),
      {
        id: 'x',
        memberId: 'm-2',
        serviceId: 'Bible Class-2026-08-02',
        date: '2026-08-02',
        serviceType: 'Bible Class',
        present: false,
      },
    ]
    const s = useAttendanceSummary(SERVICE, TODAY)

    expect(s.thisMonthRate.value).toBe(100)
  })

  it('labels the month it is actually reporting on', () => {
    const s = useAttendanceSummary(SERVICE, TODAY)

    expect(s.year).toBe(2026)
    expect(s.monthLabel).toContain('August')
    expect(s.monthLabel).toContain('2026')
  })
})
