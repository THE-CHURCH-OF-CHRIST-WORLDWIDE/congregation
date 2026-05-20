import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMembersStore } from '~/stores/members'
import type { Member } from '~/types'

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

  it('flags members with 3+ absences as backsliders', () => {
    const store = useMembersStore()
    store.members = [
      makeMember({ id: '1', absenceCount: 0 }),
      makeMember({ id: '2', absenceCount: 3 }),
      makeMember({ id: '3', absenceCount: 7 }),
    ]
    expect(store.backsliders.map((m) => m.id)).toEqual(['2', '3'])
  })

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

  it('addMember, updateMember, and deleteMember mutate state as expected', () => {
    const store = useMembersStore()
    store.addMember({
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

    store.updateMember(id, { name: 'Renamed' })
    expect(store.members[0]!.name).toBe('Renamed')

    store.deleteMember(id)
    expect(store.members).toEqual([])
  })
})
