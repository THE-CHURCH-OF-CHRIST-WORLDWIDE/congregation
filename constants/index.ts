import type { Member, ServiceType, ExpenseCategory, RoleName, AppPage, AppAction } from '~/types'

// ─── Member ───────────────────────────────────────────────────────────────────

export const MEMBER_STATUSES: Member['status'][] = [
  'Active',
  'Backslider',
  'Weak',
  'Distant',
  'Withdrawal',
  'Disfellowshipped',
  'Transfer',
  'Late',
]

/** Statuses excluded from the default "All Members" view */
export const HIDDEN_STATUSES: Member['status'][] = ['Late']

export const MEMBER_GENDERS = ['Male', 'Female'] as const
export type Gender = (typeof MEMBER_GENDERS)[number]

export const MEMBER_TABS = [
  'all',
  'brothers',
  'sisters',
  'active',
  'inactive',
  'disfellowshipped',
  'transfer',
  'weak',
  'late',
] as const

export const MARITAL_STATUSES = ['Single', 'Married', 'Widowed', 'Divorced'] as const

// ─── Services ─────────────────────────────────────────────────────────────────

export const SERVICE_TYPES: ServiceType[] = [
  'Sunday Worship',
  'Sunday School',
  'Bible Class',
  'Prayer Meeting',
  'Youth Class',
  'Singing Practice',
  'Evangelism',
  "Leaders' Class",
]

/**
 * Each service's metadata: URL slug and the day of the week it meets
 * (0 = Sunday, 1 = Monday, ..., 6 = Saturday). The slug is the canonical
 * identifier used in routes like /admin/attendance/[service].
 */
export interface ServiceConfig {
  name: ServiceType
  slug: string
  dayOfWeek: number
}

export const SERVICE_CONFIGS: ServiceConfig[] = [
  { name: 'Sunday Worship', slug: 'sunday-worship', dayOfWeek: 0 },
  { name: 'Sunday School', slug: 'sunday-school', dayOfWeek: 0 },
  { name: 'Bible Class', slug: 'bible-class', dayOfWeek: 3 }, // Wednesday
  { name: 'Prayer Meeting', slug: 'prayer-meeting', dayOfWeek: 5 }, // Friday
  { name: 'Youth Class', slug: 'youth-class', dayOfWeek: 6 }, // Saturday
  { name: 'Singing Practice', slug: 'singing-practice', dayOfWeek: 6 },
  { name: 'Evangelism', slug: 'evangelism', dayOfWeek: 5 },
  { name: "Leaders' Class", slug: 'leaders-class', dayOfWeek: 1 }, // Monday
]

export function serviceBySlug(slug: string): ServiceConfig | undefined {
  return SERVICE_CONFIGS.find((s) => s.slug === slug)
}

export function serviceByName(name: string): ServiceConfig | undefined {
  return SERVICE_CONFIGS.find((s) => s.name === name)
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Maintenance',
  'Utilities',
  'Welfare',
  'Outreach',
  'Stationery',
  'Other',
]

// ─── Roles & Permissions ──────────────────────────────────────────────────────

export const ROLE_NAMES: RoleName[] = [
  'Super Admin',
  'Elder',
  'Deacon',
  'Preacher',
  'Secretary',
  'Youth Leader',
  'Financial Secretary',
]

export const APP_PAGES: AppPage[] = [
  'Dashboard',
  'Nominal Roll',
  'Youth',
  'Attendance',
  'Teachings',
  'Events',
  'Finance',
  'Settings',
]

export const APP_ACTIONS: AppAction[] = ['view', 'add', 'edit', 'delete', 'export']

// ─── Church identity ──────────────────────────────────────────────────────────

export const CHURCH_NAME = 'Church of Christ'
export const CHURCH_ADDRESS = '7b Esa Atan Extension, Ikot Ekpene, Akwa Ibom State, Nigeria'
export const CHURCH_ADDRESS_SHORT = '7b Esa Atan Extension'
export const CHURCH_CITY = 'Ikot Ekpene'
export const CHURCH_STATE = 'Akwa Ibom State'
export const CHURCH_COUNTRY = 'Nigeria'
export const CHURCH_PHONE = '+234 803 000 0000'
export const CHURCH_EMAIL = 'info@churchofchrist.org'
export const CHURCH_SCRIPTURE = 'Romans 16:16'

// ─── Routing ──────────────────────────────────────────────────────────────────

export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about-us',
  EVENTS: '/events',
  LIVE_STREAMS: '/live-streams',
  SERMONS: '/teachings/sermons',
  SUNDAY_SCHOOL: '/teachings/sunday-school',
  LOGIN: '/login',
} as const

export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  NOMINAL_ROLL: '/admin/nominal-roll',
  ATTENDANCE: '/admin/attendance',
  FINANCE: '/admin/finance',
  EVENTS: '/admin/events',
  TEACHINGS: '/admin/teachings',
  YOUTH: '/admin/youth',
  SETTINGS: '/admin/settings',
} as const
