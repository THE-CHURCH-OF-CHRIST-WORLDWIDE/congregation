import { defineStore } from 'pinia'
import { useAuditRepository, type AuditDraft } from '~/repositories/auditRepository'
import type { AuditAction, AuditEntry } from '~/types'

/** Wording for each action, kept in one place so the log reads consistently. */
const ACTION_LABELS: Record<AuditAction, string> = {
  'member.create': 'Added member',
  'member.update': 'Updated member',
  'member.delete': 'Deleted member',
  'settings.update': 'Updated church settings',
  'role.permissions': 'Changed role permissions',
  'roleAssignment.create': 'Assigned role',
  'roleAssignment.update': 'Changed custom permissions',
  'roleAssignment.delete': 'Revoked role',
  'access.grant': 'Granted dashboard access',
  'access.revoke': 'Revoked dashboard access',
  'invitation.send': 'Sent invitation',
  'invitation.revoke': 'Revoked invitation',
  'invitation.claim': 'Accepted invitation',
  'finance.collection.create': 'Recorded a collection',
  'finance.collection.delete': 'Deleted a collection',
  'finance.expense.create': 'Recorded an expense',
  'finance.expense.delete': 'Deleted an expense',
  'teaching.create': 'Uploaded a teaching',
  'teaching.update': 'Updated a teaching',
  'teaching.delete': 'Deleted a teaching',
  'event.create': 'Added an event',
  'event.update': 'Updated an event',
  'event.delete': 'Deleted an event',
  'attendance.record': 'Recorded attendance',
}

export function auditActionLabel(action: AuditAction): string {
  return ACTION_LABELS[action] ?? action
}

/**
 * The activity log.
 *
 * Reading requires Super Admin — the rules enforce it, and the Settings nav hides the panel for
 * everyone else. Writing is deliberately forgiving: `record()` never throws and never blocks, so
 * a failed log entry can't turn a successful save into a visible error. Losing a log line is
 * strictly better than losing the write it was describing.
 */
export const useAuditStore = defineStore('audit', () => {
  const entries = ref<AuditEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    error.value = null
    try {
      entries.value = await useAuditRepository().fetchEntries()
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load the audit log'
    } finally {
      loading.value = false
    }
  }

  /**
   * Fire-and-forget. Callers should not await this — it is bookkeeping about an action that has
   * already succeeded, and its failure is not the user's problem.
   */
  function record(draft: AuditDraft) {
    // Prefer the store, but fall back to Firebase's own currentUser: right after
    // `signInWithEmailLink` the auth listener may not have run yet, and the invitation-claim
    // entry would otherwise be dropped for having no actor.
    const auth = useAuthStore()
    const actor = auth.user ?? useNuxtApp().$auth?.currentUser ?? null
    // No signed-in actor means no attributable entry, and rules would refuse it anyway.
    if (!actor?.uid) return

    void useAuditRepository()
      .recordEntry({ ...draft, actorUid: actor.uid, actorEmail: actor.email ?? undefined })
      .then(() => {
        // Keep an open log view current without a refetch.
        if (loaded.value) void load(true)
      })
      .catch(() => {
        // Swallowed on purpose: see the note above.
      })
  }

  return { entries, loading, error, loaded, load, record }
})
