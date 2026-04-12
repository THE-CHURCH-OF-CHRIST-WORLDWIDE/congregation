export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  address: string
}

export interface Member {
  id: string
  name: string
  gender: 'Male' | 'Female'
  phone: string
  email: string
  dob?: string
  status: 'Active' | 'Backslider' | 'Weak' | 'Distant' | 'Withdrawal' | 'Disfellowshipped' | 'Transfer' | 'Late'
  absenceCount: number
  avatar?: string
  // Extended profile
  churchNumber?: string
  maritalStatus?: string
  dateOfBaptism?: string
  dateJoined?: string
  // Place of origin
  country?: string
  state?: string
  localGovernment?: string
  village?: string
  // Place of residence
  address?: string
  occupation?: string
  // Emergency contact
  emergencyContact?: EmergencyContact
}

export interface AttendanceRecord {
  id: string
  memberId: string
  serviceId: string
  date: string
  present: boolean
  serviceType: string
}

export interface Sermon {
  id: string
  type: string
  date: string
  preacher: string
  topic: string
  scripture: string
  description: string
  thumbnail?: string
  documentFile?: string
  categories: string[]
  createdAt: string
  videoAttendees?: number
}

export interface MonthlyAttendanceSummary {
  memberId: string
  month: string
  year: number
  sessionsTotal: number
  sessionsPresent: number
  percentage: number
}

export type ServiceType =
  | 'Sunday Worship'
  | 'Sunday School'
  | 'Bible Class'
  | 'Prayer Meeting'
  | 'Youth Class'
  | 'Singing Practice'
  | 'Evangelism'
  | "Leaders' Class"

export type ExpenseCategory = 'Maintenance' | 'Utilities' | 'Welfare' | 'Outreach' | 'Stationery' | 'Other'

export interface FinanceCollection {
  id: string
  date: string
  amount: number
  description?: string
  collector?: string
}

export interface FinanceExpense {
  id: string
  date: string
  amount: number
  category: ExpenseCategory
  description: string
}

// ─── Roles & Permissions ─────────────────────────────────────────────────────
export type AppPage =
  | 'Dashboard'
  | 'Nominal Roll'
  | 'Youth'
  | 'Attendance'
  | 'Teachings'
  | 'Events'
  | 'Finance'
  | 'Settings'

export type AppAction = 'view' | 'add' | 'edit' | 'delete' | 'export'

export type PagePermissions = Partial<Record<AppAction, boolean>>
export type RolePermissions = Partial<Record<AppPage, PagePermissions>>

export type RoleName =
  | 'Super Admin'
  | 'Elder'
  | 'Deacon'
  | 'Preacher'
  | 'Secretary'
  | 'Youth Leader'
  | 'Financial Secretary'

export interface ChurchRole {
  id: string
  name: RoleName
  color: string
  description: string
  permissions: RolePermissions
}

export interface RoleAssignment {
  id: string
  memberId: string
  roleId: string
  /** Optional per-member overrides on top of role defaults */
  customPermissions?: RolePermissions
  assignedAt: string
}

export interface MemberFilters {
  search: string
  gender: string
  status: string
  tab: 'all' | 'brothers' | 'sisters' | 'active' | 'inactive' | 'disfellowshipped' | 'transfer' | 'weak' | 'late'
}

export interface ServiceAttendanceStats {
  serviceType: ServiceType
  count: number
  change: number
  icon: string
}

export interface MonthlyServiceCard {
  month: string
  monthIndex: number
  year: number
  serviceType: ServiceType
  attendancePercent: number
  sessionsTotal: number
  present: number
}
