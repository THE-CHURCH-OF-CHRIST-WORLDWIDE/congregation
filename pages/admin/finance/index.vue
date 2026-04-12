<script setup lang="ts">
import type { ChartData } from 'chart.js'
import type { FinanceCollection, FinanceExpense, ExpenseCategory } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Finance', description: 'Church finance and accounting management.' })

const { setHeader } = usePageHeader()
const financeStore = useFinanceStore()
const { exportCSV } = useExportCSV()

onMounted(() => setHeader('Finance & Accounting', 'Track income, expenses and financial reports'))

// ─── Active report period ─────────────────────────────────────────────────────
const activePeriod = ref<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly')
const periodTabs = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
]

// ─── Chart data (income vs expenses by period) ────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function labelFor(key: string, period: string) {
  if (period === 'monthly') {
    const [, m] = key.split('-')
    return MONTH_NAMES[parseInt(m ?? '1', 10) - 1] ?? key
  }
  if (period === 'weekly') return key.replace(/^\d{4}-/, '')
  return key
}

const chartData = computed<ChartData<'bar'>>(() => {
  let labels: string[]
  let incMap: Record<string, number>
  let expMap: Record<string, number>

  if (activePeriod.value === 'weekly') {
    labels = financeStore.last8WeeksLabels
    incMap = financeStore.weeklyIncomeMap
    expMap = financeStore.weeklyExpenseMap
  } else if (activePeriod.value === 'monthly') {
    labels = financeStore.last12MonthsLabels
    incMap = financeStore.monthlyIncomeMap
    expMap = financeStore.monthlyExpenseMap
  } else if (activePeriod.value === 'quarterly') {
    labels = financeStore.last8QuartersLabels
    incMap = financeStore.quarterlyIncomeMap
    expMap = financeStore.quarterlyExpenseMap
  } else {
    labels = financeStore.last4YearsLabels
    incMap = financeStore.yearlyIncomeMap
    expMap = financeStore.yearlyExpenseMap
  }

  return {
    labels: labels.map((l) => labelFor(l, activePeriod.value)),
    datasets: [
      {
        label: 'Income',
        data: labels.map((l) => incMap[l] ?? 0),
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: labels.map((l) => expMap[l] ?? 0),
        backgroundColor: '#f87171',
        borderRadius: 6,
      },
    ],
  }
})

// ─── Donut chart (expenses by category this month) ───────────────────────────
const categoryColors: Record<ExpenseCategory, string> = {
  Maintenance: '#3b82f6',
  Utilities: '#f59e0b',
  Welfare: '#22c55e',
  Outreach: '#a855f7',
  Stationery: '#14b8a6',
  Other: '#94a3b8',
}

const donutData = computed<ChartData<'doughnut'>>(() => {
  const cat = financeStore.expenseByCategory
  const entries = Object.entries(cat) as [ExpenseCategory, number][]
  return {
    labels: entries.map(([k]) => k),
    datasets: [{
      data: entries.map(([, v]) => v),
      backgroundColor: entries.map(([k]) => categoryColors[k]),
      borderWidth: 0,
    }],
  }
})

// ─── Summary table rows ───────────────────────────────────────────────────────
const summaryRows = computed(() => financeStore.reportRows(activePeriod.value))

// ─── Recent transactions (combined, sorted desc) ──────────────────────────────
const recentActivity = computed(() => {
  const cols = financeStore.collections.map((c) => ({
    id: c.id, date: c.date, type: 'income' as const,
    description: c.description ?? 'Collection', amount: c.amount,
  }))
  const exps = financeStore.expenses.map((e) => ({
    id: e.id, date: e.date, type: 'expense' as const,
    description: `${e.category} – ${e.description}`, amount: e.amount,
  }))
  return [...cols, ...exps]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 15)
})

// ─── Format helpers ───────────────────────────────────────────────────────────
function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 })
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Export modal ─────────────────────────────────────────────────────────────
const showExport = ref(false)

const today = new Date().toISOString().slice(0, 10)
const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().slice(0, 10)

const exportRange = reactive({ from: oneYearAgo, to: today })
const exportRangeErrors = reactive({ from: '', to: '' })

const exportPreviewIncome = computed(() => {
  if (!exportRange.from || !exportRange.to) return 0
  return financeStore.collections.filter((c) => c.date >= exportRange.from && c.date <= exportRange.to).length
})

