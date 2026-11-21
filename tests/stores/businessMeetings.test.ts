import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBusinessMeetingsStore } from '~/stores/businessMeetings'
import { emptyMeeting, normaliseMeeting } from '~/utils/businessMeetings'
import type { BusinessMeeting, BusinessMeetingDraft } from '~/types/businessMeetings'

/**
 * Minutes are the adopted record of what the church decided, so these pin down that the list on
 * screen is what Firestore accepted, and that approving / reopening write the status they claim.
 */
let stored: BusinessMeeting[] = []
let failNextWrite = false

const createMeeting = vi.fn(async (_m: BusinessMeetingDraft) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  return `bm-${stored.length + 1}`
})
const saveMeeting = vi.fn(async (m: BusinessMeeting) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  stored = [...stored.filter((s) => s.id !== m.id), m]
})
const deleteMeeting = vi.fn(async (id: string) => {
  if (failNextWrite) throw new Error('Missing or insufficient permissions.')
  stored = stored.filter((s) => s.id !== id)
})

vi.mock('~/repositories/businessMeetingsRepository', () => ({
  useBusinessMeetingsRepository: () => ({
    fetchMeetings: async () => stored,
    createMeeting,
    saveMeeting,
    deleteMeeting,
  }),
}))
vi.mock('~/utils/audit', () => ({ recordAudit: vi.fn() }))

const meeting = (id: string, date: string): BusinessMeeting =>
  normaliseMeeting(id, { ...emptyMeeting(date), title: `Meeting ${id}` })

describe('useBusinessMeetingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    stored = []
    failNextWrite = false
    createMeeting.mockClear()
    saveMeeting.mockClear()
    deleteMeeting.mockClear()
  })

  it('creates a meeting and keeps the list newest first', async () => {
    const store = useBusinessMeetingsStore()
    stored = [meeting('a', '2026-01-04')]
    await store.load()
    const created = await store.create(emptyMeeting('2026-03-01'))
    expect(created.id).toBe('bm-2')
    expect(created.createdAt).toBeTruthy()
    expect(store.meetings.map((m) => m.date)).toEqual(['2026-03-01', '2026-01-04'])
  })

  it('leaves no trace when the write is refused', async () => {
    const store = useBusinessMeetingsStore()
    failNextWrite = true
    await expect(store.create(emptyMeeting('2026-03-01'))).rejects.toThrow()
    expect(store.meetings).toHaveLength(0)
  })

  it('approves with the adoption date, and reopening clears it', async () => {
    const store = useBusinessMeetingsStore()
    stored = [meeting('a', '2026-01-04')]
    await store.load()
    const approved = await store.approve(store.meetings[0]!, '2026-02-01')
    expect(approved.status).toBe('approved')
    expect(approved.approvedOn).toBe('2026-02-01')
    expect(saveMeeting).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'approved', approvedOn: '2026-02-01' })
    )
    const reopened = await store.reopen(approved)
    expect(reopened.status).toBe('draft')
    expect(reopened.approvedOn).toBe('')
  })

  it('removes a deleted meeting only once Firestore accepts it', async () => {
    const store = useBusinessMeetingsStore()
    stored = [meeting('a', '2026-01-04')]
    await store.load()
    failNextWrite = true
    await expect(store.remove(store.meetings[0]!)).rejects.toThrow()
    expect(store.meetings).toHaveLength(1)
    failNextWrite = false
    await store.remove(store.meetings[0]!)
    expect(store.meetings).toHaveLength(0)
  })
})
