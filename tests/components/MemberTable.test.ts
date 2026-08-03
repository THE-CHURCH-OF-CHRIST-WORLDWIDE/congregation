import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MemberTable from '~/components/nominal-roll/MemberTable.vue'
import type { Member } from '~/types'

vi.mock('~/repositories/membersRepository', () => ({
  useMembersRepository: () => ({
    fetchMembers: vi.fn(async () => []),
    createMember: vi.fn(),
    updateMember: vi.fn(),
    deleteMember: vi.fn(),
  }),
}))

function members(n: number): Member[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `m-${i + 1}`,
    name: `Member ${String(i + 1).padStart(2, '0')}`,
    gender: i % 2 ? 'Female' : 'Male',
    phone: '+2348000000000',
    email: `m${i + 1}@example.com`,
    status: 'Active',
    absenceCount: 0,
    dob: '1990-01-01',
  })) as Member[]
}

const stubs = {
  Card: { template: '<div><slot /></div>' },
  Avatar: true,
  Badge: { template: '<span><slot /></span>' },
  Icon: true,
  EmptyState: { props: ['title'], template: '<div class="empty">{{ title }}</div>' },
  LoadingState: { template: '<div class="loading">loading</div>' },
}

/** Rows that carry member data (the empty/loading row has no <td> count of 7). */
const dataRows = (w: ReturnType<typeof mount>) =>
  w.findAll('tbody tr').filter((r) => r.findAll('td').length > 1)

describe('MemberTable pagination', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('shows only the first page and a pager for the rest', () => {
    const wrapper = mount(MemberTable, { props: { items: members(47) }, global: { stubs } })

    expect(dataRows(wrapper)).toHaveLength(10)
    expect(wrapper.text()).toContain('Member 01')
    expect(wrapper.text()).not.toContain('Member 11')
    expect(wrapper.text()).toContain('Showing 1–10 of 47 members')
  })

  it('advances to the next page and renumbers rows continuously', async () => {
    const wrapper = mount(MemberTable, { props: { items: members(47) }, global: { stubs } })

    await wrapper
      .find('nav[aria-label="Pagination"] button[aria-label="Next page"]')
      .trigger('click')

    expect(wrapper.text()).toContain('Member 11')
    expect(wrapper.text()).not.toContain('Member 01')
    expect(wrapper.text()).toContain('Showing 11–20 of 47 members')
    // S/N continues across pages rather than restarting at 1.
    expect(dataRows(wrapper)[0]!.findAll('td')[0]!.text()).toBe('11')
  })

  it('jumps to the last page, which holds the remainder', async () => {
    const wrapper = mount(MemberTable, { props: { items: members(47) }, global: { stubs } })

    await wrapper.find('nav[aria-label="Pagination"] button[aria-label="Page 5"]').trigger('click')

    expect(dataRows(wrapper)).toHaveLength(7)
    expect(wrapper.text()).toContain('Showing 41–47 of 47 members')
  })

  it('hides the pager when everything fits on one page', () => {
    const wrapper = mount(MemberTable, { props: { items: members(6) }, global: { stubs } })

    expect(dataRows(wrapper)).toHaveLength(6)
    expect(wrapper.find('nav[aria-label="Pagination"]').exists()).toBe(false)
  })

  it('returns to page 1 when the list changes underneath', async () => {
    const wrapper = mount(MemberTable, { props: { items: members(47) }, global: { stubs } })
    await wrapper.find('nav[aria-label="Pagination"] button[aria-label="Page 4"]').trigger('click')
    expect(wrapper.text()).toContain('Showing 31–40')

    await wrapper.setProps({ items: members(12) })

    expect(wrapper.text()).toContain('Showing 1–10 of 12 members')
  })

  it('falls back to the empty state with no members', () => {
    const wrapper = mount(MemberTable, { props: { items: [] }, global: { stubs } })

    expect(dataRows(wrapper)).toHaveLength(0)
    expect(wrapper.find('.empty').text()).toBe('No members yet')
  })
})