const exportPreviewExpenses = computed(() => {
  if (!exportRange.from || !exportRange.to) return 0
  return financeStore.expenses.filter((e) => e.date >= exportRange.from && e.date <= exportRange.to).length
})

const exportPreviewCount = computed(() => exportPreviewIncome.value + exportPreviewExpenses.value)

function setPreset(preset: 'week' | 'month' | 'quarter' | 'year' | '6months' | 'all') {
  const now = new Date()
  const toISO = (d: Date) => d.toISOString().slice(0, 10)
  exportRange.to = toISO(now)
  Object.assign(exportRangeErrors, { from: '', to: '' })

  if (preset === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    exportRange.from = toISO(start)
  } else if (preset === 'month') {
    exportRange.from = toISO(new Date(now.getFullYear(), now.getMonth(), 1))
  } else if (preset === 'quarter') {
    const qStart = Math.floor(now.getMonth() / 3) * 3
    exportRange.from = toISO(new Date(now.getFullYear(), qStart, 1))
  } else if (preset === 'year') {
    exportRange.from = toISO(new Date(now.getFullYear(), 0, 1))
  } else if (preset === '6months') {
    const start = new Date(now)
    start.setMonth(now.getMonth() - 6)
    exportRange.from = toISO(start)
  } else {
    // all time — find earliest record
    const all = [
      ...financeStore.collections.map((c) => c.date),
      ...financeStore.expenses.map((e) => e.date),
    ]
    exportRange.from = all.length ? all.sort()[0]! : toISO(new Date(now.getFullYear(), 0, 1))
  }
}

function doExport() {
  exportRangeErrors.from = exportRange.from ? '' : 'Start date is required'
  exportRangeErrors.to = exportRange.to ? '' : 'End date is required'
  if (exportRangeErrors.from || exportRangeErrors.to) return
  if (exportRange.from > exportRange.to) {
    exportRangeErrors.to = 'End date must be after start date'
    return
  }

  const from = exportRange.from
  const to = exportRange.to

  // Build unified rows: income first, then expenses, each sorted by date asc
  const incomeRows = financeStore.collections
    .filter((c) => c.date >= from && c.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((c) => ({
      Date: c.date,
      Type: 'Income',
      Category: 'Collection',
      Description: c.description ?? 'Collection',
      'Amount (₦)': c.amount,
      Collector: c.collector ?? '',
    }))

  const expenseRows = financeStore.expenses
    .filter((e) => e.date >= from && e.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      Date: e.date,
      Type: 'Expense',
      Category: e.category,
      Description: e.description,
      'Amount (₦)': e.amount,
      Collector: '',
    }))

  // All rows sorted by date
  const allRows = [...incomeRows, ...expenseRows].sort((a, b) =>
    a.Date.localeCompare(b.Date)
  )

  // Compute running balance
  let balance = 0
  const withBalance = allRows.map((r) => {
    balance += r.Type === 'Income' ? r['Amount (₦)'] : -r['Amount (₦)']
    return { ...r, 'Running Balance (₦)': balance }
  })

  // Summary footer rows
  const totalIncome = incomeRows.reduce((s, r) => s + r['Amount (₦)'], 0)
  const totalExpenses = expenseRows.reduce((s, r) => s + r['Amount (₦)'], 0)

  const rows: Record<string, unknown>[] = [
    ...withBalance,
    { Date: '', Type: '', Category: '', Description: '', 'Amount (₦)': '', Collector: '', 'Running Balance (₦)': '' },
    { Date: 'SUMMARY', Type: '', Category: '', Description: 'Total Income', 'Amount (₦)': totalIncome, Collector: '', 'Running Balance (₦)': '' },
    { Date: '', Type: '', Category: '', Description: 'Total Expenses', 'Amount (₦)': totalExpenses, Collector: '', 'Running Balance (₦)': '' },
    { Date: '', Type: '', Category: '', Description: 'Net Balance', 'Amount (₦)': totalIncome - totalExpenses, Collector: '', 'Running Balance (₦)': '' },
  ]

  exportCSV(rows, `finance-report-${from}-to-${to}`)
  showExport.value = false
}

// ─── Add Collection modal ─────────────────────────────────────────────────────
const showAddCollection = ref(false)
const newCollection = reactive<Omit<FinanceCollection, 'id'>>({ date: '', amount: 0, description: '' })
const collectionErrors = reactive({ date: '', amount: '' })

