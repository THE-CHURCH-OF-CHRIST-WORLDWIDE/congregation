export interface ParsedRow {
  // Raw values from CSV
  raw: Record<string, string>
  // Mapped member fields
  name: string
  gender: string
  phone: string
  email: string
  dob: string
  status: string
  maritalStatus: string
  dateOfBaptism: string
  dateJoined: string
  country: string
  state: string
  localGovernment: string
  village: string
  address: string
  occupation: string
  // Validation
  errors: string[]
  valid: boolean
}

const VALID_STATUSES = ['Active', 'Backslider', 'Weak', 'Distant', 'Withdrawal']
const VALID_GENDERS = ['Male', 'Female']

// Normalise a column header to a consistent key
function normalise(s: string) {
  return s.toLowerCase().replace(/[\s_\-/]/g, '')
}

// Map of possible CSV header names → field key
const HEADER_MAP: Record<string, keyof Omit<ParsedRow, 'raw' | 'errors' | 'valid'>> = {
  name: 'name', fullname: 'name',
  gender: 'gender', sex: 'gender',
  phone: 'phone', phonenumber: 'phone', mobile: 'phone', tel: 'phone',
  email: 'email', emailaddress: 'email',
  dob: 'dob', dateofbirth: 'dob', birthdate: 'dob',
  status: 'status', attendancestatus: 'status', memberstatus: 'status',
  maritalstatus: 'maritalStatus', marital: 'maritalStatus',
  dateofbaptism: 'dateOfBaptism', baptismdate: 'dateOfBaptism',
  dateofregistration: 'dateJoined', datejoined: 'dateJoined', registrationdate: 'dateJoined',
  country: 'country',
  state: 'state', stateoforigin: 'state',
  lga: 'localGovernment', localgovernment: 'localGovernment', localgovernmentarea: 'localGovernment',
  village: 'village',
  address: 'address', residentialaddress: 'address', fulladdress: 'address',
  occupation: 'occupation', job: 'occupation',
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

export function useImportCsv() {
  function parse(text: string): { headers: string[]; rows: ParsedRow[] } {
    const lines = text.split(/\r?\n/).filter((l) => l.trim())
    if (lines.length < 2) return { headers: [], rows: [] }

    const rawHeaders = parseCSVLine(lines[0]!)
    const headers = rawHeaders.map((h) => h.replace(/^"|"$/g, '').trim())

    // Build index → field map
    const colMap: Record<number, keyof Omit<ParsedRow, 'raw' | 'errors' | 'valid'>> = {}
    for (let i = 0; i < headers.length; i++) {
      const key = HEADER_MAP[normalise(headers[i]!)]
      if (key) colMap[i] = key
    }

    const rows: ParsedRow[] = []
    for (let li = 1; li < lines.length; li++) {
      const cells = parseCSVLine(lines[li]!)
      if (cells.every((c) => !c)) continue // skip blank rows

      const raw: Record<string, string> = {}
      for (let i = 0; i < headers.length; i++) {
        raw[headers[i]!] = cells[i] ?? ''
      }

      const row: ParsedRow = {
        raw,
        name: '', gender: '', phone: '', email: '', dob: '', status: '',
        maritalStatus: '', dateOfBaptism: '', dateJoined: '',
        country: '', state: '', localGovernment: '', village: '',
        address: '', occupation: '',
        errors: [], valid: false,
      }

      for (const [idxStr, field] of Object.entries(colMap)) {
        row[field] = cells[parseInt(idxStr)] ?? ''
      }

      // Validate
      const errs: string[] = []
      if (!row.name.trim()) errs.push('Name is required')
      if (!row.phone.trim()) errs.push('Phone is required')
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
        errs.push('Invalid email')
      if (row.gender && !VALID_GENDERS.includes(row.gender))
        errs.push(`Gender must be Male or Female`)
      if (row.status && !VALID_STATUSES.includes(row.status))
        errs.push(`Unknown status "${row.status}"`)

      // Normalise gender capitalisation
      if (row.gender) {
        const g = row.gender.trim()
        row.gender = g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
      }
      // Default status
      if (!row.status || !VALID_STATUSES.includes(row.status)) row.status = 'Active'
      // Default gender
      if (!VALID_GENDERS.includes(row.gender)) row.gender = 'Male'

      row.errors = errs
      row.valid = !errs.some((e) => e.includes('required') || e.includes('Invalid email'))
      rows.push(row)
    }

    return { headers, rows }
  }

  function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  return { parse, readFile }
}
