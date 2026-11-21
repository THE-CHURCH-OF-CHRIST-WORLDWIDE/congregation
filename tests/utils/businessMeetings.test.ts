import { describe, expect, it } from 'vitest'
import {
  emptyMeeting,
  formatMeetingTime,
  itemHasContent,
  newMinuteItem,
  normaliseMeeting,
  openActionPoints,
} from '~/utils/businessMeetings'

describe('normaliseMeeting', () => {
  it('fills fields missing from an older or partial document', () => {
    const m = normaliseMeeting('x', {
      title: 'Old',
      date: '2025-05-04',
      agendaItems: [{ title: 'Roof' } as never],
    })
    expect(m.id).toBe('x')
    expect(m.present).toEqual([])
    expect(m.previousMinutes.adopted).toBe(false)
    expect(m.nextMeeting).toEqual({ date: '', time: '', venue: '' })
    expect(m.agendaItems[0]).toMatchObject({ title: 'Roof', resolution: '', outcome: '' })
    expect(m.agendaItems[0]!.id).toBeTruthy()
  })
})

describe('formatMeetingTime', () => {
  it('formats 24-hour times', () => {
    expect(formatMeetingTime('09:05')).toBe('9:05 AM')
    expect(formatMeetingTime('12:30')).toBe('12:30 PM')
    expect(formatMeetingTime('00:15')).toBe('12:15 AM')
    expect(formatMeetingTime('')).toBe('')
  })
})

describe('itemHasContent', () => {
  it('ignores items that are only whitespace', () => {
    expect(itemHasContent({ ...newMinuteItem(), title: '  ' })).toBe(false)
    expect(itemHasContent({ ...newMinuteItem(), resolution: 'Agreed' })).toBe(true)
  })
})

describe('openActionPoints', () => {
  it('lists unfinished, non-empty actions, newest meeting first', () => {
    const older = normaliseMeeting('a', {
      ...emptyMeeting('2026-01-04'),
      actionPoints: [
        { id: '1', task: 'Fix roof', assignedTo: 'Bro. Okon', dueDate: '', done: false },
        { id: '2', task: 'Buy chairs', assignedTo: '', dueDate: '', done: true },
      ],
    })
    const newer = normaliseMeeting('b', {
      ...emptyMeeting('2026-02-01'),
      actionPoints: [
        { id: '3', task: 'Print tracts', assignedTo: '', dueDate: '', done: false },
        { id: '4', task: ' ', assignedTo: '', dueDate: '', done: false },
      ],
    })
    expect(openActionPoints([older, newer]).map((a) => a.task)).toEqual([
      'Print tracts',
      'Fix roof',
    ])
  })
})
