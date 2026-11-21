import type {
  ActionPoint,
  BusinessMeeting,
  BusinessMeetingDraft,
  MeetingType,
  MinuteItem,
  MotionOutcome,
} from '~/types/businessMeetings'

export const MEETING_TYPES: { value: MeetingType; label: string }[] = [
  { value: 'regular', label: 'Regular business meeting' },
  { value: 'special', label: 'Special meeting' },
  { value: 'emergency', label: 'Emergency meeting' },
  { value: 'annual', label: 'Annual general meeting' },
]

export const MOTION_OUTCOMES: { value: MotionOutcome; label: string }[] = [
  { value: '', label: 'No motion' },
  { value: 'carried', label: 'Carried' },
  { value: 'defeated', label: 'Defeated' },
  { value: 'deferred', label: 'Deferred' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

/** Roles that may write minutes. Mirrors `canEditRecords()` in firestore.rules. */
export const MINUTES_EDITOR_ROLES = ['super-admin', 'admin', 'secretary'] as const
/** Roles that may reopen approved minutes or delete a meeting. Mirrors firestore.rules. */
export const MINUTES_MANAGER_ROLES = ['super-admin', 'admin'] as const

export function meetingTypeLabel(type: MeetingType): string {
  return MEETING_TYPES.find((t) => t.value === type)?.label ?? 'Business meeting'
}

export function outcomeLabel(outcome: MotionOutcome): string {
  return MOTION_OUTCOMES.find((o) => o.value === outcome)?.label ?? ''
}

let seq = 0
/** Ids for rows inside one meeting document; unique within it, which is all they need. */
export function rowId(prefix: string): string {
  seq += 1
  return `${prefix}${Date.now().toString(36)}${seq}`
}

export function newMinuteItem(prefix = 'i'): MinuteItem {
  return {
    id: rowId(prefix),
    title: '',
    presentedBy: '',
    discussion: '',
    resolution: '',
    movedBy: '',
    secondedBy: '',
    outcome: '',
  }
}

export function newActionPoint(): ActionPoint {
  return { id: rowId('a'), task: '', assignedTo: '', dueDate: '', done: false }
}

export function emptyMeeting(today: string): BusinessMeetingDraft {
  return {
    title: 'Business Meeting',
    meetingType: 'regular',
    date: today,
    startTime: '',
    venue: '',
    chairperson: '',
    secretary: '',
    present: [],
    apologies: [],
    absent: [],
    inAttendance: [],
    quorumPresent: true,
    openingPrayerBy: '',
    openingRemarks: '',
    previousMinutes: { readBy: '', corrections: '', adopted: false, movedBy: '', secondedBy: '' },
    mattersArising: [],
    reports: [],
    agendaItems: [newMinuteItem('ag')],
    otherBusiness: [],
    actionPoints: [],
    announcements: '',
    nextMeeting: { date: '', time: '', venue: '' },
    closingPrayerBy: '',
    adjournedAt: '',
    status: 'draft',
    approvedOn: '',
  }
}

/**
 * Fills any field missing from a stored document with its empty value, so a meeting saved by an
 * older version of the app (or partially written) never breaks the editor.
 */
export function normaliseMeeting(id: string, data: Partial<BusinessMeeting>): BusinessMeeting {
  const base = emptyMeeting('')
  const items = (list: unknown, prefix: string): MinuteItem[] =>
    Array.isArray(list) ? list.map((i) => ({ ...newMinuteItem(prefix), ...(i as object) })) : []
  return {
    ...base,
    ...data,
    id,
    agendaItems: items(data.agendaItems, 'ag'),
    mattersArising: items(data.mattersArising, 'ma'),
    reports: items(data.reports, 'rp'),
    otherBusiness: items(data.otherBusiness, 'ob'),
    actionPoints: Array.isArray(data.actionPoints)
      ? data.actionPoints.map((a) => ({ ...newActionPoint(), ...a }))
      : [],
    present: data.present ?? [],
    apologies: data.apologies ?? [],
    absent: data.absent ?? [],
    inAttendance: data.inAttendance ?? [],
    previousMinutes: { ...base.previousMinutes, ...data.previousMinutes },
    nextMeeting: { ...base.nextMeeting, ...data.nextMeeting },
  }
}

/** True when an item has anything worth printing. */
export function itemHasContent(item: MinuteItem): boolean {
  return [
    item.title,
    item.presentedBy,
    item.discussion,
    item.resolution,
    item.movedBy,
    item.secondedBy,
  ].some((v) => v.trim())
}

/** "Sunday, 3 November 2026" from YYYY-MM-DD, or '' when unset/invalid. */
export function formatMeetingDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
}

/** "2:30 PM" from HH:mm, or '' when unset. */
export function formatMeetingTime(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? '')
  if (!m) return hhmm ?? ''
  const h = Number(m[1])
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? 'AM' : 'PM'}`
}

/** Open action points across every meeting, newest meeting first — for the follow-up list. */
export function openActionPoints(meetings: BusinessMeeting[]) {
  return [...meetings]
    .sort((a, b) => b.date.localeCompare(a.date))
    .flatMap((m) =>
      m.actionPoints
        .filter((a) => !a.done && a.task.trim())
        .map((a) => ({ ...a, meetingId: m.id, meetingDate: m.date, meetingTitle: m.title }))
    )
}
