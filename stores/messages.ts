import { defineStore } from 'pinia'
import { recordAudit } from '~/utils/audit'
import { useMessagesRepository } from '~/repositories/messagesRepository'
import type { NewContactMessage } from '~/repositories/messagesRepository'
import type { ContactMessage } from '~/types'

/**
 * Messages left through the public contact form, and the staff inbox that reads them.
 *
 * `submit()` runs signed out, so it deliberately does not touch `messages` — an anonymous
 * visitor may create a message but never list one, and pushing the new message into local
 * state would only pretend otherwise. It also records no audit entry: `auditLog` is
 * staff-append-only, and a visitor is not staff.
 */
export const useMessagesStore = defineStore('messages', () => {
  const messages = ref<ContactMessage[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  const unreadCount = computed(() => messages.value.filter((m) => !m.read).length)
  const openCount = computed(() => messages.value.filter((m) => !m.handled).length)

  /** Fetch the inbox once per session. Pass `force` to pick up anything that arrived since. */
  async function load(force = false) {
    if (loaded.value && !force) return
    const repo = useMessagesRepository()
    loading.value = true
    error.value = null
    try {
      messages.value = await repo.fetchMessages()
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load messages'
      useToast().error(error.value)
    } finally {
      loading.value = false
    }
  }

  /**
   * Send a message from the public form. Throws on failure so the form can keep what was typed
   * on screen and show the error, rather than clearing it and claiming success.
   */
  async function submit(input: NewContactMessage) {
    const repo = useMessagesRepository()
    submitting.value = true
    error.value = null
    try {
      await repo.createMessage(input)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to send your message'
      throw e
    } finally {
      submitting.value = false
    }
  }

  /** Local state follows only what Firestore accepted. */
  async function patch(id: string, updates: Partial<Pick<ContactMessage, 'read' | 'handled'>>) {
    const idx = messages.value.findIndex((m) => m.id === id)
    if (idx === -1) return
    const repo = useMessagesRepository()
    saving.value = true
    error.value = null
    try {
      await repo.updateMessage(id, updates)
      messages.value[idx] = { ...messages.value[idx], ...updates } as ContactMessage
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update the message'
      useToast().error(error.value)
      throw e
    } finally {
      saving.value = false
    }
  }

  /** Opening a message marks it read. A no-op if it already is, to avoid a pointless write. */
  async function markRead(id: string) {
    const message = messages.value.find((m) => m.id === id)
    if (!message || message.read) return
    await patch(id, { read: true })
    recordAudit({ action: 'message.read', targetId: id, targetLabel: message.name })
  }

  async function setHandled(id: string, handled: boolean) {
    const message = messages.value.find((m) => m.id === id)
    if (!message) return
    await patch(id, { handled })
    recordAudit({ action: 'message.handled', targetId: id, targetLabel: message.name })
  }

  async function remove(id: string) {
    const message = messages.value.find((m) => m.id === id)
    const repo = useMessagesRepository()
    saving.value = true
    error.value = null
    try {
      await repo.deleteMessage(id)
      messages.value = messages.value.filter((m) => m.id !== id)
      recordAudit({ action: 'message.delete', targetId: id, targetLabel: message?.name })
      useToast().success('Message deleted')
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to delete the message'
      useToast().error(error.value)
      throw e
    } finally {
      saving.value = false
    }
  }

  return {
    messages,
    loading,
    saving,
    submitting,
    error,
    loaded,
    unreadCount,
    openCount,
    load,
    submit,
    markRead,
    setHandled,
    remove,
  }
})