function saveCollection() {
  collectionErrors.date = newCollection.date ? '' : 'Date is required'
  collectionErrors.amount = newCollection.amount > 0 ? '' : 'Amount must be > 0'
  if (collectionErrors.date || collectionErrors.amount) return
  financeStore.addCollection({ ...newCollection })
  showAddCollection.value = false
  Object.assign(newCollection, { date: '', amount: 0, description: '' })
  Object.assign(collectionErrors, { date: '', amount: '' })
}

// ─── Add Expense modal ────────────────────────────────────────────────────────
const showAddExpense = ref(false)
const newExpense = reactive<Omit<FinanceExpense, 'id'>>({ date: '', amount: 0, category: 'Other', description: '' })
const expenseErrors = reactive({ date: '', amount: '', description: '' })

const expenseCategoryOptions = [
  { label: 'Maintenance', value: 'Maintenance' },
  { label: 'Utilities', value: 'Utilities' },
  { label: 'Welfare', value: 'Welfare' },
  { label: 'Outreach', value: 'Outreach' },
  { label: 'Stationery', value: 'Stationery' },
  { label: 'Other', value: 'Other' },
]

function saveExpense() {
  expenseErrors.date = newExpense.date ? '' : 'Date is required'
  expenseErrors.amount = newExpense.amount > 0 ? '' : 'Amount must be > 0'
  expenseErrors.description = newExpense.description.trim() ? '' : 'Description is required'
  if (expenseErrors.date || expenseErrors.amount || expenseErrors.description) return
  financeStore.addExpense({ ...newExpense })
  showAddExpense.value = false
  Object.assign(newExpense, { date: '', amount: 0, category: 'Other', description: '' })
  Object.assign(expenseErrors, { date: '', amount: '', description: '' })
}
</script>

