<script setup lang="ts">
import type { ChartData } from 'chart.js'
import type { FinanceCollection, FinanceExpense, ExpenseCategory } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Finance', description: 'Church finance and accounting management.' })

const { setHeader } = usePageHeader()
const financeStore = useFinanceStore()
const settingsStore = useChurchSettingsStore()
const { exportCSV } = useExportCSV()
const { download: downloadFinancePdf } = useFinancePdf()
const toast = useToast()

onMounted(() => {
  setHeader('Finance & Accounting', 'Track income, expenses and financial reports')
  financeStore.load()
})

// ─── Active report period ─────────────────────────────────────────────────────
const activePeriod = ref<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly')
const periodTabs = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
]

// ─── Chart data (income vs expenses by period) ────────────────────────────────
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

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
        backgroundColor: chartStatus.positive,
        borderRadius: 2,
      },
      {
        label: 'Expenses',
        data: labels.map((l) => expMap[l] ?? 0),
        backgroundColor: chartStatus.negative,
        borderRadius: 2,
      },
    ],
  }
})

// ─── Donut chart (expenses by category this month) ───────────────────────────
const categoryColors: Record<ExpenseCategory, string> = {
  Building: chartPalette.bookcloth,
  Evangelism: chartPalette.plum,
  Welfare: chartPalette.teal,
  Technical: chartPalette.ink,
  Youth: chartPalette.margin,
  Preacher: chartPalette.gilt,
  Edification: chartPalette.clay,
  Media: '#5c574c',
  Others: chartPalette.slate,
}

const donutData = computed<ChartData<'doughnut'>>(() => {
  const cat = financeStore.expenseByCategory
  const entries = Object.entries(cat) as [ExpenseCategory, number][]
  return {
    labels: entries.map(([k]) => k),
    datasets: [
      {
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(([k]) => categoryColors[k]),
        borderWidth: 0,
      },
    ],
  }
})

// ─── Summary table rows ───────────────────────────────────────────────────────
// `reportRows` emits one row per period in the range whether or not anything was
// recorded, so its length says nothing about whether there is data. Ask the
// underlying records instead — otherwise the report shows a wall of zeroes.
const summaryRows = computed(() => financeStore.reportRows(activePeriod.value))
const hasFinanceData = computed(
  () => financeStore.collections.length > 0 || financeStore.expenses.length > 0
)

// ─── Recent transactions (combined, sorted desc) ──────────────────────────────
const recentActivity = computed(() => {
  const cols = financeStore.collections.map((c) => ({
    id: c.id,
    date: c.date,
    type: 'income' as const,
    description: c.description ?? 'Collection',
    amount: c.amount,
  }))
  const exps = financeStore.expenses.map((e) => ({
    id: e.id,
    date: e.date,
    type: 'expense' as const,
    description: `${e.category} – ${e.description}`,
    amount: e.amount,
  }))
  // No slice: the table pages instead, so older entries stay reachable.
  return [...cols, ...exps].sort((a, b) => b.date.localeCompare(a.date))
})

const {
  page: txPage,
  total: txTotal,
  totalPages: txTotalPages,
  paginated: pagedActivity,
  rangeStart: txFrom,
  rangeEnd: txTo,
} = usePagination(recentActivity, 10)

// ─── Format helpers ───────────────────────────────────────────────────────────
function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 })
}

function fmtDate(d: string) {
  return formatDate(d, 'short')
}

// ─── Export modal ─────────────────────────────────────────────────────────────
const showExport = ref(false)

const today = new Date().toISOString().slice(0, 10)
const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  .toISOString()
  .slice(0, 10)

const exportRange = reactive({ from: oneYearAgo, to: today })
const exportRangeErrors = reactive({ from: '', to: '' })

const exportPreviewIncome = computed(() => {
  if (!exportRange.from || !exportRange.to) return 0
  return financeStore.collections.filter(
    (c) => c.date >= exportRange.from && c.date <= exportRange.to
  ).length
})

