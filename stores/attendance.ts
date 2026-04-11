import { defineStore } from 'pinia'
import type { AttendanceRecord } from '~/types'

export const useAttendanceStore = defineStore('attendance', () => {
  const records = ref<AttendanceRecord[]>([])
  const currentService = ref('Sunday Worship')
  const currentMonth = ref('2025-12')
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

  const monthlyPresenceCounts = computed(() => {
    const months = ['2025-01','2025-02','2025-03','2025-04','2025-05','2025-06',
                    '2025-07','2025-08','2025-09','2025-10','2025-11','2025-12']
    return months.map((m) => {
      const monthRecs = records.value.filter((r) => r.date.startsWith(m) && r.serviceType === 'Sunday Worship')
      const uniqueDates = [...new Set(monthRecs.map((r) => r.date))]
      const totalSessions = uniqueDates.length
      const presentCount = monthRecs.filter((r) => r.present).length
      const listedCount = monthRecs.length
      return { month: m, totalSessions, presentCount, listedCount }
    })
  })

  function markPresent(recordId: string) {
    const r = records.value.find((r) => r.id === recordId)
    if (r) {
      pendingChanges.value[recordId] = true
      r.present = true
    }
  }

  function markAbsent(recordId: string) {
    const r = records.value.find((r) => r.id === recordId)
    if (r) {
      pendingChanges.value[recordId] = false
      r.present = false
    }
  }

  function toggleAttendance(recordId: string) {
    const r = records.value.find((r) => r.id === recordId)
    if (r) {
      r.present = !r.present
      pendingChanges.value[recordId] = r.present
    }
  }

  function saveChanges() {
    pendingChanges.value = {}
  }

  function cancelChanges() {
    for (const [id, wasPresent] of Object.entries(pendingChanges.value)) {
      const r = records.value.find((r) => r.id === id)
      if (r) r.present = !wasPresent
    }
    pendingChanges.value = {}
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
    markPresent,
    markAbsent,
    toggleAttendance,
    saveChanges,
    cancelChanges,
  }
})
