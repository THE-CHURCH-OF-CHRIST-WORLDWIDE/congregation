import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAttendanceStore } from '~/stores/attendance'
import type { AttendanceRecord } from '~/types'

vi.mock('~/repositories/auditRepository', () => ({
  useAuditRepository: () => ({ recordEntry: vi.fn(), fetchEntries: async () => [] }),
}))

const SERVICE = 'Sunday Worship'

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

/**
 * The whole point of the rolling window: on 1 January a calendar-year chart empties and a year of
 * history becomes unreachable. These fix "today" to mid-January so the window straddles two years.
 */
describe('rollingMonthsByService across a year boundary', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2027-01-15T09:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('ends on the current month and reaches back a full year', () => {
    const months = useAttendanceStore().rollingMonthsByService(SERVICE)

    expect(months).toHaveLength(12)
    expect(months.at(-1)!.month).toBe('2027-01')
    expect(months[0]!.month).toBe('2026-02')
  })

  it('still shows last year’s records in January', () => {
    const store = useAttendanceStore()
    store.records = [record('2026-12-06', true), record('2026-12-13', false)]

    const months = store.rollingMonthsByService(SERVICE)
    const december = months.find((m) => m.month === '2026-12')!

    // A calendar-year chart would have dropped these on 1 January.
    expect(december.sessions).toBe(2)
    expect(december.present).toBe(1)
    expect(december.rate).toBe(50)
  })

  it('marks the year on January so a two-year window is not ambiguous', () => {
    const months = useAttendanceStore().rollingMonthsByService(SERVICE)
    const labels = months.map((m) => m.label)

    expect(labels.at(-1)).toBe('Jan 27')
    // The first bucket is labelled too, so the window's start is readable.
    expect(labels[0]).toMatch(/Feb 26/)
    // Ordinary months stay short.
    expect(labels).toContain('Jun')
  })

  it('counts only the requested service', () => {
    const store = useAttendanceStore()
    store.records = [
      record('2027-01-03', true),
      {
        id: 'x',
        memberId: 'm-2',
        serviceId: 'Bible Class-2027-01-07',
        date: '2027-01-07',
        serviceType: 'Bible Class',
        present: true,
      },
    ]

    const january = store.rollingMonthsByService(SERVICE).at(-1)!
    expect(january.sessions).toBe(1)
    expect(january.total).toBe(1)
  })

  it('reports zero, not NaN, for a month with nothing recorded', () => {
    const months = useAttendanceStore().rollingMonthsByService(SERVICE)

    expect(months.every((m) => m.rate === 0)).toBe(true)
    expect(months.every((m) => Number.isFinite(m.rate))).toBe(true)
  })
})