const exportPreviewExpenses = computed(() => {
  if (!exportRange.from || !exportRange.to) return 0
  return financeStore.expenses.filter((e) => e.date >= exportRange.from && e.date <= exportRange.to)
    .length
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
  const allRows = [...incomeRows, ...expenseRows].sort((a, b) => a.Date.localeCompare(b.Date))

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
    {
      Date: '',
      Type: '',
      Category: '',
      Description: '',
      'Amount (₦)': '',
      Collector: '',
      'Running Balance (₦)': '',
    },
    {
      Date: 'SUMMARY',
      Type: '',
      Category: '',
      Description: 'Total Income',
      'Amount (₦)': totalIncome,
      Collector: '',
      'Running Balance (₦)': '',
    },
    {
      Date: '',
      Type: '',
      Category: '',
      Description: 'Total Expenses',
      'Amount (₦)': totalExpenses,
      Collector: '',
      'Running Balance (₦)': '',
    },
    {
      Date: '',
      Type: '',
      Category: '',
      Description: 'Net Balance',
      'Amount (₦)': totalIncome - totalExpenses,
      Collector: '',
      'Running Balance (₦)': '',
    },
  ]

  exportCSV(rows, `finance-report-${from}-to-${to}`)
  showExport.value = false
}

function doExportPdf() {
  exportRangeErrors.from = exportRange.from ? '' : 'Start date is required'
  exportRangeErrors.to = exportRange.to ? '' : 'End date is required'
  if (exportRangeErrors.from || exportRangeErrors.to) return
  if (exportRange.from > exportRange.to) {
    exportRangeErrors.to = 'End date must be after start date'
    return
  }

  const from = exportRange.from
  const to = exportRange.to
  const collectionsInRange = financeStore.collections.filter((c) => c.date >= from && c.date <= to)
  const expensesInRange = financeStore.expenses.filter((e) => e.date >= from && e.date <= to)

  // Carry-forward: net of all entries strictly before the start of the range.
  const priorIncome = financeStore.collections
    .filter((c) => c.date < from)
    .reduce((s, c) => s + c.amount, 0)
  const priorExpenses = financeStore.expenses
    .filter((e) => e.date < from)
    .reduce((s, e) => s + e.amount, 0)
  const balanceBroughtForward = priorIncome - priorExpenses

  downloadFinancePdf(
    {
      churchName: settingsStore.settings.name,
      churchLocation: settingsStore.settings.address,
      from,
      to,
      collections: collectionsInRange,
      expenses: expensesInRange,
      balanceBroughtForward,
    },
    `finance-report-${from}-to-${to}.pdf`
  )
  toast.success('Financial report exported')
  showExport.value = false
}

// ─── Add Collection modal ─────────────────────────────────────────────────────
const showAddCollection = ref(false)
const newCollection = reactive<Omit<FinanceCollection, 'id'>>({
  date: '',
  amount: 0,
  description: '',
})
const collectionErrors = reactive({ date: '', amount: '' })

const { isPending, run } = usePendingAction()

const { confirm } = useConfirm()

async function removeEntry(tx: {
  id: string
  type: string
  description?: string
  amount?: number
}) {
  const kind = tx.type === 'income' ? 'collection' : 'expense'
  const ok = await confirm({
    title: `Delete this ${kind}?`,
    // Names the amount as well as the description: these are the books, and deleting the wrong
    // line is the kind of mistake that only shows up when the figures stop reconciling.
    message: [
      tx.description,
      typeof tx.amount === 'number' ? `₦${tx.amount.toLocaleString('en-NG')}` : null,
    ]
      .filter(Boolean)
      .join(' — ')
      .concat('. This cannot be undone.'),
    confirmLabel: 'Delete',
  })
  if (!ok) return
  await run(tx.id, () =>
    (tx.type === 'income'
      ? financeStore.deleteCollection(tx.id)
      : financeStore.deleteExpense(tx.id)
    ).catch(() => {})
  )
}

async function saveCollection() {
  collectionErrors.date = newCollection.date ? '' : 'Date is required'
  collectionErrors.amount = newCollection.amount > 0 ? '' : 'Amount must be > 0'
  if (collectionErrors.date || collectionErrors.amount) return
  try {
    await financeStore.addCollection({ ...newCollection })
  } catch {
    return // Store already surfaced the reason; keep the entry on screen.
  }
  showAddCollection.value = false
  Object.assign(newCollection, { date: '', amount: 0, description: '' })
  Object.assign(collectionErrors, { date: '', amount: '' })
}

// ─── Add Expense modal ────────────────────────────────────────────────────────
const showAddExpense = ref(false)
const newExpense = reactive<Omit<FinanceExpense, 'id'>>({
  date: '',
  amount: 0,
  category: 'Building',
  description: '',
})
const expenseErrors = reactive({ date: '', amount: '', description: '' })

