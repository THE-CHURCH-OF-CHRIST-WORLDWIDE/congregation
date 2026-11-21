import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MinutesDocument from '~/components/business-meetings/MinutesDocument.vue'
import { emptyMeeting, newMinuteItem, normaliseMeeting } from '~/utils/businessMeetings'

const full = normaliseMeeting('m1', {
  ...emptyMeeting('2026-11-01'),
  title: 'Monthly Business Meeting',
  startTime: '14:00',
  chairperson: 'Bro. Akpan',
  secretary: 'Sis. Grace',
  present: ['Bro. Akpan', 'Sis. Grace', 'Bro. Okon'],
  apologies: ['Bro. Chris'],
  openingPrayerBy: 'Bro. Okon',
  previousMinutes: {
    readBy: 'Sis. Grace',
    corrections: '',
    adopted: true,
    movedBy: 'Bro. Okon',
    secondedBy: 'Bro. Akpan',
  },
  agendaItems: [
    {
      ...newMinuteItem('ag'),
      title: 'Roof repairs',
      discussion: 'The roof leaks over the pulpit.',
      resolution: 'Repair before December.',
      movedBy: 'Bro. Okon',
      secondedBy: 'Sis. Grace',
      outcome: 'carried',
    },
  ],
  actionPoints: [
    {
      id: 'a1',
      task: 'Get three quotes',
      assignedTo: 'Bro. Okon',
      dueDate: '2026-11-15',
      done: false,
    },
  ],
  adjournedAt: '15:30',
  closingPrayerBy: 'Bro. Akpan',
})

describe('MinutesDocument', () => {
  it('renders every recorded part, numbered in order', async () => {
    const w = await mountSuspended(MinutesDocument, {
      props: { meeting: full, churchName: 'Church of Christ' },
    })
    const headings = w.findAll('h2').map((h) => h.text())
    expect(headings).toEqual([
      '1. Attendance',
      '2. Opening',
      '3. Minutes of the previous meeting',
      '4. New business',
      '5. Action points',
      '6. Closing',
    ])
    const text = w.text()
    expect(text).toContain('Present (3): Bro. Akpan, Sis. Grace, Bro. Okon')
    expect(text).toContain('Apologies (1): Bro. Chris')
    expect(text).toContain('Resolved: Repair before December.')
    expect(text).toContain('Carried')
    expect(text).toContain('adopted as a true record')
    expect(text).toContain('Draft — not yet approved')
  })

  it('leaves out sections with nothing in them', async () => {
    const bare = normaliseMeeting('m2', { ...emptyMeeting('2026-11-01'), agendaItems: [] })
    const w = await mountSuspended(MinutesDocument, {
      props: { meeting: bare, churchName: 'Church of Christ' },
    })
    expect(w.findAll('h2')).toHaveLength(0)
    expect(w.text()).toContain('Chairperson')
  })
})
