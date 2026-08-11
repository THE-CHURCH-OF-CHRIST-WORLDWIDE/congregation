import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAbsenceTracking, resetAbsenceSyncGuard } from '~/composables/useAbsenceTracking'
import { useMembersStore } from '~/stores/members'
import { useAttendanceStore } from '~/stores/attendance'
import type { AttendanceRecord, Member } from '~/types'

vi.mock('~/utils/audit', () => ({ recordAudit: vi.fn() }))

const updateMember = vi.fn(async () => {})
vi.mock('~/repositories/membersRepository', () => ({
  useMembersRepository: () => ({
    fetchMembers: async () => [],
    createMember: vi.fn(),
    updateMember,
    deleteMember: vi.fn(),
  }),
}))

const fetchRecords = vi.fn(async (): Promise<AttendanceRecord[]> => [])
vi.mock('~/repositories/attendanceRepository', () => ({
  attendanceDocId: (r: { serviceType: string; date: string; memberId: string }) =>
    `${r.serviceType}__${r.date}__${r.memberId}`,
  useAttendanceRepository: () => ({ fetchRecords, saveRecords: vi.fn() }),
}))

function makeMember(overrides: Partial<Member> = {}): Member {
  return {
    id: 'm1',
    name: 'Test Member',
    gender: 'Male',
    phone: '+2348030000000',
    email: 'test@example.com',
    status: 'Active',
    absenceCount: 0,
    ...overrides,
  }
}

function rec(memberId: string, date: string, present: boolean): AttendanceRecord {
  return {
    id: `${memberId}-${date}`,
    memberId,
    serviceId: 'sid',
    date,
    present,
    serviceType: 'Sunday Worship',
  }
}

/** Four Sundays of register, most recent last. */
const SUNDAYS = ['2026-01-04', '2026-01-11', '2026-01-18', '2026-01-25']

describe('useAbsenceTracking', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    resetAbsenceSyncGuard()
  })

  it('counts consecutive absences off the register rather than absenceCount', () => {
    const members = useMembersStore()
    const attendance = useAttendanceStore()

    // `absenceCount` deliberately lies: the derived streak must ignore it entirely.
    members.members = [
      makeMember({ id: 'away', absenceCount: 99 }),
      makeMember({ id: 'here', absenceCount: 99 }),
    ]
    attendance.records = SUNDAYS.flatMap((d) => [rec('here', d, true), rec('away', d, false)])

    const { absencesFor } = useAbsenceTracking()
    expect(absencesFor('away')).toBe(4)
    expect(absencesFor('here')).toBe(0)
  })

  it('reports zero for a member with no id in the register', () => {
    useMembersStore().members = [makeMember({ id: 'ghost' })]
    const { absencesFor } = useAbsenceTracking()
    expect(absencesFor('ghost')).toBe(0)
    expect(absencesFor('not-on-the-roll')).toBe(0)
  })

  it('lists backsliders past the threshold, longest absence first', () => {
    const members = useMembersStore()
    const attendance = useAttendanceStore()
    members.members = [
      makeMember({ id: 'two', name: 'Missed Two' }),
      makeMember({ id: 'four', name: 'Missed Four' }),
      makeMember({ id: 'three', name: 'Missed Three' }),
      makeMember({ id: 'none', name: 'Never Missed' }),
    ]
    attendance.records = [
      ...SUNDAYS.map((d) => rec('none', d, true)),
      // Present early on, then away for a run of increasing length.
      rec('two', '2026-01-04', true),
      rec('two', '2026-01-11', true),
      rec('three', '2026-01-04', true),
      rec('four', '2026-01-04', false),
    ]

    const { backsliders } = useAbsenceTracking()
    // 'two' misses only the last two, so falls short of the threshold of 3.
    expect(backsliders.value.map((m) => m.id)).toEqual(['four', 'three'])
  })

  describe('syncStatuses', () => {
    it('applies the labels the stored register implies', async () => {
      const members = useMembersStore()
      const attendance = useAttendanceStore()
      members.members = [makeMember({ id: 'away', name: 'Away' })]
      members.loaded = true
      attendance.records = [rec('other', '2026-01-25', true), rec('other', '2026-01-18', true)]
      attendance.loaded = true

      const { syncStatuses } = useAbsenceTracking()
      const applied = await syncStatuses()

      expect(applied.map((u) => [u.id, u.to])).toEqual([['away', 'Inactive']])
      expect(updateMember).toHaveBeenCalledExactlyOnceWith('away', { status: 'Inactive' })
    })

    /**
     * Navigating between admin pages re-runs the layout's mount hook. Without the guard each
     * navigation would re-issue the same writes.
     */
    it('runs once per session, and again only when forced', async () => {
      const members = useMembersStore()
      const attendance = useAttendanceStore()
      members.members = [makeMember({ id: 'away' })]
      members.loaded = true
      attendance.records = [rec('other', '2026-01-25', true), rec('other', '2026-01-18', true)]
      attendance.loaded = true

      const { syncStatuses } = useAbsenceTracking()
      await syncStatuses()
      expect(updateMember).toHaveBeenCalledOnce()

      // Second call is a no-op even though the roll now needs no change anyway.
      await syncStatuses()
      expect(updateMember).toHaveBeenCalledOnce()

      // Put the member back to Active so a forced run has something to do.
      members.members = [makeMember({ id: 'away' })]
      await syncStatuses(true)
      expect(updateMember).toHaveBeenCalledTimes(2)
    })

    it('swallows a failure rather than surfacing it on page load', async () => {
      const members = useMembersStore()
      members.loaded = true
      useAttendanceStore().loaded = true
      vi.spyOn(members, 'syncAttendanceStatuses').mockRejectedValue(new Error('offline'))

      const { syncStatuses } = useAbsenceTracking()
      await expect(syncStatuses()).resolves.toEqual([])
    })

    /**
     * It must neither load anything itself nor spend the once-per-session guard before the data is
     * there — a page mounts with both loads still in flight, and a sync that gave up permanently
     * at that moment would never run at all.
     */
    it('does nothing until both datasets are in memory, and stays armed', async () => {
      const members = useMembersStore()
      const attendance = useAttendanceStore()
      members.members = [makeMember({ id: 'away' })]
      attendance.records = [rec('other', '2026-01-25', true), rec('other', '2026-01-18', true)]

      const { syncStatuses } = useAbsenceTracking()

      members.loaded = false
      attendance.loaded = true
      expect(await syncStatuses()).toEqual([])

      members.loaded = true
      attendance.loaded = false
      expect(await syncStatuses()).toEqual([])

      expect(updateMember).not.toHaveBeenCalled()
      expect(fetchRecords).not.toHaveBeenCalled()

      // Still armed once the data lands.
      attendance.loaded = true
      expect((await syncStatuses()).map((u) => u.to)).toEqual(['Inactive'])
    })
  })
})
