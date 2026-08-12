import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useMessagesStore } from '~/stores/messages'
import type { ContactMessage } from '~/types'

/**
 * The contact form used to fake its own success — a 900ms timer, then "Message Sent!", with
 * nothing written anywhere. So the thing worth pinning down is that a failed send is reported
 * as a failure, and that the inbox's state never claims more than Firestore accepted.
 */
let failWrite = false
const createMessage = vi.fn(async () => {
  if (failWrite) throw new Error('Missing or insufficient permissions.')
})
const updateMessage = vi.fn(async () => {
  if (failWrite) throw new Error('Missing or insufficient permissions.')
})
const deleteMessage = vi.fn(async () => {
  if (failWrite) throw new Error('Missing or insufficient permissions.')
})

vi.mock('~/repositories/messagesRepository', () => ({
  useMessagesRepository: () => ({
    fetchMessages: async () => [],
    createMessage,
    updateMessage,
    deleteMessage,
  }),
}))

vi.mock('~/repositories/auditRepository', () => ({
  useAuditRepository: () => ({ recordEntry: vi.fn(), fetchEntries: async () => [] }),
}))

mockNuxtImport('useNuxtApp', () => () => ({
  $auth: { currentUser: { uid: 'u1' } },
  $firestore: {},
}))

function seed(overrides: Partial<ContactMessage> = {}): ContactMessage {
  return {
    id: 'm-1',
    name: 'Ubong',
    email: 'ubong@example.com',
    phone: '+2348000000000',
    message: 'Please can someone visit my mother.',
    submittedAt: '2026-08-09T10:00:00.000Z',
    read: false,
    handled: false,
    ...overrides,
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  failWrite = false
  createMessage.mockClear()
  updateMessage.mockClear()
  deleteMessage.mockClear()
})

describe('sending from the public form', () => {
  it('writes the message', async () => {
    const store = useMessagesStore()
    await store.submit({ name: 'Ubong', email: 'u@e.com', phone: '0800', message: 'Hello' })

    expect(createMessage).toHaveBeenCalledOnce()
  })

  it('throws when the write fails, so the form cannot claim it was sent', async () => {
    const store = useMessagesStore()
    failWrite = true

    await expect(
      store.submit({ name: 'Ubong', email: 'u@e.com', phone: '0800', message: 'Hello' })
    ).rejects.toThrow()
    expect(store.error).toBeTruthy()
  })

  it('adds nothing to the local inbox — a visitor may not read messages back', async () => {
    const store = useMessagesStore()
    await store.submit({ name: 'Ubong', email: 'u@e.com', phone: '0800', message: 'Hello' })

    // Rules allow create only; listing it locally would imply an access nobody has.
    expect(store.messages).toHaveLength(0)
  })

  it('clears the pending flag whether it succeeds or fails', async () => {
    const store = useMessagesStore()
    failWrite = true
    await store
      .submit({ name: 'Ubong', email: 'u@e.com', phone: '0800', message: 'Hello' })
      .catch(() => {})

    // A stuck flag would leave the send button disabled forever.
    expect(store.submitting).toBe(false)
  })
})

describe('the staff inbox', () => {
  it('counts unread and open separately', () => {
    const store = useMessagesStore()
    store.messages = [
      seed({ id: 'a', read: false, handled: false }),
      seed({ id: 'b', read: true, handled: false }),
      seed({ id: 'c', read: true, handled: true }),
    ]

    expect(store.unreadCount).toBe(1)
    // Read but not dealt with still counts as open — that is the point of the second flag.
    expect(store.openCount).toBe(2)
  })

  it('marks a message read', async () => {
    const store = useMessagesStore()
    store.messages = [seed()]

    await store.markRead('m-1')

    expect(updateMessage).toHaveBeenCalledWith('m-1', { read: true })
    expect(store.messages[0]!.read).toBe(true)
  })

  it('does not re-write a message that is already read', async () => {
    const store = useMessagesStore()
    store.messages = [seed({ read: true })]

    await store.markRead('m-1')

    expect(updateMessage).not.toHaveBeenCalled()
  })

  it('leaves the flag alone when the write is refused', async () => {
    const store = useMessagesStore()
    store.messages = [seed()]
    failWrite = true

    await store.markRead('m-1').catch(() => {})

    // Showing it read when Firestore refused would hide it from the unread filter for good.
    expect(store.messages[0]!.read).toBe(false)
    expect(store.unreadCount).toBe(1)
  })

  it('toggles handled both ways', async () => {
    const store = useMessagesStore()
    store.messages = [seed({ handled: false })]

    await store.setHandled('m-1', true)
    expect(store.messages[0]!.handled).toBe(true)

    await store.setHandled('m-1', false)
    expect(store.messages[0]!.handled).toBe(false)
  })

  it('drops a deleted message', async () => {
    const store = useMessagesStore()
    store.messages = [seed(), seed({ id: 'm-2' })]

    await store.remove('m-1')

    expect(store.messages.map((m) => m.id)).toEqual(['m-2'])
  })

  it('keeps a message that failed to delete', async () => {
    const store = useMessagesStore()
    store.messages = [seed()]
    failWrite = true

    await store.remove('m-1').catch(() => {})

    expect(store.messages).toHaveLength(1)
  })
})
