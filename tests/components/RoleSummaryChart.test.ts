import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import RoleSummaryChart from '~/components/nominal-roll/RoleSummaryChart.vue'
import { useMembersStore } from '~/stores/members'
import type { Member } from '~/types'

vi.mock('~/repositories/membersRepository', () => ({
  useMembersRepository: () => ({ fetchMembers: async () => [] }),
}))
vi.mock('~/repositories/auditRepository', () => ({
  useAuditRepository: () => ({ recordEntry: vi.fn(), fetchEntries: async () => [] }),
}))

function member(id: string, status: Member['status']): Member {
  return { id, name: id, gender: 'Male', phone: '', email: '', status, absenceCount: 0 } as Member
}

function chartWith(members: Member[]) {
  useMembersStore().members = members
  return mount(RoleSummaryChart, { global: { stubs: { Icon: true } } })
}

describe('RoleSummaryChart', () => {
  beforeEach(() => setActivePinia(createPinia()))

  /**
   * A single status covers the whole circle, and an SVG arc whose start and end coincide draws
   * nothing — the chart rendered a legend and a "100%" with no pie at all.
   */
  it('draws a full circle when every member shares one status', () => {
    const wrapper = chartWith([member('a', 'Active')])

    expect(wrapper.find('circle').exists()).toBe(true)
    expect(wrapper.findAll('path')).toHaveLength(0)
    expect(wrapper.text()).toContain('100%')
  })

  it('draws arcs once there is more than one status', () => {
    const wrapper = chartWith([member('a', 'Active'), member('b', 'Weak')])

    expect(wrapper.findAll('path')).toHaveLength(2)
    expect(wrapper.find('circle').exists()).toBe(false)
  })

  it('lists only statuses somebody holds, with counts', () => {
    const wrapper = chartWith([member('a', 'Active'), member('b', 'Active'), member('c', 'Late')])
    const legend = wrapper.findAll('li').map((li) => li.text())

    expect(legend).toHaveLength(2)
    expect(legend.some((l) => l.includes('Active') && l.includes('2'))).toBe(true)
    expect(legend.some((l) => l.includes('Late') && l.includes('1'))).toBe(true)
    // Statuses nobody holds are not listed at all.
    expect(wrapper.text()).not.toContain('Disfellowshipped')
  })

  it('says so when the roll is empty', () => {
    const wrapper = chartWith([])

    expect(wrapper.text()).toContain('No members yet')
    // The empty state deliberately draws a placeholder ring, so assert no *slice* was drawn
    // rather than no circle at all.
    expect(wrapper.findAll('path')).toHaveLength(0)
    expect(wrapper.find('circle').attributes('fill')).toBe('#1e293b')
  })
})
