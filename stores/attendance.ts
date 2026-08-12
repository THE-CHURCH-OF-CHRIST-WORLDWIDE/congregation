import { defineStore } from 'pinia'
import { attendanceDocId, useAttendanceRepository } from '~/repositories/attendanceRepository'
import { recordAudit } from '~/utils/audit'
import type { AttendanceRecord, WorshipDetails } from '~/types'

function makeServiceId(serviceType: string, date: string): string {
  return `${serviceType.toLowerCase().replace(/\s+/g, '-')}-${date}`
}

export const useAttendanceStore = defineStore('attendance', () => {
  // Hydrate from localStorage on first store access (client-only).
  const records = ref<AttendanceRecord[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    error.value = null
    try {
      records.value = await useAttendanceRepository().fetchRecords()
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load attendance'
      useToast().error(error.value)
    } finally {
      loading.value = false
    }
  }
  const currentService = ref('Sunday Worship')
  // Default to the month the user is actually in, not a fixed one.
  const currentMonth = ref(new Date().toISOString().slice(0, 7))
  // pendingChanges maps recordId → the value at the moment editing began,
  // so cancelChanges can revert and saveChanges can persist the new state.
  const pendingChanges = ref<Record<string, boolean>>({})

  const presentCount = computed(() => {
    return (month: string, serviceType: string) =>
      records.value.filter(
        (r) => r.date.startsWith(month) && r.serviceType === serviceType && r.present
      ).length
  })

  const absentCount = computed(() => {
    return (month: string, serviceType: string) =>
      records.value.filter(
        (r) => r.date.startsWith(month) && r.serviceType === serviceType && !r.present
      ).length
  })

  const attendanceRate = computed(() => {
    return (month: string, serviceType: string) => {
      const total = records.value.filter(
        (r) => r.date.startsWith(month) && r.serviceType === serviceType
      ).length
      if (!total) return 0
      const present = records.value.filter(
        (r) => r.date.startsWith(month) && r.serviceType === serviceType && r.present
      ).length
      return Math.round((present / total) * 100)
    }
  })

  const memberMonthlySummary = computed(() => {
    return (memberId: string, month: string, serviceType: string) => {
      const memberRecords = records.value.filter(
        (r) => r.memberId === memberId && r.date.startsWith(month) && r.serviceType === serviceType
      )
      const sessionsTotal = memberRecords.length
      const sessionsPresent = memberRecords.filter((r) => r.present).length
      const percentage = sessionsTotal ? Math.round((sessionsPresent / sessionsTotal) * 100) : 0
      return { sessionsTotal, sessionsPresent, percentage }
    }
  })

  /**
   * The last `count` months ending with the current one.
   *
   * Trend charts used a calendar year, so on 1 January they emptied and a year of history became
   * unreachable. A rolling window has no such cliff — it always shows recent direction, which is
   * what a trend is for. Browsing a specific year is the monthly grid's job; it has a year
   * selector.
   */
  function rollingMonthsByService(serviceType: string, count = 12) {
    const now = new Date()
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const recs = records.value.filter(
        (r) => r.date.startsWith(key) && r.serviceType === serviceType
      )
      const sessions = [...new Set(recs.map((r) => r.date))].length
      const present = recs.filter((r) => r.present).length
      const total = recs.length
      // A window can span two years, so January carries its year to mark the wrap.
      const month = d.toLocaleString(undefined, { month: 'short' })
      const label =
        d.getMonth() === 0 || i === 0 ? `${month} ${String(d.getFullYear()).slice(2)}` : month
      return {
        month: key,
        label,
        sessions,
        present,
        total,
        rate: total ? Math.round((present / total) * 100) : 0,
      }
    })
  }

  // ── Reactive monthly data for a given service + year ─────────────────────
  function monthlyByService(serviceType: string, year: string | number = new Date().getFullYear()) {
    const yr = String(year)
    return Array.from({ length: 12 }, (_, i) => {
      const m = `${yr}-${String(i + 1).padStart(2, '0')}`
      const recs = records.value.filter(
        (r) => r.date.startsWith(m) && r.serviceType === serviceType
      )
      const sessions = [...new Set(recs.map((r) => r.date))].length
      const present = recs.filter((r) => r.present).length
      const total = recs.length
      const rate = total ? Math.round((present / total) * 100) : 0
      return { month: m, sessions, present, total, rate }
    })
  }

  // ── Weekly data: last 12 weeks for a given service ──────────────────────────
  function weeklyByService(serviceType: string) {
    const result: Array<{
      week: string
      label: string
      present: number
      total: number
      rate: number
    }> = []
    const now = new Date()

    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() - w * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const startStr = weekStart.toISOString().slice(0, 10)
      const endStr = weekEnd.toISOString().slice(0, 10)

      const recs = records.value.filter(
        (r) => r.serviceType === serviceType && r.date >= startStr && r.date <= endStr
      )
      const present = recs.filter((r) => r.present).length
      const total = recs.length
      const rate = total ? Math.round((present / total) * 100) : 0

      const label = formatDate(weekStart, 'dayMonth')
      result.push({ week: startStr, label, present, total, rate })
    }

    return result
  }

  function findRecord(memberId: string, date: string, serviceType: string) {
    return records.value.find(
      (r) => r.memberId === memberId && r.date === date && r.serviceType === serviceType
    )
  }

  // Mark the original value of a record so cancelChanges can revert it.
  function trackOriginal(recordId: string, originalPresent: boolean) {
    if (!(recordId in pendingChanges.value)) {
      pendingChanges.value[recordId] = originalPresent
    }
  }

  // Toggle by (member, date, service). Creates a record if none exists so the
  // table can be ticked even on dates that were never seeded.
  /**
   * Where a present member worshipped, or nothing at all for an absence.
   *
   * Marking somebody absent clears the place, congregation and certificate: they are claims about
   * a service the member did not attend, and leaving them behind would have a record read as
   * "absent, with a certificate of worship from Uyo".
   */
  function worshipFields(
    present: boolean,
    details?: WorshipDetails
  ): Pick<AttendanceRecord, 'place' | 'congregation' | 'certificate' | 'certificateRef'> {
    if (!present) {
      return {
        place: undefined,
        congregation: undefined,
        certificate: undefined,
        certificateRef: undefined,
      }
    }
    const place = details?.place ?? 'local'
    // Only an `elsewhere` record carries a congregation or a certificate.
    if (place === 'local') {
      return {
        place,
        congregation: undefined,
        certificate: undefined,
        certificateRef: undefined,
      }
    }
    return {
      place,
      congregation: details?.congregation,
      certificate: details?.certificate,
      certificateRef: details?.certificateRef,
    }
  }

  function setAttendance(
    memberId: string,
    date: string,
    serviceType: string,
    present: boolean,
    details?: WorshipDetails
  ): AttendanceRecord {
    const worship = worshipFields(present, details)
    const existing = findRecord(memberId, date, serviceType)
    if (existing) {
      trackOriginal(existing.id, existing.present)
      existing.present = present
      Object.assign(existing, worship)
      return existing
    }
    const rec: AttendanceRecord = {
      id: attendanceDocId({ memberId, date, serviceType }),
      memberId,
      serviceId: makeServiceId(serviceType, date),
      date,
      present,
      serviceType,
      ...worship,
    }
    records.value.push(rec)
    // For brand-new records, the "original" state is "absent" (no record == not marked).
    trackOriginal(rec.id, false)
    return rec
  }

  function toggleForMemberDate(
    memberId: string,
    date: string,
    serviceType: string,
    details?: WorshipDetails
  ) {
    const existing = findRecord(memberId, date, serviceType)
    return setAttendance(memberId, date, serviceType, !(existing?.present ?? false), details)
  }

  function markPresent(recordId: string) {
    const r = records.value.find((r) => r.id === recordId)
    if (r) {
      trackOriginal(recordId, r.present)
      r.present = true
    }
  }

  function markAbsent(recordId: string) {
    const r = records.value.find((r) => r.id === recordId)
    if (r) {
      trackOriginal(recordId, r.present)
      r.present = false
    }
  }

  function toggleAttendance(recordId: string) {
    const r = records.value.find((r) => r.id === recordId)
    if (r) {
      trackOriginal(recordId, r.present)
      r.present = !r.present
    }
  }

  /**
   * Writes only the records that changed, in one batch. `pendingChanges` is cleared solely on
   * success — if the write is refused the ticks stay pending, so nothing looks saved that is not.
   */
  async function saveChanges() {
    const ids = Object.keys(pendingChanges.value)
    if (!ids.length) return
    const changed = records.value.filter((r) => ids.includes(r.id))
    saving.value = true
    error.value = null
    try {
      await useAttendanceRepository().saveRecords(changed)
      pendingChanges.value = {}
      recordAudit({
        action: 'attendance.record',
        targetLabel: `${changed.length} change${changed.length === 1 ? '' : 's'}`,
      })
      useToast().success(`Attendance saved (${ids.length} change${ids.length === 1 ? '' : 's'})`)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save attendance'
      useToast().error(error.value)
      throw e
    } finally {
      saving.value = false
    }

    // The register just changed, so who counts as inactive may have too. Deliberately outside the
    // try above, and swallowing its own failures: this follows a register that has already saved
    // successfully, and must never be able to report that register as failed.
    try {
      const membersStore = useMembersStore()
      // Only relabel against a roll already in memory. Fetching one here would put a full read of
      // the members collection behind every register save, on a page that has necessarily loaded
      // them already to draw the register in the first place.
      if (membersStore.loaded) await membersStore.syncAttendanceStatuses(records.value)
    } catch {
      // Bookkeeping only — never the user's problem.
    }
  }

  function cancelChanges() {
    const count = Object.keys(pendingChanges.value).length
    for (const [id, original] of Object.entries(pendingChanges.value)) {
      const r = records.value.find((r) => r.id === id)
      if (r) r.present = original
    }
    pendingChanges.value = {}
    if (count > 0) useToast().info('Changes discarded')
  }

  // Persist the whole records array. Useful for bulk operations (CSV import, seed overrides).

  const hasPendingChanges = computed(() => Object.keys(pendingChanges.value).length > 0)

  return {
    records,
    loading,
    saving,
    error,
    loaded,
    load,
    currentService,
    currentMonth,
    pendingChanges,
    hasPendingChanges,
    presentCount,
    absentCount,
    attendanceRate,
    memberMonthlySummary,
    monthlyByService,
    rollingMonthsByService,
    weeklyByService,
    findRecord,
    setAttendance,
    toggleForMemberDate,
    markPresent,
    markAbsent,
    toggleAttendance,
    saveChanges,
    cancelChanges,
  }
})
