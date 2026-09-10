import { defineStore } from 'pinia'
import { useLectureshipRepository } from '~/repositories/lectureshipRepository'
import type { NewLectureshipRegistration } from '~/repositories/lectureshipRepository'

/**
 * Registrations left through the public Bible Lectureship form.
 *
 * `submit()` runs signed out, so it deliberately does not touch local state — an anonymous
 * visitor may create a registration but never list one, and pushing it into local state would
 * only pretend otherwise.
 */
export const useLectureshipStore = defineStore('lectureship', () => {
  const submitting = ref(false)
  const error = ref<string | null>(null)

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

  return { submitting, error, submit }
})
