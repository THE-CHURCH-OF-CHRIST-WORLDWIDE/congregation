import { useAuditStore } from '~/stores/audit'
import type { AuditDraft } from '~/repositories/auditRepository'

/**
 * Record an audit entry without ever disturbing the caller.
 *
 * `useAuditStore().record()` already swallows write failures, but *resolving the store* happens
 * outside that protection — and it can throw: no active Pinia, or a stale auto-import in a
 * long-running dev server. Because the calls sit after the write they describe, a throw there
 * turned a successful member update into an error toast, with the success message never shown.
 *
 * That is backwards. The log documents work that has already succeeded, so nothing here may
 * surface to the user. Both the store lookup and the call are inside the guard, and the import is
 * explicit rather than auto-imported so this path cannot depend on auto-import state at all.
 */
export function recordAudit(draft: AuditDraft) {
  try {
    useAuditStore().record(draft)
  } catch {
    // Bookkeeping only — never the user's problem.
  }
}
