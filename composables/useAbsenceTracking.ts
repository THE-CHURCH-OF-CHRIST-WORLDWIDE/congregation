/**
 * Who has been missing from the Sunday register, and for how long.
 *
 * Lives in a composable rather than in either store because the answer needs both: the roll from
 * `members` and the registers from `attendance`. Putting it in one store would make that store
 * depend on the other, and `attendance` already reaches into `members` to apply the Active /
 * Inactive labels — the reverse dependency as well would be a cycle.
 *
 * Replaces the `Member.absenceCount` field, which was never written to by anything: it was set to
 * 0 on registration and read by the dashboard's follow-up table, so that table was permanently
 * empty. See `absenceStreaks` for why this is derived rather than stored.
 */

import {
  ABSENCE_LOOKBACK,
  BACKSLIDER_THRESHOLD,
  absenceStreaks,
  summariseStatusUpdates,
  type StatusUpdate,
} from '~/utils/attendanceStatus'
import type { Member } from '~/types'

/**
 * Module-level, so the once-per-session guard holds across page navigations rather than resetting
 * with each component that calls this. An SPA reload starts a new session and syncs again.
 */
let syncedThisSession = false

export function useAbsenceTracking() {
  const membersStore = useMembersStore()
  const attendanceStore = useAttendanceStore()

  /** Consecutive missed Sundays per member id. */
  const absences = computed(() => absenceStreaks(membersStore.members, attendanceStore.records))

  function absencesFor(memberId: string): number {
    return absences.value.get(memberId) ?? 0
  }

  /**
   * Members needing follow-up, longest absence first — the order somebody working down the list
   * would want.
   */
  const backsliders = computed<Member[]>(() =>
    membersStore.members
      .filter((m) => absencesFor(m.id) >= BACKSLIDER_THRESHOLD)
      .sort((a, b) => absencesFor(b.id) - absencesFor(a.id))
  )

  /**
   * Bring the Active / Inactive labels up to date against the stored registers.
   *
   * Saving a register already triggers this, which covers the normal case. This exists for the
   * case it cannot: registers taken in another session, or on another device, leave labels that
   * were correct when written and are not any more. Runs once per session unless forced, so
   * navigating between admin pages does not re-issue the same writes.
   *
   * Does no loading of its own, and does nothing at all until both datasets are in memory. That
   * keeps two costs out: a second concurrent read of the whole attendance collection when a page
   * has a `load()` already in flight, and any read at all on pages that never needed one.
   */
  async function syncStatuses(force = false): Promise<StatusUpdate[]> {
    if (syncedThisSession && !force) return []
    // Not marked as done — the caller is expected to try again once the data arrives.
    if (!membersStore.loaded || !attendanceStore.loaded) return []
    syncedThisSession = true
    try {
      return await membersStore.syncAttendanceStatuses(attendanceStore.records)
    } catch {
      // Bookkeeping that follows data someone else already saved — never the user's problem.
      return []
    }
  }

  /**
   * Run the refresh as soon as both the roll and the registers are in memory, whenever that is.
   *
   * Call from screens that load attendance anyway — the dashboard and the attendance page. Fires
   * on a watcher rather than in `onMounted` because those loads are in flight at mount, and
   * awaiting them here would mean either a duplicate fetch or ordering assumptions between the
   * page's own `load()` calls and this one.
   */
  function autoSyncWhenReady() {
    watch(
      () => membersStore.loaded && attendanceStore.loaded,
      (ready) => {
        if (ready) syncStatuses()
      },
      { immediate: true }
    )
  }

  return {
    absences,
    absencesFor,
    backsliders,
    syncStatuses,
    autoSyncWhenReady,
    summariseStatusUpdates,
    BACKSLIDER_THRESHOLD,
    ABSENCE_LOOKBACK,
  }
}

/** Test seam: the session guard is module state and would otherwise leak between test cases. */
export function resetAbsenceSyncGuard() {
  syncedThisSession = false
}
