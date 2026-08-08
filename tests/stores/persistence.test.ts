import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTeachingsStore } from '~/stores/teachings'
import { useEventsStore } from '~/stores/events'
import { useAttendanceStore } from '~/stores/attendance'
import type { AttendanceRecord, Sermon } from '~/types'

/**
 * Teachings, events and attendance all used to keep their data outside Firestore — teachings in a
 * plain array, the other two in localStorage. These pin the contract now that all three write to
 * the database: local state follows what was accepted, and a refused write leaves nothing behind
 * that looks saved.
 */
let failNextWrite = false

vi.mock('~/utils/audit', () => ({ recordAudit: vi.fn() }))

const createSermon = vi.fn(async (s: Omit<Sermon, 'id'>) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  return { ...s, id: 's-1' } as Sermon
})
const deleteSermon = vi.fn(async () => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
})

vi.mock('~/repositories/teachingsRepository', () => ({
  useTeachingsRepository: () => ({
    fetchSermons: async () => [],
    createSermon,
    updateSermon: vi.fn(),
    deleteSermon,
  }),
}))

const createEvent = vi.fn(async (_kind: string, e: Record<string, unknown>) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  return { ...e, id: 'e-1' }
})

vi.mock('~/repositories/eventsRepository', () => ({
  useEventsRepository: () => ({
    fetchEvents: async () => ({ upcoming: [], past: [] }),
    createEvent,
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
  }),
}))

// Typed parameter so the assertion on what was written type-checks.
const saveRecords = vi.fn(async (_records: AttendanceRecord[]) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
})

vi.mock('~/repositories/attendanceRepository', () => ({
  attendanceDocId: (r: { serviceType: string; date: string; memberId: string }) =>
    `${r.serviceType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}__${r.date}__${r.memberId}`,
  useAttendanceRepository: () => ({ fetchRecords: async () => [], saveRecords }),
}))

const sermon = {
  type: 'Sermon',
  date: '2026-08-02',
  preacher: 'A',
  topic: 'Faith',
  scripture: '',
  description: '',
  categories: [],
} as unknown as Omit<Sermon, 'id' | 'createdAt'>

describe('teachings persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    failNextWrite = false
    createSermon.mockClear()
    deleteSermon.mockClear()
  })

  it('keeps the id Firestore generated', async () => {
    const store = useTeachingsStore()
    await store.uploadSermon(sermon)

    expect(store.sermons[0]!.id).toBe('s-1')
  })

  it('shows nothing when the upload is refused', async () => {
    const store = useTeachingsStore()
    failNextWrite = true

    await expect(store.uploadSermon(sermon)).rejects.toThrow()

    expect(store.sermons).toHaveLength(0)
    expect(store.uploading).toBe(false)
  })

  it('keeps the sermon when the delete is refused', async () => {
    const store = useTeachingsStore()
    await store.uploadSermon(sermon)
    failNextWrite = true

    await expect(store.deleteSermon('s-1')).rejects.toThrow()

    expect(store.sermons).toHaveLength(1)
  })
})

describe('events persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    failNextWrite = false
    createEvent.mockClear()
  })

  it('records an upcoming event with the stored id', async () => {
    const store = useEventsStore()
    await store.addUpcomingEvent({ title: 'Convention' } as never)

    expect(store.upcomingEvents[0]!.id).toBe('e-1')
  })

  it('shows nothing when the write is refused', async () => {
    const store = useEventsStore()
    failNextWrite = true

    await expect(store.addUpcomingEvent({ title: 'Convention' } as never)).rejects.toThrow()

    expect(store.upcomingEvents).toHaveLength(0)
  })
})

describe('attendance persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    failNextWrite = false
    saveRecords.mockClear()
  })

  it('gives one member/date/service a stable id, so re-marking updates rather than duplicates', () => {
    const store = useAttendanceStore()
    store.setAttendance('m-1', '2026-08-02', 'Sunday Worship', true)
    store.setAttendance('m-1', '2026-08-02', 'Sunday Worship', false)

    expect(store.records).toHaveLength(1)
    expect(store.records[0]!.id).toBe('sunday-worship__2026-08-02__m-1')
  })

  it('writes only what changed, then clears the pending marks', async () => {
    const store = useAttendanceStore()
    store.setAttendance('m-1', '2026-08-02', 'Sunday Worship', true)
    expect(store.hasPendingChanges).toBe(true)

    await store.saveChanges()

    expect(saveRecords).toHaveBeenCalledOnce()
    expect(saveRecords.mock.calls[0]![0]).toHaveLength(1)
    expect(store.hasPendingChanges).toBe(false)
  })

  it('keeps the marks pending when the save is refused', async () => {
    const store = useAttendanceStore()
    store.setAttendance('m-1', '2026-08-02', 'Sunday Worship', true)
    failNextWrite = true

    await expect(store.saveChanges()).rejects.toThrow()

    // Clearing these would make a refused register look saved.
    expect(store.hasPendingChanges).toBe(true)
    expect(store.saving).toBe(false)
  })

  it('does not write when there is nothing pending', async () => {
    const store = useAttendanceStore()
    await store.saveChanges()

    expect(saveRecords).not.toHaveBeenCalled()
  })
})
