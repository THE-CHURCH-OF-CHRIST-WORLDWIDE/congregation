import { defineStore } from 'pinia'
import type { FinanceCollection, FinanceExpense, ExpenseCategory } from '~/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function yearMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function quarterKey(date: Date): string {
  return `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`
}

function yearKey(date: Date): string {
  return String(date.getFullYear())
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useFinanceStore = defineStore('finance', () => {
  const collections = ref<FinanceCollection[]>([])
  const expenses = ref<FinanceExpense[]>([])

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalIncome = computed(() => collections.value.reduce((s, c) => s + c.amount, 0))
  const totalExpenses = computed(() => expenses.value.reduce((s, e) => s + e.amount, 0))
  const netBalance = computed(() => totalIncome.value - totalExpenses.value)

  // ── Grouped by period ───────────────────────────────────────────────────────
  function groupBy<T extends { date: string; amount: number }>(
    items: T[],
    keyFn: (d: Date) => string
  ): Record<string, number> {
    return items.reduce(
      (acc, item) => {
        const k = keyFn(new Date(item.date))
        acc[k] = (acc[k] ?? 0) + item.amount
        return acc
      },
      {} as Record<string, number>
    )
  }

  // ── Last 8 weeks ─────────────────────────────────────────────────────────
  const last8WeeksLabels = computed(() => {
    const labels: string[] = []
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      labels.push(isoWeek(d))
    }
    return labels
  })

  const weeklyIncomeMap = computed(() => groupBy(collections.value, isoWeek))
  const weeklyExpenseMap = computed(() => groupBy(expenses.value, isoWeek))

  // ── Last 12 months ────────────────────────────────────────────────────────
  const last12MonthsLabels = computed(() => {
    const labels: string[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      labels.push(yearMonthKey(d))
    }
    return labels
  })

  const monthlyIncomeMap = computed(() => groupBy(collections.value, yearMonthKey))
  const monthlyExpenseMap = computed(() => groupBy(expenses.value, yearMonthKey))

  // ── Last 8 quarters ───────────────────────────────────────────────────────
  const last8QuartersLabels = computed(() => {
    const labels: string[] = []
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i * 3, 1)
      labels.push(quarterKey(d))
    }
    return [...new Set(labels)]
  })

  const quarterlyIncomeMap = computed(() => groupBy(collections.value, quarterKey))
  const quarterlyExpenseMap = computed(() => groupBy(expenses.value, quarterKey))

  // ── Last 4 years ──────────────────────────────────────────────────────────
  const last4YearsLabels = computed(() => {
    const y = new Date().getFullYear()
    return [String(y - 3), String(y - 2), String(y - 1), String(y)]
  })

  const yearlyIncomeMap = computed(() => groupBy(collections.value, yearKey))
  const yearlyExpenseMap = computed(() => groupBy(expenses.value, yearKey))

  // ── Expense by category (current month) ───────────────────────────────────
  const currentMonthKey = computed(() => yearMonthKey(new Date()))
  const expenseByCategory = computed(() => {
    const result: Partial<Record<ExpenseCategory, number>> = {}
    for (const e of expenses.value) {
      if (yearMonthKey(new Date(e.date)) === currentMonthKey.value) {
        result[e.category] = (result[e.category] ?? 0) + e.amount
      }
    }
    return result
  })

  // ── This month quick stats ─────────────────────────────────────────────────
  const thisMonthIncome = computed(() => monthlyIncomeMap.value[currentMonthKey.value] ?? 0)
  const thisMonthExpenses = computed(() => monthlyExpenseMap.value[currentMonthKey.value] ?? 0)
  const thisMonthNet = computed(() => thisMonthIncome.value - thisMonthExpenses.value)

  // ── CRUD ───────────────────────────────────────────────────────────────────
  function addCollection(entry: Omit<FinanceCollection, 'id'>) {
    collections.value.push({ ...entry, id: String(Date.now()) })
    useToast().success('Collection recorded')
  }

  function addExpense(entry: Omit<FinanceExpense, 'id'>) {
    expenses.value.push({ ...entry, id: String(Date.now()) })
    useToast().success('Expense recorded')
  }

  function deleteCollection(id: string) {
    const existed = collections.value.some((c) => c.id === id)
    collections.value = collections.value.filter((c) => c.id !== id)
    if (existed) useToast().success('Collection deleted')
  }

  function deleteExpense(id: string) {
    const existed = expenses.value.some((e) => e.id === id)
    expenses.value = expenses.value.filter((e) => e.id !== id)
    if (existed) useToast().success('Expense deleted')
  }

  // ── Report rows (for export) ───────────────────────────────────────────────
  function reportRows(period: 'weekly' | 'monthly' | 'quarterly' | 'yearly') {
    let labels: string[]
    let incMap: Record<string, number>
    let expMap: Record<string, number>

    if (period === 'weekly') {
      labels = last8WeeksLabels.value
      incMap = weeklyIncomeMap.value
      expMap = weeklyExpenseMap.value
    } else if (period === 'monthly') {
      labels = last12MonthsLabels.value
      incMap = monthlyIncomeMap.value
      expMap = monthlyExpenseMap.value
    } else if (period === 'quarterly') {
      labels = last8QuartersLabels.value
      incMap = quarterlyIncomeMap.value
      expMap = quarterlyExpenseMap.value
    } else {
      labels = last4YearsLabels.value
      incMap = yearlyIncomeMap.value
      expMap = yearlyExpenseMap.value
    }

    return labels.map((l) => {
      const income = incMap[l] ?? 0
      const expense = expMap[l] ?? 0
      return { Period: l, Income: income, Expenses: expense, Net: income - expense }
    })
  }

  return {
    collections,
    expenses,
    totalIncome,
    totalExpenses,
    netBalance,
    last8WeeksLabels,
    weeklyIncomeMap,
    weeklyExpenseMap,
    last12MonthsLabels,
    monthlyIncomeMap,
    monthlyExpenseMap,
    last8QuartersLabels,
    quarterlyIncomeMap,
    quarterlyExpenseMap,
    last4YearsLabels,
    yearlyIncomeMap,
    yearlyExpenseMap,
    expenseByCategory,
    thisMonthIncome,
    thisMonthExpenses,
    thisMonthNet,
    addCollection,
    addExpense,
    deleteCollection,
    deleteExpense,
    reportRows,
  }
})
