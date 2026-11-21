/**
 * Minutes of a congregation business meeting, recorded by the Secretary at
 * Admin → Business Meetings and stored at `businessMeetings/{id}`.
 *
 * The shape follows the order a church business meeting actually runs in, so the editor, the
 * read view and the printed copy can all walk it top to bottom: details → attendance → opening →
 * previous minutes → matters arising → reports → new business → AOB → action points →
 * announcements → next meeting → closing → approval.
 */

export type MeetingType = 'regular' | 'special' | 'emergency' | 'annual'

/**
 * `draft` while the Secretary is still writing. `approved` once the minutes have been read and
 * adopted (usually at the next meeting); approved minutes are locked, and only an Admin or
 * Super Admin can reopen them — the Firestore rules enforce that, not just the UI.
 */
export type MinutesStatus = 'draft' | 'approved'

export type MotionOutcome = '' | 'carried' | 'defeated' | 'deferred' | 'withdrawn'

/**
 * One discussed item: a matter arising, a report, an agenda item, or any other business.
 * Every field but the title is optional — a report may carry no motion, and an item may be
 * noted without a decision.
 */
export interface MinuteItem {
  id: string
  title: string
  /** Who raised or presented it. */
  presentedBy: string
  discussion: string
  /** What was agreed. */
  resolution: string
  movedBy: string
  secondedBy: string
  outcome: MotionOutcome
}

export interface ActionPoint {
  id: string
  task: string
  assignedTo: string
  /** YYYY-MM-DD, or empty. */
  dueDate: string
  done: boolean
}

export interface BusinessMeeting {
  id: string

  // ── Details ──────────────────────────────────────────────────────────────
  title: string
  meetingType: MeetingType
  /** YYYY-MM-DD */
  date: string
  /** HH:mm — when the meeting was called to order. */
  startTime: string
  venue: string
  chairperson: string
  /** Who took these minutes. */
  secretary: string

  // ── Attendance ───────────────────────────────────────────────────────────
  present: string[]
  /** Absent with apology. */
  apologies: string[]
  /** Absent without apology. */
  absent: string[]
  /** Visitors or non-members who sat in. */
  inAttendance: string[]
  /** Whether the chair declared a quorum. */
  quorumPresent: boolean

  // ── Opening ──────────────────────────────────────────────────────────────
  openingPrayerBy: string
  openingRemarks: string

  // ── Previous minutes ─────────────────────────────────────────────────────
  previousMinutes: {
    readBy: string
    corrections: string
    /** Adopted as a true record. */
    adopted: boolean
    movedBy: string
    secondedBy: string
  }

  // ── Business ─────────────────────────────────────────────────────────────
  mattersArising: MinuteItem[]
  reports: MinuteItem[]
  agendaItems: MinuteItem[]
  otherBusiness: MinuteItem[]
  actionPoints: ActionPoint[]
  announcements: string

  // ── Next meeting ─────────────────────────────────────────────────────────
  nextMeeting: { date: string; time: string; venue: string }

  // ── Closing ──────────────────────────────────────────────────────────────
  closingPrayerBy: string
  /** HH:mm */
  adjournedAt: string

  // ── Approval ─────────────────────────────────────────────────────────────
  status: MinutesStatus
  /** YYYY-MM-DD the minutes were adopted. */
  approvedOn: string

  // ── Bookkeeping (set by the store) ───────────────────────────────────────
  createdAt?: string
  updatedAt?: string
  updatedBy?: string
}

export type BusinessMeetingDraft = Omit<BusinessMeeting, 'id'>
