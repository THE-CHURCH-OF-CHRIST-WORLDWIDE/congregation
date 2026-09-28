import { defineStore } from 'pinia'
import { recordAudit } from '~/utils/audit'
import { useLectureshipRepository } from '~/repositories/lectureshipRepository'
import type {
  NewLectureshipRegistration,
  NewLectureshipSpeaker,
} from '~/repositories/lectureshipRepository'
import type { LectureshipRegistration, LectureshipSpeaker } from '~/types'

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

  const speakers = ref<LectureshipSpeaker[]>([])
  const speakersLoading = ref(false)
  const speakersLoaded = ref(false)

  /** The public "X people have registered" figure. Never touched by anything but the counter. */
  const registeredCount = ref(0)
  const registeredCountLoaded = ref(false)

  /** Fetch the list once per session. Pass `force` to pick up anything that arrived since. */
  async function load(force = false) {
    if (loaded.value && !force) return
    const repo = useLectureshipRepository()
    loading.value = true
    error.value = null
    try {
      registrations.value = await repo.fetchRegistrations()
      loaded.value = true
      void syncRegisteredCount()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load registrations'
      useToast().error(error.value)
    } finally {
      loading.value = false
    }
  }

  /**
   * Self-heals the public counter back to the true registration total — catches up anything the
   * counter missed (a failed increment/decrement, or registrations recorded before this counter
   * existed). Fire-and-forget: bookkeeping, not something the admin view should ever wait on or
   * fail over.
   */
  async function syncRegisteredCount() {
    const repo = useLectureshipRepository()
    try {
      const trueCount = registrations.value.length
      const current = await repo.fetchRegisteredCount()
      if (current !== trueCount) {
        await repo.setRegisteredCount(trueCount)
      }
      registeredCount.value = trueCount
      registeredCountLoaded.value = true
    } catch {
      // Ignored — the next admin load tries again.
    }
  }

  /** Public, auth-free read of the counter — what the Lectureship page shows visitors. */
  async function loadRegisteredCount(force = false) {
    if (registeredCountLoaded.value && !force) return
    const repo = useLectureshipRepository()
    try {
      registeredCount.value = await repo.fetchRegisteredCount()
      registeredCountLoaded.value = true
    } catch {
      // Silent — this is a motivational nudge, not critical data; the page works fine without it.
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
      registeredCount.value += 1
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
      registeredCount.value = Math.max(0, registeredCount.value - 1)
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

  /** Fetch speaker/officiating profiles once per session. Pass `force` to pick up new edits. */
  async function loadSpeakers(force = false) {
    if (speakersLoaded.value && !force) return
    const repo = useLectureshipRepository()
    speakersLoading.value = true
    error.value = null
    try {
      speakers.value = await repo.fetchSpeakers()
      speakersLoaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load speakers'
      useToast().error(error.value)
    } finally {
      speakersLoading.value = false
    }
  }

  async function addSpeaker(input: NewLectureshipSpeaker) {
    const repo = useLectureshipRepository()
    saving.value = true
    error.value = null
    try {
      const created = await repo.createSpeaker(input)
      speakers.value.push(created)
      recordAudit({
        action: 'lectureship.speaker.create',
        targetId: created.id,
        targetLabel: created.name,
      })
      useToast().success('Speaker added')
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to add speaker'
      useToast().error(error.value)
      throw e
    } finally {
      saving.value = false
    }
  }

  async function updateSpeaker(id: string, updates: Partial<NewLectureshipSpeaker>) {
    const idx = speakers.value.findIndex((s) => s.id === id)
    if (idx === -1) return
    const repo = useLectureshipRepository()
    saving.value = true
    error.value = null
    try {
      await repo.updateSpeaker(id, updates)
      speakers.value[idx] = { ...speakers.value[idx], ...updates } as LectureshipSpeaker
      recordAudit({
        action: 'lectureship.speaker.update',
        targetId: id,
        targetLabel: speakers.value[idx].name,
      })
      useToast().success('Speaker updated')
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update speaker'
      useToast().error(error.value)
      throw e
    } finally {
      saving.value = false
    }
  }

  async function removeSpeaker(id: string) {
    const speaker = speakers.value.find((s) => s.id === id)
    const repo = useLectureshipRepository()
    saving.value = true
    error.value = null
    try {
      await repo.deleteSpeaker(id)
      speakers.value = speakers.value.filter((s) => s.id !== id)
      recordAudit({
        action: 'lectureship.speaker.delete',
        targetId: id,
        targetLabel: speaker?.name,
      })
      useToast().success('Speaker removed')
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to remove speaker'
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
    speakers,
    speakersLoading,
    speakersLoaded,
    loadSpeakers,
    addSpeaker,
    updateSpeaker,
    removeSpeaker,
    registeredCount,
    registeredCountLoaded,
    loadRegisteredCount,
  }
})
