import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { FinanceCollection, FinanceExpense } from '~/types'

export interface FinanceReportOptions {
  churchName: string
  churchLocation: string
  /** Inclusive ISO date (YYYY-MM-DD). */
  from: string
  /** Inclusive ISO date (YYYY-MM-DD). */
  to: string
  collections: FinanceCollection[]
  expenses: FinanceExpense[]
  /** Carried over from the previous period. Optional — defaults to 0. */
  balanceBroughtForward?: number
  /** Benevolence amount disbursed in the period. Optional — defaults to 0. */
  benevolence?: number
  /** Optional special evangelism/medical fund block (matches the sample PDF). */
  evangelismFund?: {
    donations: number
    disbursed: number
  }
}

const NAVY = [30, 58, 95] as const // RGB tuple matching the sample PDF's header navy

// jsPDF's default Helvetica font has no glyph for the naira sign, so we render
// it as "N" with a strikethrough effect via "₦" string replacement. To keep
// numbers crisp we just use the "NGN" prefix or no prefix in cells; the
// section headers carry the currency context.
function fmt(n: number): string {
  return n.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function monthYearLabel(iso: string): string {
  const months = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ]
  const [y, m] = iso.split('-')
  if (!y || !m) return ''
  return `${months[parseInt(m, 10) - 1] ?? ''} ${y}`
}

