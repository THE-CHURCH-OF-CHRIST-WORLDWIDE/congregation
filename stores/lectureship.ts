import { defineStore } from 'pinia'
import { recordAudit } from '~/utils/audit'
import { useLectureshipRepository } from '~/repositories/lectureshipRepository'
import type { NewLectureshipRegistration } from '~/repositories/lectureshipRepository'
import type { LectureshipRegistration } from '~/types'

/**
 * Registrations left through the public Bible Lectureship form, and the staff list that reads
 * them.
 *
 * `submit()` runs signed out, so it deliberately does not touch `registrations` — an anonymous
 * visitor may create a registration but never list one, and pushing it into local state would
 * only pretend otherwise.
 */
export const useLectureshipStore = defineStore('lectureship', () => {
  const registrations = ref<LectureshipRegistration[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  /** Fetch the list once per session. Pass `force` to pick up anything that arrived since. */
  async function load(force = false) {
    if (loaded.value && !force) return
    const repo = useLectureshipRepository()
    loading.value = true
    error.value = null
    try {
      registrations.value = await repo.fetchRegistrations()
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load registrations'
      useToast().error(error.value)
    } finally {
      loading.value = false
    }
  }

  /**
   * Register for the lectureship. Throws on failure so the form can keep what was typed on
   * screen and show the error, rather than clearing it and claiming success.
   */
  async function submit(input: NewLectureshipRegistration) {
    const repo = useLectureshipRepository()
    submitting.value = true
    error.value = null
    try {
      await repo.createRegistration(input)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to submit your registration'
      throw e
    } finally {
      submitting.value = false
    }
  }

  /**
   * Check a registrant in for one day. Always writes both attendance flags together — see
   * `lectureshipRepository.updateAttendance` — so the current value of the other day is read
   * from local state first.
   */
  async function updateAttendance(id: string, day: 'sat' | 'sun', attended: boolean) {
    const idx = registrations.value.findIndex((r) => r.id === id)
    const current = registrations.value[idx]
    if (idx === -1 || !current) return
    const attendance = {
      attendedSat: day === 'sat' ? attended : (current.attendedSat ?? false),
      attendedSun: day === 'sun' ? attended : (current.attendedSun ?? false),
    }
    const repo = useLectureshipRepository()
    error.value = null
    try {
      await repo.updateAttendance(id, attendance)
      registrations.value[idx] = { ...current, ...attendance }
      recordAudit({
        action: 'lectureship.attendance',
        targetId: id,
        targetLabel: `${current.fullName} — ${day === 'sat' ? 'Saturday' : 'Sunday'} ${attended ? 'checked in' : 'unchecked'}`,
      })
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update attendance'
      useToast().error(error.value)
      throw e
    }
  }

  async function remove(id: string) {
    const registration = registrations.value.find((r) => r.id === id)
    const repo = useLectureshipRepository()
    saving.value = true
    error.value = null
    try {
      await repo.deleteRegistration(id)
      registrations.value = registrations.value.filter((r) => r.id !== id)
      recordAudit({
        action: 'lectureship.delete',
        targetId: id,
        targetLabel: registration?.fullName,
      })
      useToast().success('Registration deleted')
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to delete the registration'
      useToast().error(error.value)
      throw e
    } finally {
      saving.value = false
    }
  }

  return {
    registrations,
    loading,
    saving,
    submitting,
    error,
    loaded,
    load,
    submit,
    updateAttendance,
    remove,
  }
})
