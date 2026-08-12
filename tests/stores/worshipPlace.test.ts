import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAttendanceStore } from '~/stores/attendance'
import type { AttendanceRecord } from '~/types'

vi.mock('~/utils/audit', () => ({ recordAudit: vi.fn() }))

const saveRecords = vi.fn(async (_records: AttendanceRecord[]) => {})
vi.mock('~/repositories/attendanceRepository', () => ({
  attendanceDocId: (r: { serviceType: string; date: string; memberId: string }) =>
    `${r.serviceType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}__${r.date}__${r.memberId}`,
  useAttendanceRepository: () => ({ fetchRecords: async () => [], saveRecords }),
}))

const SERVICE = 'Sunday Worship'
const DATE = '2026-08-09'

describe('where a member worshipped', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('defaults an unqualified mark to the local congregation', () => {
    const store = useAttendanceStore()
    const record = store.setAttendance('m-1', DATE, SERVICE, true)
    expect(record.place).toBe('local')
  })

  it('records another congregation with its certificate details', () => {
    const store = useAttendanceStore()
    const record = store.setAttendance('m-1', DATE, SERVICE, true, {
      place: 'elsewhere',
      congregation: 'Church of Christ, Uyo',
      certificate: true,
      certificateRef: 'signed by Bro. Udo Effiong',
    })

    expect(record).toMatchObject({
      present: true,
      place: 'elsewhere',
      congregation: 'Church of Christ, Uyo',
      certificate: true,
      certificateRef: 'signed by Bro. Udo Effiong',
    })
  })

  it('keeps a reported visit whose certificate has not arrived yet', () => {
    const store = useAttendanceStore()
    const record = store.setAttendance('m-1', DATE, SERVICE, true, {
      place: 'elsewhere',
      congregation: 'Church of Christ, Uyo',
      certificate: false,
    })
    expect(record.certificate).toBe(false)
    // Still an attendance: keeping the Lord's day is not conditional on the paperwork arriving.
    expect(record.present).toBe(true)
  })

  /** A local record carrying a congregation would read as elsewhere to anything reading it back. */
  it('drops congregation and certificate when the answer is local', () => {
    const store = useAttendanceStore()
    const record = store.setAttendance('m-1', DATE, SERVICE, true, {
      place: 'local',
      congregation: 'Church of Christ, Uyo',
      certificate: true,
    })
    expect(record.place).toBe('local')
    expect(record.congregation).toBeUndefined()
    expect(record.certificate).toBeUndefined()
  })

  /**
   * The case that matters most. Un-marking somebody who had worshipped elsewhere must not leave
   * the certificate behind, or the record reads "absent, with a certificate of worship from Uyo".
   */
  it('clears every worship field when the mark is taken away', () => {
    const store = useAttendanceStore()
    store.setAttendance('m-1', DATE, SERVICE, true, {
      place: 'elsewhere',
      congregation: 'Church of Christ, Uyo',
      certificate: true,
      certificateRef: 'ref-1',
    })

    const record = store.setAttendance('m-1', DATE, SERVICE, false)

    expect(record.present).toBe(false)
    expect(record.place).toBeUndefined()
    expect(record.congregation).toBeUndefined()
    expect(record.certificate).toBeUndefined()
    expect(record.certificateRef).toBeUndefined()
  })

  it('replaces the details when a mark is corrected from elsewhere to local', () => {
    const store = useAttendanceStore()
    store.setAttendance('m-1', DATE, SERVICE, true, {
      place: 'elsewhere',
      congregation: 'Church of Christ, Uyo',
      certificate: true,
    })

    const record = store.setAttendance('m-1', DATE, SERVICE, true, { place: 'local' })

    expect(record.place).toBe('local')
    expect(record.congregation).toBeUndefined()
    // One record for one member on one date, not two contradictory ones.
    expect(store.records).toHaveLength(1)
  })

  it('carries the details through a toggle', () => {
    const store = useAttendanceStore()
    const record = store.toggleForMemberDate('m-1', DATE, SERVICE, {
      place: 'elsewhere',
      congregation: 'Church of Christ, Ikot Ekpene',
      certificate: true,
    })
    expect(record).toMatchObject({ present: true, place: 'elsewhere' })
  })

  it('counts an elsewhere attendance as present in the figures', () => {
    const store = useAttendanceStore()
    store.currentService = SERVICE
    store.setAttendance('m-1', DATE, SERVICE, true, {
      place: 'elsewhere',
      congregation: 'Church of Christ, Uyo',
      certificate: true,
    })
    store.setAttendance('m-2', DATE, SERVICE, true)
    store.setAttendance('m-3', DATE, SERVICE, false)

    const summary = store.memberMonthlySummary('m-1', '2026-08', SERVICE)
    expect(summary).toMatchObject({ sessionsTotal: 1, sessionsPresent: 1, percentage: 100 })
  })

  it('sends the cleared fields to the repository so they can be removed on merge', async () => {
    const store = useAttendanceStore()
    store.setAttendance('m-1', DATE, SERVICE, true, {
      place: 'elsewhere',
      congregation: 'Church of Christ, Uyo',
      certificate: true,
    })
    store.setAttendance('m-1', DATE, SERVICE, false)

    await store.saveChanges()

    const written = saveRecords.mock.calls[0]![0]![0]!
    expect(written.present).toBe(false)
    // Present as keys holding `undefined`, which the repository turns into `deleteField()`.
    expect('congregation' in written).toBe(true)
    expect(written.congregation).toBeUndefined()
  })
})
