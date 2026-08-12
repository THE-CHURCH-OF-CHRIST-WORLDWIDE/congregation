import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AttendanceTable from '~/components/attendance/AttendanceTable.vue'
import { useAttendanceStore } from '~/stores/attendance'
import { useMembersStore } from '~/stores/members'
import type { Member } from '~/types'

vi.mock('~/utils/audit', () => ({ recordAudit: vi.fn() }))

vi.mock('~/repositories/attendanceRepository', () => ({
  attendanceDocId: (r: { serviceType: string; date: string; memberId: string }) =>
    `${r.serviceType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}__${r.date}__${r.memberId}`,
  useAttendanceRepository: () => ({ fetchRecords: async () => [], saveRecords: vi.fn() }),
}))

vi.mock('~/repositories/membersRepository', () => ({
  useMembersRepository: () => ({
    fetchMembers: async () => [],
    createMember: vi.fn(),
    updateMember: vi.fn(),
    deleteMember: vi.fn(),
  }),
}))

const stubs = {
  Card: { template: '<div><slot /></div>' },
  Icon: true,
  Avatar: true,
  Badge: { template: '<span><slot /></span>' },
  Button: { template: '<button><slot /></button>' },
  Pagination: true,
  LoadingState: { template: '<div />' },
  EmptyState: { template: '<div />' },
  // Rendered inline so its emits can be driven directly. Named, so `findComponent` can locate it.
  WorshipPlaceModal: {
    name: 'WorshipPlaceModal',
    props: ['modelValue', 'subject', 'scopeNote'],
    emits: ['confirm', 'cancel', 'update:modelValue'],
    template: '<div class="worship-modal" :data-open="modelValue" :data-subject="subject" />',
  },
}

/** August 2026 — Sundays fall on the 2nd, 9th, 16th, 23rd and 30th. */
const MONTH = '2026-08'
const SERVICE = 'Sunday Worship'

function member(): Member {
  return {
    id: 'm-1',
    name: 'Grace Etim',
    gender: 'Female',
    phone: '+2348030000000',
    email: 'grace@example.com',
    status: 'Active',
    absenceCount: 0,
  }
}

function render() {
  useMembersStore().members = [member()]
  return mount(AttendanceTable, {
    props: { serviceType: SERVICE, month: MONTH, dayOfWeek: 0 },
    global: { stubs },
  })
}

const boxes = (w: ReturnType<typeof render>) => w.findAll('input[type="checkbox"].attendance-check')
const modal = (w: ReturnType<typeof render>) => w.find('.worship-modal')

describe('AttendanceTable — asking where a member worshipped', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('asks before recording a tick, naming who and which service', async () => {
    const w = render()
    const store = useAttendanceStore()

    await boxes(w)[0]!.setValue(true)
    await flushPromises()

    expect(modal(w).attributes('data-open')).toBe('true')
    expect(modal(w).attributes('data-subject')).toContain('Grace Etim')
    // Nothing recorded until the question is answered.
    expect(store.records).toHaveLength(0)
  })

  it('records the answer against the ticked date', async () => {
    const w = render()
    const store = useAttendanceStore()

    await boxes(w)[0]!.setValue(true)
    await flushPromises()

    await w.findComponent({ name: 'WorshipPlaceModal' }).vm.$emit('confirm', {
      place: 'elsewhere',
      congregation: 'Church of Christ, Uyo',
      certificate: true,
    })
    await flushPromises()

    expect(store.records).toHaveLength(1)
    expect(store.records[0]).toMatchObject({
      memberId: 'm-1',
      present: true,
      place: 'elsewhere',
      congregation: 'Church of Christ, Uyo',
    })
  })

  /**
   * The box is bound with `:checked`, not `v-model`, so the browser has already drawn it ticked
   * while the store still says absent. Declining has to put it back or it sits there ticked and
   * unsaved, claiming an attendance that was never recorded.
   */
  it('puts the tick back when the question is declined', async () => {
    const w = render()
    const store = useAttendanceStore()
    const box = boxes(w)[0]!

    await box.setValue(true)
    await flushPromises()
    expect((box.element as HTMLInputElement).checked).toBe(true)

    await w.findComponent({ name: 'WorshipPlaceModal' }).vm.$emit('cancel')
    await flushPromises()

    expect((box.element as HTMLInputElement).checked).toBe(false)
    expect(store.records).toHaveLength(0)
  })

  it('un-marking needs no dialog, and clears the worship details', async () => {
    const w = render()
    const store = useAttendanceStore()
    const box = boxes(w)[0]!

    // Mark present elsewhere first.
    await box.setValue(true)
    await flushPromises()
    await w.findComponent({ name: 'WorshipPlaceModal' }).vm.$emit('confirm', {
      place: 'elsewhere',
      congregation: 'Church of Christ, Uyo',
      certificate: true,
    })
    await flushPromises()

    await box.setValue(false)
    await flushPromises()

    // No second question — taking a mark away says nothing about where anybody worshipped.
    expect(modal(w).attributes('data-open')).toBe('false')
    expect(store.records[0]).toMatchObject({ present: false })
    expect(store.records[0]!.congregation).toBeUndefined()
  })

  it('shows a certificate marker on a tick earned elsewhere', async () => {
    const w = render()

    await boxes(w)[0]!.setValue(true)
    await flushPromises()
    await w.findComponent({ name: 'WorshipPlaceModal' }).vm.$emit('confirm', {
      place: 'elsewhere',
      congregation: 'Church of Christ, Uyo',
      certificate: true,
    })
    await flushPromises()

    // A local tick renders no marker; this one must, or the distinction is invisible.
    expect(w.html()).toContain('certificate-outline')
  })
})
