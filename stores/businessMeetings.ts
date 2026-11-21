import { defineStore } from 'pinia'
import { useBusinessMeetingsRepository } from '~/repositories/businessMeetingsRepository'
import { recordAudit } from '~/utils/audit'
import type { BusinessMeeting, BusinessMeetingDraft } from '~/types/businessMeetings'

function stamp() {
  return {
    updatedAt: new Date().toISOString(),
    updatedBy: useAuthStore().user?.email ?? '',
  }
}

export const useBusinessMeetingsStore = defineStore('businessMeetings', () => {
  const meetings = ref<BusinessMeeting[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  function fail(e: unknown, fallback: string): never {
    error.value = e instanceof Error ? e.message : fallback
    useToast().error(error.value)
    throw e
  }

  function sort() {
    meetings.value.sort((a, b) => b.date.localeCompare(a.date))
  }

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    error.value = null
    try {
      meetings.value = await useBusinessMeetingsRepository().fetchMeetings()
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load business meetings'
      useToast().error(error.value)
    } finally {
      loading.value = false
    }
  }

  function byId(id: string) {
    return meetings.value.find((m) => m.id === id) ?? null
  }

  async function create(draft: BusinessMeetingDraft): Promise<BusinessMeeting> {
    saving.value = true
    try {
      const now = stamp()
      const body: BusinessMeetingDraft = { ...draft, ...now, createdAt: now.updatedAt }
      const id = await useBusinessMeetingsRepository().createMeeting(body)
      const created: BusinessMeeting = { ...body, id }
      meetings.value.push(created)
      sort()
      recordAudit({ action: 'businessMeeting.create', targetId: id, targetLabel: label(created) })
      useToast().success('Minutes saved')
      return created
    } catch (e: unknown) {
      return fail(e, 'Failed to save the minutes')
    } finally {
      saving.value = false
    }
  }

  async function save(
    meeting: BusinessMeeting,
    audit:
      | 'businessMeeting.update'
      | 'businessMeeting.approve'
      | 'businessMeeting.reopen' = 'businessMeeting.update',
    message = 'Minutes saved'
  ): Promise<BusinessMeeting> {
    saving.value = true
    try {
      const next: BusinessMeeting = { ...meeting, ...stamp() }
      await useBusinessMeetingsRepository().saveMeeting(next)
      const i = meetings.value.findIndex((m) => m.id === next.id)
      if (i >= 0) meetings.value[i] = next
      else meetings.value.push(next)
      sort()
      recordAudit({ action: audit, targetId: next.id, targetLabel: label(next) })
      useToast().success(message)
      return next
    } catch (e: unknown) {
      return fail(e, 'Failed to save the minutes')
    } finally {
      saving.value = false
    }
  }

  /** Marks the minutes as adopted, which locks them. */
  function approve(meeting: BusinessMeeting, approvedOn: string) {
    return save(
      { ...meeting, status: 'approved', approvedOn },
      'businessMeeting.approve',
      'Minutes approved and locked'
    )
  }

  /** Admin-only in the rules: unlocks approved minutes for correction. */
  function reopen(meeting: BusinessMeeting) {
    return save(
      { ...meeting, status: 'draft', approvedOn: '' },
      'businessMeeting.reopen',
      'Minutes reopened for editing'
    )
  }

  async function remove(meeting: BusinessMeeting) {
    saving.value = true
    try {
      await useBusinessMeetingsRepository().deleteMeeting(meeting.id)
      meetings.value = meetings.value.filter((m) => m.id !== meeting.id)
      recordAudit({
        action: 'businessMeeting.delete',
        targetId: meeting.id,
        targetLabel: label(meeting),
      })
      useToast().success('Meeting deleted')
    } catch (e: unknown) {
      fail(e, 'Failed to delete the meeting')
    } finally {
      saving.value = false
    }
  }

  return {
    meetings,
    loading,
    saving,
    loaded,
    error,
    load,
    byId,
    create,
    save,
    approve,
    reopen,
    remove,
  }
})

function label(m: Pick<BusinessMeeting, 'title' | 'date'>) {
  return `${m.title || 'Business Meeting'} (${m.date})`
}