const expenseCategoryOptions = [
  { label: 'Building', value: 'Building' },
  { label: 'Evangelism', value: 'Evangelism' },
  { label: 'Welfare', value: 'Welfare' },
  { label: 'Technical', value: 'Technical' },
  { label: 'Youth', value: 'Youth' },
  { label: 'Preacher', value: 'Preacher' },
  { label: 'Edification', value: 'Edification' },
  { label: 'Media', value: 'Media' },
  { label: 'Others', value: 'Others' },
]

async function saveExpense() {
  expenseErrors.date = newExpense.date ? '' : 'Date is required'
  expenseErrors.amount = newExpense.amount > 0 ? '' : 'Amount must be > 0'
  expenseErrors.description = newExpense.description.trim() ? '' : 'Description is required'
  if (expenseErrors.date || expenseErrors.amount || expenseErrors.description) return
  try {
    await financeStore.addExpense({ ...newExpense })
  } catch {
    return // Store already surfaced the reason; keep the entry on screen.
  }
  showAddExpense.value = false
  Object.assign(newExpense, { date: '', amount: 0, category: 'Building', description: '' })
  Object.assign(expenseErrors, { date: '', amount: '', description: '' })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header actions -->
    <Teleport defer to="#admin-header-actions">
      <div class="flex flex-wrap gap-2">
        <Button variant="secondary" @click="showAddExpense = true">
          <template #icon-left><Icon icon="mdi:minus-circle-outline" /></template>
          Record Expense
        </Button>
        <Button @click="showAddCollection = true">
          <template #icon-left><Icon icon="mdi:plus-circle-outline" /></template>
          Add Collection
        </Button>
      </div>
    </Teleport>

    <!-- Top stat cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-sm border border-rule bg-surface p-5">
        <div class="flex items-start justify-between gap-2">
          <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Total Income</p>
          <Icon icon="mdi:trending-up" class="shrink-0 text-lg text-success" aria-hidden="true" />
        </div>
        <p class="num mt-3 font-display text-3xl text-ink">
          {{ fmt(financeStore.totalIncome) }}
        </p>
        <p class="mt-1 text-xs text-ink-subtle">All time</p>
      </div>

      <div class="rounded-sm border border-rule bg-surface p-5">
        <div class="flex items-start justify-between gap-2">
          <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Total Expenses</p>
          <Icon icon="mdi:trending-down" class="shrink-0 text-lg text-error" aria-hidden="true" />
        </div>
        <p class="num mt-3 font-display text-3xl text-ink">
          {{ fmt(financeStore.totalExpenses) }}
        </p>
        <p class="mt-1 text-xs text-ink-subtle">All time</p>
      </div>

      <div class="rounded-sm border border-rule bg-surface p-5">
        <div class="flex items-start justify-between gap-2">
          <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Net Balance</p>
          <Icon
            :icon="
              financeStore.netBalance >= 0 ? 'mdi:check-circle-outline' : 'mdi:alert-circle-outline'
            "
            :class="financeStore.netBalance >= 0 ? 'text-success' : 'text-error'"
            class="shrink-0 text-lg"
            aria-hidden="true"
          />
        </div>
        <p
          class="num mt-3 font-display text-3xl"
          :class="financeStore.netBalance >= 0 ? 'text-success' : 'text-error'"
        >
          {{ fmt(financeStore.netBalance) }}
        </p>
        <p class="mt-1 text-xs text-ink-subtle">All time</p>
      </div>

      <div class="rounded-sm border border-rule bg-surface p-5">
        <div class="flex items-start justify-between gap-2">
          <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">This Month Net</p>
          <Icon
            icon="mdi:calendar-month-outline"
            class="shrink-0 text-lg text-ink-subtle"
            aria-hidden="true"
          />
        </div>
        <p
          class="num mt-3 font-display text-3xl"
          :class="financeStore.thisMonthNet >= 0 ? 'text-success' : 'text-error'"
        >
          {{ fmt(financeStore.thisMonthNet) }}
        </p>
        <p class="num mt-1 text-xs text-ink-subtle">
          In: {{ fmt(financeStore.thisMonthIncome) }} / Out:
          {{ fmt(financeStore.thisMonthExpenses) }}
        </p>
      </div>
    </div>

    <!-- Chart + Donut row -->
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <!-- Income vs Expenses bar chart -->
      <div class="rounded-sm border border-rule bg-surface p-5 xl:col-span-2">
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h3 class="font-sans text-base font-semibold text-ink">Income vs Expenses</h3>
            <p class="mt-0.5 text-xs text-ink-muted">Collections against spending, by period</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Tabs v-model="activePeriod" :tabs="periodTabs" />
          </div>
        </div>
        <div class="mt-4">
          <BarChart v-if="hasFinanceData" :data="chartData" :height="240" />
          <EmptyState
            v-else
            icon="mdi:chart-bar"
            title="Nothing to chart yet"
            description="Income and expenses will be compared here once transactions are recorded."
          />
        </div>
      </div>

      <!-- Expense category donut -->
      <div class="flex flex-col rounded-sm border border-rule bg-surface p-5">
        <div>
          <h3 class="font-sans text-base font-semibold text-ink">Expenses This Month</h3>
          <p class="mt-0.5 text-xs text-ink-muted">By category</p>
        </div>
        <div class="mt-4">
          <DonutChart
            v-if="Object.keys(financeStore.expenseByCategory).length"
            :data="donutData"
            :height="180"
          />
          <p v-else class="py-10 text-center text-xs text-ink-subtle">
            No expenses recorded this month.
          </p>
        </div>
        <div class="mt-4 divide-y divide-rule border-t border-rule">
          <div
            v-for="[cat, amount] in Object.entries(financeStore.expenseByCategory)"
            :key="cat"
            class="flex items-center justify-between gap-3 py-1.5"
          >
            <div class="flex items-center gap-2">
              <span
                class="size-2.5 shrink-0 rounded-sm"
                :style="{ backgroundColor: categoryColors[cat as ExpenseCategory] }"
                aria-hidden="true"
              ></span>
              <span class="text-xs text-ink-muted">{{ cat }}</span>
            </div>
            <span class="num text-right text-xs font-medium text-ink">{{
              fmt(amount as number)
            }}</span>
          </div>
          <p
            v-if="!Object.keys(financeStore.expenseByCategory).length"
            class="py-3 text-center text-xs text-ink-subtle"
          >
            No expenses recorded this month.
          </p>
        </div>
      </div>
    </div>

    <!-- Report table -->
    <section class="overflow-hidden rounded-sm border border-rule bg-surface">
      <div class="flex items-center justify-between gap-3 border-b border-rule px-4 py-3">
        <h3 class="font-sans text-base font-semibold text-ink capitalize">
          {{ activePeriod }} Report
        </h3>
        <!-- Nothing to export while the ledger is empty. -->
        <Button
          variant="secondary"
          size="sm"
          :disabled="!hasFinanceData"
          @click="showExport = true"
        >
          <template #icon-left><Icon icon="mdi:upload-outline" /></template>
          Export Report
        </Button>
      </div>

      <EmptyState
        v-if="!hasFinanceData"
        icon="mdi:chart-box-outline"
        title="No financial records yet"
        description="Record a collection or an expense and the period report will build itself from there."
      />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm" role="table">
          <thead class="sticky top-0 z-[1] bg-surface-muted">
            <tr>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Period
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-right text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Income (₦)
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-right text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Expenses (₦)
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-right text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Net (₦)
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-right text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Surplus %
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rule">
            <tr
              v-for="row in summaryRows"
              :key="row.Period"
              class="transition-colors hover:bg-surface-muted/70"
            >
              <td class="num px-4 py-3 font-medium whitespace-nowrap text-ink">
                {{ row.Period }}
              </td>
              <td class="num px-4 py-3 text-right text-ink-muted">
                {{ row.Income.toLocaleString('en-NG') }}
              </td>
              <td class="num px-4 py-3 text-right text-ink-muted">
                {{ row.Expenses.toLocaleString('en-NG') }}
              </td>
              <td
                class="num px-4 py-3 text-right font-semibold"
                :class="row.Net >= 0 ? 'text-success' : 'text-error'"
              >
                {{ row.Net.toLocaleString('en-NG') }}
              </td>
              <td class="num px-4 py-3 text-right">
                <Badge
                  :variant="row.Income === 0 ? 'neutral' : row.Net >= 0 ? 'success' : 'danger'"
                  size="sm"
                >
                  {{ row.Income === 0 ? '—' : Math.round((row.Net / row.Income) * 100) + '%' }}
                </Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Recent activity -->
    <section class="overflow-hidden rounded-sm border border-rule bg-surface">
      <div class="border-b border-rule px-4 py-3">
        <h3 class="font-sans text-base font-semibold text-ink">Recent Transactions</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm" role="table">
          <thead class="sticky top-0 z-[1] bg-surface-muted">
            <tr>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Date
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Type
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Description
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-right text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Amount (₦)
              </th>
              <th class="w-10 border-b border-rule px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rule">
            <tr
              v-for="tx in pagedActivity"
              :key="tx.id"
              class="transition-colors hover:bg-surface-muted/70"
            >
              <td class="num px-4 py-3 whitespace-nowrap text-ink-muted">
                {{ fmtDate(tx.date) }}
              </td>
              <td class="px-4 py-3">
                <Badge :variant="tx.type === 'income' ? 'success' : 'danger'" size="sm">
                  <template #icon>
                    <Icon
                      :icon="tx.type === 'income' ? 'mdi:arrow-down' : 'mdi:arrow-up'"
                      class="text-[10px]"
                    />
                  </template>
                  {{ tx.type === 'income' ? 'Income' : 'Expense' }}
                </Badge>
              </td>
              <td class="px-4 py-3 text-ink">{{ tx.description }}</td>
              <td
                class="num px-4 py-3 text-right font-medium whitespace-nowrap"
                :class="tx.type === 'income' ? 'text-success' : 'text-error'"
              >
                {{ tx.type === 'income' ? '+' : '−' }}{{ tx.amount.toLocaleString('en-NG') }}
              </td>
              <td class="px-4 py-2 text-right">
                <button
                  class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-error-soft hover:text-error disabled:opacity-55"
                  :aria-label="`Delete ${tx.description}`"
                  :disabled="isPending(tx.id)"
                  @click="removeEntry(tx)"
                >
                  <Icon
                    :icon="isPending(tx.id) ? 'mdi:loading' : 'mdi:trash-can-outline'"
                    :class="['text-base', isPending(tx.id) && 'animate-spin']"
                  />
                </button>
              </td>
            </tr>
            <tr v-if="!pagedActivity.length">
              <td colspan="5" class="px-4">
                <EmptyState
                  icon="mdi:cash-multiple"
                  title="No transactions recorded yet"
                  description="Collections and expenses you record will appear here."
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination
        v-model:page="txPage"
        :total-pages="txTotalPages"
        :total="txTotal"
        :range-start="txFrom"
        :range-end="txTo"
        label="transactions"
      />
    </section>

    <!-- ── Add Collection modal ─────────────────────────────────────────────── -->
    <Modal v-model="showAddCollection" title="Record Weekly Collection" size="md">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink"
            >Date<span class="ml-0.5 text-error" aria-hidden="true">*</span></label
          >
          <input
            v-model="newCollection.date"
            type="date"
            class="num min-h-10 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
          <p v-if="collectionErrors.date" class="text-xs font-medium text-error">
            {{ collectionErrors.date }}
          </p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink"
            >Amount (₦)<span class="ml-0.5 text-error" aria-hidden="true">*</span></label
          >
          <input
            v-model.number="newCollection.amount"
            type="number"
            min="0"
            placeholder="e.g. 75000"
            class="num min-h-10 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-right text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
          <p v-if="collectionErrors.amount" class="text-xs font-medium text-error">
            {{ collectionErrors.amount }}
          </p>
        </div>
        <div class="flex flex-col gap-1.5 sm:col-span-2">
          <label class="text-sm font-medium text-ink">Description</label>
          <input
            v-model="newCollection.description"
            type="text"
            placeholder="e.g. Sunday Collection, Special offering..."
            class="min-h-10 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="secondary" @click="showAddCollection = false">Cancel</Button>
          <Button :loading="financeStore.saving" @click="saveCollection">
            <template #icon-left><Icon icon="mdi:check" /></template>
            Save Collection
          </Button>
        </div>
      </template>
    </Modal>

    <!-- ── Add Expense modal ────────────────────────────────────────────────── -->
    <Modal v-model="showAddExpense" title="Record Expense" size="md">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink"
            >Date<span class="ml-0.5 text-error" aria-hidden="true">*</span></label
          >
          <input
            v-model="newExpense.date"
            type="date"
            class="num min-h-10 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
          <p v-if="expenseErrors.date" class="text-xs font-medium text-error">
            {{ expenseErrors.date }}
          </p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink"
            >Amount (₦)<span class="ml-0.5 text-error" aria-hidden="true">*</span></label
          >
          <input
            v-model.number="newExpense.amount"
            type="number"
            min="0"
            placeholder="e.g. 15000"
            class="num min-h-10 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-right text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
          <p v-if="expenseErrors.amount" class="text-xs font-medium text-error">
            {{ expenseErrors.amount }}
          </p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink"
            >Category<span class="ml-0.5 text-error" aria-hidden="true">*</span></label
          >
          <select
            v-model="newExpense.category"
            class="min-h-10 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          >
            <option v-for="opt in expenseCategoryOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-ink"
            >Description<span class="ml-0.5 text-error" aria-hidden="true">*</span></label
          >
          <input
            v-model="newExpense.description"
            type="text"
            placeholder="Brief description"
            class="min-h-10 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
          <p v-if="expenseErrors.description" class="text-xs font-medium text-error">
            {{ expenseErrors.description }}
          </p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="secondary" @click="showAddExpense = false">Cancel</Button>
          <Button :loading="financeStore.saving" @click="saveExpense">
            <template #icon-left><Icon icon="mdi:check" /></template>
            Save Expense
          </Button>
        </div>
      </template>
    </Modal>

    <!-- ── Export modal ─────────────────────────────────────────────────────── -->
    <Modal v-model="showExport" title="Export Financial Report" size="lg">
      <div class="flex flex-col gap-5">
        <!-- Date range -->
        <section>
          <h3 class="font-sans text-sm font-semibold text-ink">Select Date Range</h3>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-ink">From</label>
              <input
                v-model="exportRange.from"
                type="date"
                class="num min-h-10 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
              />
              <p v-if="exportRangeErrors.from" class="text-xs font-medium text-error">
                {{ exportRangeErrors.from }}
              </p>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-ink">To</label>
              <input
                v-model="exportRange.to"
                type="date"
                class="num min-h-10 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
              />
              <p v-if="exportRangeErrors.to" class="text-xs font-medium text-error">
                {{ exportRangeErrors.to }}
              </p>
            </div>
          </div>
        </section>

        <!-- Quick range shortcuts -->
        <section>
          <h3 class="t-label text-ink-muted">Quick Select</h3>
          <div class="mt-2 flex flex-wrap gap-2">
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
              class="inline-flex min-h-9 items-center rounded-md border border-rule-strong bg-surface px-3 text-xs font-medium text-ink transition-colors duration-150 hover:border-primary hover:bg-primary-soft hover:text-primary-ink"
              @click="preset.fn()"
            >
              {{ preset.label }}
            </button>
          </div>
        </section>

        <!-- Preview -->
        <section class="rounded-md border border-rule bg-surface-muted p-4">
          <h3 class="t-label text-ink-muted">Export Preview</h3>
          <div class="mt-3 grid grid-cols-3 divide-x divide-rule text-center">
            <div class="px-2">
              <p class="num font-sans text-xl font-semibold text-success">
                {{ exportPreviewIncome }}
              </p>
              <p class="mt-0.5 text-xs text-ink-muted">Income entries</p>
            </div>
            <div class="px-2">
              <p class="num font-sans text-xl font-semibold text-error">
                {{ exportPreviewExpenses }}
              </p>
              <p class="mt-0.5 text-xs text-ink-muted">Expense entries</p>
            </div>
            <div class="px-2">
              <p class="num font-sans text-xl font-semibold text-ink">
                {{ exportPreviewCount }}
              </p>
              <p class="mt-0.5 text-xs text-ink-muted">Total rows</p>
            </div>
          </div>
          <p class="mt-3 border-t border-rule pt-3 text-center text-xs text-ink-subtle">
            CSV will include: Date, Type, Category, Description, Amount, Running Balance + Summary
            footer
          </p>
        </section>
      </div>

      <template #footer>
        <div class="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" @click="showExport = false">Cancel</Button>
          <Button variant="secondary" :disabled="exportPreviewCount === 0" @click="doExportPdf">
            <template #icon-left><Icon icon="mdi:file-pdf-box" /></template>
            Export PDF
          </Button>
          <Button :disabled="exportPreviewCount === 0" @click="doExport">
            <template #icon-left><Icon icon="mdi:download-outline" /></template>
            Download CSV ({{ exportPreviewCount }} rows)
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>
