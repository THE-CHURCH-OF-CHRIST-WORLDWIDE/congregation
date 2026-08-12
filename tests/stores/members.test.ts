import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMembersStore } from '~/stores/members'
import type { Member } from '~/types'

// The store now persists through Firestore; stub the repository so these tests
// cover store behaviour rather than the network.
const repo = {
  fetchMembers: vi.fn(async (): Promise<Member[]> => []),
  createMember: vi.fn(
    async (m: Omit<Member, 'id'>): Promise<Member> => ({ ...m, id: 'generated' })
  ),
  updateMember: vi.fn(async () => {}),
  deleteMember: vi.fn(async () => {}),
}
vi.mock('~/repositories/membersRepository', () => ({
  useMembersRepository: () => repo,
}))

function makeMember(overrides: Partial<Member> = {}): Member {
  return {
    id: overrides.id ?? String(Math.random()),
    name: 'Test Member',
    email: 'test@example.com',
    phone: '+1234567890',
    gender: 'Male',
    status: 'Active',
    absenceCount: 0,
    dob: '1990-01-01',
    ...overrides,
  } as Member
}

describe('useMembersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts with an empty member list and default filters', () => {
    const store = useMembersStore()
    expect(store.members).toEqual([])
    expect(store.filters.tab).toBe('all')
    expect(store.filteredMembers).toEqual([])
  })

  it('hides Late members from the default "all" tab', () => {
    const store = useMembersStore()
    store.members = [
      makeMember({ id: 'a', name: 'Active One', status: 'Active' }),
      makeMember({ id: 'b', name: 'Late One', status: 'Late' }),
    ]
    expect(store.filteredMembers.map((m) => m.id)).toEqual(['a'])
  })

  it('shows Late members when the "late" tab is selected', () => {
    const store = useMembersStore()
    store.members = [
      makeMember({ id: 'a', status: 'Active' }),
      makeMember({ id: 'b', status: 'Late' }),
    ]
    store.setFilter({ tab: 'late' })
    expect(store.filteredMembers.map((m) => m.id)).toEqual(['b'])
  })

  it('filters brothers/sisters tabs by gender and hides Late', () => {
    const store = useMembersStore()
    store.members = [
      makeMember({ id: 'm1', gender: 'Male', status: 'Active' }),
      makeMember({ id: 'f1', gender: 'Female', status: 'Active' }),
      makeMember({ id: 'm2', gender: 'Male', status: 'Late' }),
    ]
    store.setFilter({ tab: 'brothers' })
    expect(store.filteredMembers.map((m) => m.id)).toEqual(['m1'])
    store.setFilter({ tab: 'sisters' })
    expect(store.filteredMembers.map((m) => m.id)).toEqual(['f1'])
  })

  it('matches search across name, email, and phone (case-insensitive)', () => {
    const store = useMembersStore()
    store.members = [
      makeMember({ id: '1', name: 'Alice Akpan', email: 'alice@x.com', phone: '+2348011112222' }),
      makeMember({ id: '2', name: 'Bola Bright', email: 'bola@x.com', phone: '+2348033334444' }),
    ]
    store.setFilter({ search: 'ALICE' })
    expect(store.filteredMembers.map((m) => m.id)).toEqual(['1'])
    store.setFilter({ search: '3334444' })
    expect(store.filteredMembers.map((m) => m.id)).toEqual(['2'])
  })

  // Backsliders used to be `absenceCount >= 3` on the member record — a field nothing ever wrote
  // to, so the list was always empty. They are derived from the register now; see
  // tests/composables/useAbsenceTracking.test.ts.

  it('classifies members aged 13–35 as youth', () => {
    const store = useMembersStore()
    const year = new Date().getFullYear()
    store.members = [
      makeMember({ id: 'kid', dob: `${year - 10}-01-01` }),
      makeMember({ id: 'teen', dob: `${year - 15}-01-01` }),
      makeMember({ id: 'adult', dob: `${year - 30}-01-01` }),
      makeMember({ id: 'senior', dob: `${year - 50}-01-01` }),
    ]
    expect(store.youthMembers.map((m) => m.id).sort()).toEqual(['adult', 'teen'])
  })

  it('addMember, updateMember, and deleteMember mutate state as expected', async () => {
    const store = useMembersStore()
    await store.addMember({
      name: 'New Person',
      email: 'new@x.com',
      phone: '+1',
      gender: 'Female',
      status: 'Active',
      absenceCount: 0,
      dob: '2000-01-01',
    } as Omit<Member, 'id'>)
    expect(store.members).toHaveLength(1)
    const id = store.members[0]!.id
    expect(repo.createMember).toHaveBeenCalledOnce()

    await store.updateMember(id, { name: 'Renamed' })
    expect(store.members[0]!.name).toBe('Renamed')
    expect(repo.updateMember).toHaveBeenCalledWith(id, { name: 'Renamed' })

    await store.deleteMember(id)
    expect(store.members).toEqual([])
    expect(repo.deleteMember).toHaveBeenCalledWith(id)
  })

  it('load() pulls the roll from the repository and only fetches once', async () => {
    repo.fetchMembers.mockResolvedValueOnce([makeMember({ id: 'remote', name: 'From Firestore' })])
    const store = useMembersStore()

    await store.load()
    expect(store.members.map((m) => m.id)).toEqual(['remote'])

    await store.load()
    expect(repo.fetchMembers).toHaveBeenCalledOnce()
  })

  it('leaves local state untouched when a write fails', async () => {
    repo.createMember.mockRejectedValueOnce(new Error('offline'))
    const store = useMembersStore()

    await expect(store.addMember(makeMember())).rejects.toThrow('offline')
    expect(store.members).toEqual([])
    expect(store.error).toBe('offline')
  })

  describe('syncAttendanceStatuses', () => {
    const sunday = (memberId: string, date: string, present: boolean) => ({
      id: `${memberId}-${date}`,
      memberId,
      serviceId: 'sid',
      date,
      present,
      serviceType: 'Sunday Worship',
    })

    it('writes the labels the register implies and updates local state', async () => {
      const store = useMembersStore()
      store.members = [
        makeMember({ id: 'away', name: 'Away', status: 'Active' }),
        makeMember({ id: 'here', name: 'Here', status: 'Active' }),
      ]

      const applied = await store.syncAttendanceStatuses([
        sunday('here', '2026-01-18', true),
        sunday('here', '2026-01-11', true),
      ])

      expect(applied.map((u) => [u.id, u.to])).toEqual([['away', 'Inactive']])
      expect(repo.updateMember).toHaveBeenCalledExactlyOnceWith('away', { status: 'Inactive' })
      expect(store.members.find((m) => m.id === 'away')!.status).toBe('Inactive')
      expect(store.members.find((m) => m.id === 'here')!.status).toBe('Active')
    })

    it('writes nothing when the register implies no change', async () => {
      const store = useMembersStore()
      store.members = [makeMember({ id: 'here', status: 'Active' })]

      const applied = await store.syncAttendanceStatuses([sunday('here', '2026-01-18', true)])

      expect(applied).toEqual([])
      expect(repo.updateMember).not.toHaveBeenCalled()
    })

    /**
     * This runs after a register has already saved successfully, so a failure here must not
     * surface — and must not stop the rest of the roll being relabelled.
     */
    it('carries on past a failed write and leaves that member as they were', async () => {
      repo.updateMember.mockRejectedValueOnce(new Error('offline'))
      const store = useMembersStore()
      store.members = [
        makeMember({ id: 'first', name: 'First', status: 'Active' }),
        makeMember({ id: 'second', name: 'Second', status: 'Active' }),
      ]

      const applied = await store.syncAttendanceStatuses([
        sunday('other', '2026-01-18', true),
        sunday('other', '2026-01-11', true),
      ])

      expect(applied.map((u) => u.id)).toEqual(['second'])
      expect(store.members.find((m) => m.id === 'first')!.status).toBe('Active')
      expect(store.members.find((m) => m.id === 'second')!.status).toBe('Inactive')
    })
  })
})
