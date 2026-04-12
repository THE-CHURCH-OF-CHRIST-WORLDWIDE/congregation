export function useExportCSV() {
  function exportCSV(data: Record<string, unknown>[], filename: string) {
    if (!data.length) return

    const firstRow = data[0]
    if (!firstRow) return
    const headers = Object.keys(firstRow)
    const rows = data.map((row) =>
      headers.map((h) => {
        const val = row[h]
        const str = val === null || val === undefined ? '' : String(val)
        return `"${str.replace(/"/g, '""')}"`
      }).join(',')
    )

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return { exportCSV }
}
