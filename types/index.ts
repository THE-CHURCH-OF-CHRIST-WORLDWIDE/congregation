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
  status:
    | 'Active'
    | 'Backslider'
    | 'Weak'
    | 'Distant'
    | 'Withdrawal'
    | 'Disfellowshipped'
    | 'Transfer'
    | 'Late'
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
  // Previous congregation (transfers / newcomers)
  previousCongregation?: string
  previousMinisterPhone?: string
  // Emergency contact
  emergencyContact?: EmergencyContact
  /**
   * Schooling details, collected for youth (see `isYouth`) — most of the roll's 13–35s are in
   * a tertiary institution, and the Youth Leader needs to know who is on campus, in which hall,
   * and when they are due to leave.
   *
   * Stored on `Member` rather than a separate collection because youth membership is derived
   * from date of birth, not recorded: there is no youth document to hang them off. All optional,
   * so a member who never attended is simply blank rather than half-filled.
   */
  school?: string
  department?: string
  courseOfStudy?: string
  /** Qualification being read for, e.g. `HND`, `Bachelor's`. See `YOUTH_PROGRAMS`. */
  program?: string
  /** Year of study, e.g. `200`. See `YOUTH_LEVELS`. */
  level?: string
  hallOfResidence?: string
  /** Four-digit year, held as a string like the other date fields. */
  yearOfEntry?: string
  /** Four-digit year. Expected rather than actual for anyone still studying. */
  yearOfExit?: string
  /** Free-text note — anything the fixed fields have nowhere to put. */
  comment?: string
}

/**
 * A message left through the public "Send Us A Message" form.
 *
 * Anonymous visitors create these, so the collection is the app's one publicly writable
 * surface — see the shape constraints in `firestore.rules`. Staff read them in
 * Admin → Messages; `handled` records that somebody has dealt with it, rather than deleting
 * the message and losing the record of what was asked.
 */
export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  message: string
  /** ISO string once read back; `serverTimestamp()` on write. */
  submittedAt?: string
  /** Somebody on staff has read it. */
  read: boolean
  /** Somebody on staff has replied or otherwise dealt with it. */
  handled: boolean
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

export type ExpenseCategory =
  | 'Building'
  | 'Evangelism'
  | 'Welfare'
  | 'Technical'
  | 'Youth'
  | 'Preacher'
  | 'Edification'
  | 'Media'
  | 'Others'

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
  | 'Admin'
  | 'Elder'
  | 'Deacon'
  | 'Preacher'
  | 'Secretary'
  | 'Youth Leader'
  | 'Financial Secretary'

/** Ids of the built-in roles in `stores/roles.ts`. Firestore rules match on these strings. */
export type ChurchRoleId =
  | 'super-admin'
  | 'admin'
  | 'elder'
  | 'deacon'
  | 'preacher'
  | 'secretary'
  | 'youth-leader'
  | 'financial-secretary'

export interface ChurchRole {
  id: ChurchRoleId
  name: RoleName
  color: string
  description: string
  permissions: RolePermissions
}

/**
 * What kind of change an audit entry records. Namespaced `subject.verb` so the log can be
 * grouped and filtered without parsing prose.
 */
export type AuditAction =
  | 'member.create'
  | 'member.update'
  | 'member.delete'
  | 'settings.update'
  | 'role.permissions'
  | 'roleAssignment.create'
  | 'roleAssignment.update'
  | 'roleAssignment.delete'
  | 'access.grant'
  | 'access.revoke'
  | 'invitation.send'
  | 'invitation.revoke'
  | 'invitation.claim'
  | 'finance.collection.create'
  | 'finance.collection.delete'
  | 'finance.expense.create'
  | 'finance.expense.delete'
  | 'teaching.create'
  | 'teaching.update'
  | 'teaching.delete'
  | 'event.create'
  | 'event.update'
  | 'event.delete'
  | 'attendance.record'
  | 'message.read'
  | 'message.handled'
  | 'message.delete'

/**
 * One recorded change, stored append-only at `auditLog/{id}`.
 *
 * Written by the client, so treat it as an accountability record among trusted staff rather
 * than a tamper-proof trail: rules make it append-only and force `actorUid` to match the
 * caller, but nothing can compel a client to write an entry at all. See
 * docs/firebase-setup.md § Audit log.
 */
export interface AuditEntry {
  id: string
  action: AuditAction
  /** Firebase Auth uid of whoever made the change. Rules require this to be the caller. */
  actorUid: string
  actorEmail?: string
  /** Id of the affected document, where there is one. */
  targetId?: string
  /** Human-readable name of what changed, e.g. a member's name. */
  targetLabel?: string
  /** ISO string once read back; `serverTimestamp()` on write. */
  at?: string
}

/**
 * A pending invitation, stored at `invitations/{email}` with the email lower-cased as the
 * document id so rules can match it against the caller's token.
 *
 * The invitee claims it on first sign-in: the app creates their `users/{uid}` record with the
 * role named here, then deletes the invitation. Rules allow that self-claim only for a
 * verified email that matches an existing invitation, so an invitation is the only way an
 * account can acquire a role without a Super Admin writing it directly.
 */
export interface Invitation {
  email: string
  roleId: ChurchRoleId
  /** Nominal-roll record this account belongs to, carried through to `users/{uid}` on claim. */
  memberId?: string
  invitedBy?: string
  invitedAt: string
}

/**
 * A Firebase Auth account and the role it carries, stored at `users/{uid}`.
 *
 * This is the only thing that grants privilege: Firestore rules read this document to
 * decide whether a request may write. `RoleAssignment` is a separate, presentational
 * concept — it attaches roles to nominal-roll members, who may have no login at all.
 */
export interface AppUserRecord {
  uid: string
  email?: string
  roleId: ChurchRoleId
  /** Optional link to this person's nominal-roll record. */
  memberId?: string
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
  tab:
    | 'all'
    | 'brothers'
    | 'sisters'
    | 'active'
    | 'inactive'
    | 'disfellowshipped'
    | 'transfer'
    | 'weak'
    | 'late'
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
