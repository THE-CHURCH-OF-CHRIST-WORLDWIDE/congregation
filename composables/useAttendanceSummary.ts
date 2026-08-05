/**
 * The attendance figures on the dashboard, derived from recorded attendance.
 *
 * Every value is `null` when nothing has been recorded for the period, and the dashboard renders
 * that as "—". This matters: the cards previously showed hardcoded percentages, and the honest
 * alternative is not `0%` either — zero reads as "nobody came" rather than "nobody has taken a
 * register yet".
 *
 * Lives here rather than in the page so the arithmetic can be tested without mounting anything.
 */
export function useAttendanceSummary(serviceType: string, today: Date = new Date()) {
  const attendanceStore = useAttendanceStore()

  const year = today.getFullYear()

  function keyFor(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  const thisMonthKey = keyFor(today)
  const lastMonthKey = keyFor(new Date(year, today.getMonth() - 1, 1))

  const monthLabel = new Date(year, today.getMonth(), 1).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  /** Attendance rate for one month, or null when that month has no records at all. */
  function rateForMonth(month: string): number | null {
    const present = attendanceStore.presentCount(month, serviceType)
    const absent = attendanceStore.absentCount(month, serviceType)
    if (present + absent === 0) return null
    return attendanceStore.attendanceRate(month, serviceType)
  }

  const months = computed(() => attendanceStore.monthlyByService(serviceType, year))
  const monthsWithData = computed(() => months.value.filter((m) => m.total > 0))

  const hasData = computed(() => monthsWithData.value.length > 0)

  /** Monthly rates for a sparkline, or undefined when there is nothing to plot. */
  const rateTrend = computed(() => (hasData.value ? months.value.map((m) => m.rate) : undefined))

  const thisMonthRate = computed(() => rateForMonth(thisMonthKey))
  const lastMonthRate = computed(() => rateForMonth(lastMonthKey))

  /** A comparison needs both sides; otherwise there is no trend to report. */
  const monthOnMonthChange = computed(() =>
    thisMonthRate.value !== null && lastMonthRate.value !== null
      ? thisMonthRate.value - lastMonthRate.value
      : undefined
  )

  /** Average heads present per recorded session — a count, as the label promises. */
  const averageWeekly = computed(() => {
    const weeks = attendanceStore.weeklyByService(serviceType).filter((w) => w.total > 0)
    if (!weeks.length) return null
    return Math.round(weeks.reduce((sum, w) => sum + w.present, 0) / weeks.length)
  })

  /** Year to date, weighted by how many records each month actually holds. */
  const annualRate = computed(() => {
    const withData = monthsWithData.value
    if (!withData.length) return null
    const present = withData.reduce((sum, m) => sum + m.present, 0)
    const total = withData.reduce((sum, m) => sum + m.total, 0)
    return total ? Math.round((present / total) * 100) : null
  })

  return {
    year,
    monthLabel,
    hasData,
    rateTrend,
    thisMonthRate,
    lastMonthRate,
    monthOnMonthChange,
    averageWeekly,
    annualRate,
  }
}