<template>
  <div class="flex flex-col gap-5">

    <!-- Header actions -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div ></div>
      <div class="flex gap-2">
        <Button variant="secondary" @click="showAddExpense = true">
          <template #icon-left><Icon icon="mdi:minus-circle-outline" /></template>
          Record Expense
        </Button>
        <Button @click="showAddCollection = true">
          <template #icon-left><Icon icon="mdi:plus-circle-outline" /></template>
          Add Collection
        </Button>
      </div>
    </div>

    <!-- Top stat cards -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <Card>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-gray-500 font-medium">Total Income</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ fmt(financeStore.totalIncome) }}</p>
            <p class="text-xs text-gray-400 mt-1">All time</p>
          </div>
          <div class="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:trending-up" class="text-blue-600 text-lg" />
          </div>
        </div>
      </Card>

      <Card>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-gray-500 font-medium">Total Expenses</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ fmt(financeStore.totalExpenses) }}</p>
            <p class="text-xs text-gray-400 mt-1">All time</p>
          </div>
          <div class="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:trending-down" class="text-red-500 text-lg" />
          </div>
        </div>
      </Card>

      <Card>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-gray-500 font-medium">Net Balance</p>
            <p
              class="text-2xl font-bold mt-1"
              :class="financeStore.netBalance >= 0 ? 'text-green-600' : 'text-red-500'"
            >{{ fmt(financeStore.netBalance) }}</p>
            <p class="text-xs text-gray-400 mt-1">All time</p>
          </div>
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            :class="financeStore.netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'"
          >
            <Icon
              :icon="financeStore.netBalance >= 0 ? 'mdi:check-circle-outline' : 'mdi:alert-circle-outline'"
              :class="financeStore.netBalance >= 0 ? 'text-green-600' : 'text-red-500'"
              class="text-lg"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-gray-500 font-medium">This Month Net</p>
            <p
              class="text-2xl font-bold mt-1"
              :class="financeStore.thisMonthNet >= 0 ? 'text-green-600' : 'text-red-500'"
            >{{ fmt(financeStore.thisMonthNet) }}</p>
            <p class="text-xs text-gray-400 mt-1">
              In: {{ fmt(financeStore.thisMonthIncome) }} / Out: {{ fmt(financeStore.thisMonthExpenses) }}
            </p>
          </div>
          <div class="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:calendar-month-outline" class="text-purple-600 text-lg" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Chart + Donut row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <!-- Income vs Expenses bar chart -->
      <Card class="xl:col-span-2">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Income vs Expenses</h3>
          <div class="flex gap-2 flex-wrap">
            <Tabs v-model="activePeriod" :tabs="periodTabs" />
          </div>
        </div>
        <BarChart :data="chartData" :height="240" />
      </Card>

      <!-- Expense category donut -->
      <div class="bg-slate-800 rounded-xl p-4 flex flex-col">
        <h3 class="text-sm font-semibold text-white mb-1">Expenses This Month</h3>
        <p class="text-xs text-slate-400 mb-3">By category</p>
        <DonutChart :data="donutData" :height="180" />
        <div class="mt-3 space-y-1.5">
          <div
            v-for="([cat, amount]) in Object.entries(financeStore.expenseByCategory)"
            :key="cat"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-1.5">
              <span
                class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: categoryColors[cat as ExpenseCategory] }"
              ></span>
              <span class="text-xs text-slate-300">{{ cat }}</span>
            </div>
            <span class="text-xs text-white font-medium">{{ fmt(amount as number) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Report table -->
    <Card padding="none">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 class="text-sm font-semibold text-gray-800 capitalize">{{ activePeriod }} Report</h3>
        <Button variant="secondary" size="sm" @click="showExport = true">
          <template #icon-left><Icon icon="mdi:upload-outline" /></template>
          Export CSV
        </Button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm" role="table">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Period</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-gray-500">Income (₦)</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-gray-500">Expenses (₦)</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-gray-500">Net (₦)</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-gray-500">Surplus %</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in summaryRows"
              :key="row.Period"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 font-medium text-gray-700">{{ row.Period }}</td>
              <td class="px-4 py-3 text-right text-gray-600">{{ row.Income.toLocaleString('en-NG') }}</td>
              <td class="px-4 py-3 text-right text-gray-600">{{ row.Expenses.toLocaleString('en-NG') }}</td>
              <td
                class="px-4 py-3 text-right font-semibold"
                :class="row.Net >= 0 ? 'text-green-600' : 'text-red-500'"
              >{{ row.Net.toLocaleString('en-NG') }}</td>
              <td class="px-4 py-3 text-right">
                <Badge
                  :variant="row.Income === 0 ? 'neutral' : row.Net >= 0 ? 'success' : 'danger'"
                  size="sm"
                >
                  {{ row.Income === 0 ? '—' : Math.round((row.Net / row.Income) * 100) + '%' }}
                </Badge>
              </td>
            </tr>
            <tr v-if="!summaryRows.length">
              <td colspan="5" class="px-4 py-10 text-center text-gray-400">No data for this period</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Recent activity -->
    <Card padding="none">
      <div class="px-4 py-3 border-b border-gray-100">
        <h3 class="text-sm font-semibold text-gray-800">Recent Transactions</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm" role="table">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Type</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Description</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-gray-500">Amount (₦)</th>
              <th class="w-10 px-4 py-3" ></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in recentActivity"
              :key="tx.id"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ fmtDate(tx.date) }}</td>
              <td class="px-4 py-3">
                <Badge :variant="tx.type === 'income' ? 'success' : 'danger'" size="sm">
                  <template #icon>
                    <Icon :icon="tx.type === 'income' ? 'mdi:arrow-down' : 'mdi:arrow-up'" class="text-[10px]" />
                  </template>
                  {{ tx.type === 'income' ? 'Income' : 'Expense' }}
                </Badge>
              </td>
              <td class="px-4 py-3 text-gray-700">{{ tx.description }}</td>
              <td
                class="px-4 py-3 text-right font-medium"
                :class="tx.type === 'income' ? 'text-green-600' : 'text-red-500'"
              >
                {{ tx.type === 'income' ? '+' : '−' }}{{ tx.amount.toLocaleString('en-NG') }}
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  class="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  :aria-label="`Delete ${tx.description}`"
                  @click="tx.type === 'income' ? financeStore.deleteCollection(tx.id) : financeStore.deleteExpense(tx.id)"
                >
                  <Icon icon="mdi:trash-can-outline" class="text-base" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- ── Add Collection modal ─────────────────────────────────────────────── -->
    <Modal v-model="showAddCollection" title="Record Weekly Collection" size="md">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Date<span class="text-red-500 ml-0.5">*</span></label>
          <input
            v-model="newCollection.date"
            type="date"
            class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <p v-if="collectionErrors.date" class="text-xs text-red-500">{{ collectionErrors.date }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Amount (₦)<span class="text-red-500 ml-0.5">*</span></label>
          <input
            v-model.number="newCollection.amount"
            type="number"
            min="0"
            placeholder="e.g. 75000"
            class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <p v-if="collectionErrors.amount" class="text-xs text-red-500">{{ collectionErrors.amount }}</p>
        </div>
        <div class="sm:col-span-2 flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <input
            v-model="newCollection.description"
            type="text"
            placeholder="e.g. Sunday Collection, Special offering..."
            class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <Button variant="secondary" @click="showAddCollection = false">Cancel</Button>
          <Button @click="saveCollection">
            <template #icon-left><Icon icon="mdi:check" /></template>
            Save Collection
          </Button>
        </div>
      </template>
    </Modal>

    <!-- ── Add Expense modal ────────────────────────────────────────────────── -->
    <Modal v-model="showAddExpense" title="Record Expense" size="md">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Date<span class="text-red-500 ml-0.5">*</span></label>
          <input
            v-model="newExpense.date"
            type="date"
            class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <p v-if="expenseErrors.date" class="text-xs text-red-500">{{ expenseErrors.date }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Amount (₦)<span class="text-red-500 ml-0.5">*</span></label>
          <input
            v-model.number="newExpense.amount"
            type="number"
            min="0"
            placeholder="e.g. 15000"
            class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <p v-if="expenseErrors.amount" class="text-xs text-red-500">{{ expenseErrors.amount }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Category<span class="text-red-500 ml-0.5">*</span></label>
          <select
            v-model="newExpense.category"
            class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option v-for="opt in expenseCategoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Description<span class="text-red-500 ml-0.5">*</span></label>
          <input
            v-model="newExpense.description"
            type="text"
            placeholder="Brief description"
            class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <p v-if="expenseErrors.description" class="text-xs text-red-500">{{ expenseErrors.description }}</p>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <Button variant="secondary" @click="showAddExpense = false">Cancel</Button>
          <Button @click="saveExpense">
            <template #icon-left><Icon icon="mdi:check" /></template>
            Save Expense
          </Button>
        </div>
      </template>
    </Modal>

    <!-- ── Export modal ─────────────────────────────────────────────────────── -->
    <Modal v-model="showExport" title="Export Financial Report" size="md">
      <div class="flex flex-col gap-5">

        <!-- Date range -->
        <div>
          <p class="text-sm font-medium text-gray-700 mb-3">Select Date Range</p>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-500">From</label>
              <input
                v-model="exportRange.from"
                type="date"
                class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p v-if="exportRangeErrors.from" class="text-xs text-red-500">{{ exportRangeErrors.from }}</p>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-gray-500">To</label>
              <input
                v-model="exportRange.to"
                type="date"
                class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p v-if="exportRangeErrors.to" class="text-xs text-red-500">{{ exportRangeErrors.to }}</p>
            </div>
          </div>
        </div>

        <!-- Quick range shortcuts -->
        <div>
          <p class="text-xs font-medium text-gray-500 mb-2">Quick Select</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="preset in [
                { label: 'This Week', fn: () => setPreset('week') },
                { label: 'This Month', fn: () => setPreset('month') },
                { label: 'This Quarter', fn: () => setPreset('quarter') },
                { label: 'This Year', fn: () => setPreset('year') },
                { label: 'Last 6 Months', fn: () => setPreset('6months') },
                { label: 'All Time', fn: () => setPreset('all') },
              ]"
              :key="preset.label"
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-colors"
              @click="preset.fn()"
            >{{ preset.label }}</button>
          </div>
        </div>

        <!-- Preview -->
        <div class="rounded-xl bg-gray-50 border border-gray-100 p-4">
          <p class="text-xs font-medium text-gray-500 mb-2">Export Preview</p>
          <div class="grid grid-cols-3 gap-3 text-center">
            <div>
              <p class="text-lg font-bold text-blue-600">{{ exportPreviewIncome }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Income entries</p>
            </div>
            <div>
              <p class="text-lg font-bold text-red-500">{{ exportPreviewExpenses }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Expense entries</p>
            </div>
            <div>
              <p class="text-lg font-bold text-gray-800">{{ exportPreviewCount }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Total rows</p>
            </div>
          </div>
          <p class="text-xs text-gray-400 mt-3 text-center">
            CSV will include: Date, Type, Category, Description, Amount, Running Balance + Summary footer
          </p>
        </div>

      </div>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <Button variant="secondary" @click="showExport = false">Cancel</Button>
          <Button :disabled="exportPreviewCount === 0" @click="doExport">
            <template #icon-left><Icon icon="mdi:download-outline" /></template>
            Download CSV ({{ exportPreviewCount }} rows)
          </Button>
        </div>
      </template>
    </Modal>

  </div>
</template>
