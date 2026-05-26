import { defineStore } from 'pinia'
import type { AttendanceRecord } from '~/types'

const STORAGE_KEY = 'congregation:attendance'

function readPersisted(): AttendanceRecord[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AttendanceRecord[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writePersisted(records: AttendanceRecord[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // Storage may be unavailable (private mode, quota); ignore.
  }
}

function makeRecordId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function makeServiceId(serviceType: string, date: string): string {
  return `${serviceType.toLowerCase().replace(/\s+/g, '-')}-${date}`
}

export const useAttendanceStore = defineStore('attendance', () => {
  // Hydrate from localStorage on first store access (client-only).
  const persisted = readPersisted()
  const records = ref<AttendanceRecord[]>(persisted ?? [])
  const currentService = ref('Sunday Worship')
  const currentMonth = ref('2025-12')
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

  // ── Monthly presence counts by service type ────────────────────────────────
  const monthlyPresenceCounts = computed(() => {
    const months = [
      '2025-01',
      '2025-02',
      '2025-03',
      '2025-04',
      '2025-05',
      '2025-06',
      '2025-07',
      '2025-08',
      '2025-09',
      '2025-10',
      '2025-11',
      '2025-12',
    ]
    return months.map((m) => {
      const monthRecs = records.value.filter(
        (r) => r.date.startsWith(m) && r.serviceType === 'Sunday Worship'
      )
      const uniqueDates = [...new Set(monthRecs.map((r) => r.date))]
      const totalSessions = uniqueDates.length
      const presentCount = monthRecs.filter((r) => r.present).length
      const listedCount = monthRecs.length
      return { month: m, totalSessions, presentCount, listedCount }
    })
  })

  // ── Reactive monthly data for a given service + year ─────────────────────
  function monthlyByService(serviceType: string, year: string | number = 2025) {
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
  function setAttendance(
    memberId: string,
    date: string,
    serviceType: string,
    present: boolean
  ): AttendanceRecord {
    const existing = findRecord(memberId, date, serviceType)
    if (existing) {
      trackOriginal(existing.id, existing.present)
      existing.present = present
      return existing
    }
    const rec: AttendanceRecord = {
      id: makeRecordId(),
      memberId,
      serviceId: makeServiceId(serviceType, date),
      date,
      present,
      serviceType,
    }
    records.value.push(rec)
    // For brand-new records, the "original" state is "absent" (no record == not marked).
    trackOriginal(rec.id, false)
    return rec
  }

  function toggleForMemberDate(memberId: string, date: string, serviceType: string) {
    const existing = findRecord(memberId, date, serviceType)
    return setAttendance(memberId, date, serviceType, !(existing?.present ?? false))
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

  function saveChanges() {
    const count = Object.keys(pendingChanges.value).length
    writePersisted(records.value)
    pendingChanges.value = {}
    if (count > 0) {
      useToast().success(`Attendance saved (${count} change${count === 1 ? '' : 's'})`)
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
  function persist() {
    writePersisted(records.value)
  }

  const hasPendingChanges = computed(() => Object.keys(pendingChanges.value).length > 0)

  return {
    records,
    currentService,
    currentMonth,
    pendingChanges,
    hasPendingChanges,
    presentCount,
    absentCount,
    attendanceRate,
    memberMonthlySummary,
    monthlyPresenceCounts,
    monthlyByService,
    weeklyByService,
    findRecord,
    setAttendance,
    toggleForMemberDate,
    persist,
    markPresent,
    markAbsent,
    toggleAttendance,
    saveChanges,
    cancelChanges,
  }
})
