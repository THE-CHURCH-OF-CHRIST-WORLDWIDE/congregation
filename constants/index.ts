import type { Member, ServiceType, ExpenseCategory, RoleName, AppPage, AppAction } from '~/types'

// ─── Member ───────────────────────────────────────────────────────────────────

export const MEMBER_STATUSES: Member['status'][] = [
  'Active',
  'Inactive',
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
  'Building',
  'Evangelism',
  'Welfare',
  'Technical',
  'Youth',
  'Preacher',
  'Edification',
  'Media',
  'Others',
]

// ─── Youth schooling ──────────────────────────────────────────────────────────

/**
 * Year of study. Nigerian institutions count in hundreds, so `100`–`600` covers an
 * undergraduate run; the two trailing entries exist because a level is still worth recording
 * once someone is past the numbered years.
 *
 * Free text would be cheaper but unsortable — "200", "2nd year" and "Year 2" would all appear
 * for the same thing.
 */
export const YOUTH_LEVELS = [
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  'Postgraduate',
  'Graduated',
] as const

/** Qualification being read for. `Other` is the escape hatch, so the list need not be complete. */
export const YOUTH_PROGRAMS = [
  'Secondary School',
  'ND',
  'HND',
  "Bachelor's",
  "Master's",
  'PhD',
  'Apprenticeship',
  'Other',
] as const

// ─── Roles & Permissions ──────────────────────────────────────────────────────

export const ROLE_NAMES: RoleName[] = [
  'Super Admin',
  'Elder',
  'Deacon',
  'Preacher',
  'Secretary',
  'Youth Leader',
  'Financial Secretary',
  'Content Editor',
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

// ─── Route visibility ─────────────────────────────────────────────────────────

/**
 * Routes that exist on staging and local development but not in production.
 *
 * Add a path here and it disappears from production: the route itself 404s, and any nav link
 * driven by an array (the admin sidebar, the footer's link lists) stops rendering. Matching is by
 * path segment, so `/admin/finance` also covers `/admin/finance/reports` — but not
 * `/admin/finance-archive`.
 *
 * ```ts
 * export const STAGING_ONLY_ROUTES: string[] = [
 *   '/admin/finance',   // and everything beneath it
 *   '/salvation',
 * ]
 * ```
 *
 * This hides pages; it does not secure them. The code still ships in the production bundle, so
 * anyone can read it. Anything that must not be reachable has to be enforced by
 * `firestore.rules`, not by this list.
 */
export const STAGING_ONLY_ROUTES: string[] = []

/**
 * Public nav items an admin can individually show or hide, from Admin → Settings → Navigation.
 *
 * Unlike `STAGING_ONLY_ROUTES` (an env-based, developer-edited list), this is backed by
 * `ChurchSettings.navVisibility` in Firestore and editable at runtime. `path` is the route base
 * `middleware/nav-visibility.global.ts` guards when an item is off — matched the same way as
 * `STAGING_ONLY_ROUTES`, by segment prefix. `path: null` means the item is a same-page anchor
 * (Contact Us lives on the landing page) with no separate route to block; turning it off only
 * removes the nav link.
 *
 * `home` is special-cased by the middleware: turning it off does not 404 `/` — unlike every
 * other item here, `/` has nowhere else to send a visitor, so the middleware instead redirects
 * it to the first *other* item in this list that is both enabled and reachable, in the order
 * below. That item effectively becomes the site's landing page. If nothing else is enabled, `/`
 * is left alone rather than breaking the site entirely.
 */
export type NavVisibilityKey =
  | 'home'
  | 'liveStreams'
  | 'teachings'
  | 'events'
  | 'lectureship'
  | 'gallery'
  | 'aboutUs'
  | 'register'
  | 'contactUs'

export const NAV_VISIBILITY_ITEMS: { key: NavVisibilityKey; label: string; path: string | null }[] =
  [
    { key: 'home', label: 'Home', path: '/' },
    { key: 'liveStreams', label: 'Live Streams', path: '/live-streams' },
    { key: 'teachings', label: 'Teachings', path: '/teachings' },
    { key: 'events', label: 'Events', path: '/events' },
    { key: 'lectureship', label: 'Lectureship', path: '/lectureship' },
    { key: 'gallery', label: 'Gallery', path: '/gallery' },
    { key: 'aboutUs', label: 'About Us', path: '/about-us' },
    { key: 'register', label: 'Member Registration', path: '/register' },
    { key: 'contactUs', label: 'Contact Us', path: null },
  ]