export function useFinancePdf() {
  function generate(opts: FinanceReportOptions): jsPDF {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const marginX = 40
    let cursorY = 48

    // ── Title ────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(...NAVY)
    doc.text('Monthly Financial Summary - Income and Expenditure', pageWidth / 2, cursorY, {
      align: 'center',
    })
    cursorY += 28

    // ── Church identity rows ────────────────────────────────────────────────
    doc.setFontSize(10)
    doc.setTextColor(80)
    doc.setFont('helvetica', 'normal')
    const labelX = marginX
    const valueX = marginX + 120
    doc.text('Church Name:', labelX, cursorY)
    doc.setTextColor(20)
    doc.text(opts.churchName || '—', valueX, cursorY)
    doc.setDrawColor(200)
    doc.line(valueX, cursorY + 3, pageWidth - marginX, cursorY + 3)
    cursorY += 18

    doc.setTextColor(80)
    doc.text('Church Location:', labelX, cursorY)
    doc.setTextColor(20)
    doc.text(opts.churchLocation || '—', valueX, cursorY)
    doc.setDrawColor(200)
    doc.line(valueX, cursorY + 3, pageWidth - marginX, cursorY + 3)
    cursorY += 26

    // ── INCOME table ─────────────────────────────────────────────────────────
    const sortedCollections = [...opts.collections].sort((a, b) => a.date.localeCompare(b.date))
    const totalCash = 0 // cash/transfer split isn't tracked; we put the full amount under TOTAL.
    const totalTransfer = sortedCollections.reduce((s, c) => s + c.amount, 0)
    const totalIncome = totalCash + totalTransfer

    autoTable(doc, {
      startY: cursorY,
      margin: { left: marginX, right: marginX },
      head: [
        [{ content: 'INCOME', colSpan: 5, styles: { halign: 'center', fontSize: 11 } }],
        ['DATE', 'DESCRIPTION', 'CASH', 'TRANSFER', 'TOTAL'],
      ],
      body: sortedCollections.length
        ? sortedCollections.map((c) => [
            fmtDate(c.date),
            c.description || 'Collection/Giving',
            { content: '-', styles: { halign: 'right' } },
            { content: `NGN ${fmt(c.amount)}`, styles: { halign: 'right' } },
            { content: `NGN ${fmt(c.amount)}`, styles: { halign: 'right' } },
          ])
        : [['—', 'No income recorded in this period', '-', '-', '-']],
      foot: [
        [
          { content: 'TOTAL', colSpan: 2, styles: { halign: 'left', fontStyle: 'bold' } },
          { content: `NGN ${fmt(totalCash)}`, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: `NGN ${fmt(totalTransfer)}`, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: `NGN ${fmt(totalIncome)}`, styles: { halign: 'right', fontStyle: 'bold' } },
        ],
      ],
      headStyles: {
        fillColor: [...NAVY],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      footStyles: { fillColor: [...NAVY], textColor: 255 },
      bodyStyles: { fontSize: 9, valign: 'middle' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      theme: 'grid',
    })

    // @ts-expect-error — autoTable augments doc with lastAutoTable at runtime
    cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 24

    // ── EXPENDITURE table ────────────────────────────────────────────────────
    const sortedExpenses = [...opts.expenses].sort((a, b) => a.date.localeCompare(b.date))
    const totalExpenses = sortedExpenses.reduce((s, e) => s + e.amount, 0)

    autoTable(doc, {
      startY: cursorY,
      margin: { left: marginX, right: marginX },
      head: [
        [{ content: 'EXPENDITURE', colSpan: 3, styles: { halign: 'center', fontSize: 11 } }],
        ['DATE', 'DESCRIPTION', 'AMOUNT'],
      ],
      body: sortedExpenses.length
        ? sortedExpenses.map((e) => [
            fmtDate(e.date),
            { content: `${e.category} – ${e.description}`, styles: { halign: 'center' } },
            { content: `NGN ${fmt(e.amount)}`, styles: { halign: 'right' } },
          ])
        : [['—', 'No expenses recorded in this period', '-']],
      foot: [
        [
          { content: 'TOTAL', styles: { halign: 'left', fontStyle: 'bold' } },
          { content: '', styles: {} },
          {
            content: `NGN ${fmt(totalExpenses)}`,
            styles: { halign: 'right', fontStyle: 'bold' },
          },
        ],
      ],
      headStyles: {
        fillColor: [...NAVY],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      footStyles: { fillColor: [...NAVY], textColor: 255 },
      bodyStyles: { fontSize: 9, valign: 'middle' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      theme: 'grid',
    })

    // @ts-expect-error — autoTable augments doc with lastAutoTable at runtime
    cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 28

    // ── FINANCIAL SUMMARY heading ────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...NAVY)
    doc.text(`FINANCIAL SUMMARY - ${monthYearLabel(opts.from)}`, marginX, cursorY)
    cursorY += 12

    const balBF = opts.balanceBroughtForward ?? 0
    const benevolence = opts.benevolence ?? 0
    const closingBalance = balBF + totalIncome - totalExpenses - benevolence

    autoTable(doc, {
      startY: cursorY,
      margin: { left: marginX, right: marginX + (pageWidth - marginX * 2) / 2 },
      body: [
        ['BALANCE B/F', `NGN ${fmt(balBF)}`],
        ['INCOME', `NGN ${fmt(totalIncome)}`],
        ['EXPENDITURE', `NGN ${fmt(totalExpenses)}`],
        ['BENEVOLENCE', benevolence === 0 ? '-' : `NGN ${fmt(benevolence)}`],
        [
          {
            content: 'CLOSING BALANCE',
            styles: { fontStyle: 'bold', fillColor: [...NAVY], textColor: 255 },
          },
          {
            content: `NGN ${fmt(closingBalance)}`,
            styles: { fontStyle: 'bold', fillColor: [...NAVY], textColor: 255, halign: 'right' },
          },
        ],
      ],
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [241, 245, 249] },
        1: { halign: 'right' },
      },
      bodyStyles: { fontSize: 10 },
      theme: 'grid',
    })

    // @ts-expect-error — autoTable augments doc with lastAutoTable at runtime
    cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 16

    // ── Optional EVANGELISM (Medical) fund block ─────────────────────────────
    if (opts.evangelismFund) {
      const { donations, disbursed } = opts.evangelismFund
      const evClosing = donations - disbursed
      autoTable(doc, {
        startY: cursorY,
        margin: { left: marginX, right: marginX + (pageWidth - marginX * 2) / 2 },
        body: [
          [
            {
              content: 'EVANGELISM (Medical) Donations',
              styles: { fontStyle: 'bold', fillColor: [241, 245, 249] },
            },
            { content: `NGN ${fmt(donations)}`, styles: { halign: 'right' } },
          ],
          [
            { content: 'DISBURSED', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
            { content: `NGN ${fmt(disbursed)}`, styles: { halign: 'right' } },
          ],
          [
            {
              content: 'CLOSING BALANCE',
              styles: { fontStyle: 'bold', fillColor: [...NAVY], textColor: 255 },
            },
            {
              content: `NGN ${fmt(evClosing)}`,
              styles: { fontStyle: 'bold', fillColor: [...NAVY], textColor: 255, halign: 'right' },
            },
          ],
        ],
        bodyStyles: { fontSize: 10 },
        theme: 'grid',
      })
    }

    return doc
  }

  function download(opts: FinanceReportOptions, filename = 'finance-report.pdf') {
    const doc = generate(opts)
    doc.save(filename)
  }

  return { generate, download }
}
