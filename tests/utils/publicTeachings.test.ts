import { describe, expect, it } from 'vitest'
import { splitTeachings, teachingSlug, toLesson, toPublicSermon } from '~/utils/publicTeachings'
import type { Sermon } from '~/types'

function teaching(overrides: Partial<Sermon> = {}): Sermon {
  return {
    id: 'AbCdEf123456',
    type: 'Sermon',
    date: '2026-11-15',
    preacher: 'Min. Friday Asuquo',
    topic: 'The Church Jesus Built',
    scripture: 'Matthew 16:18',
    description: 'First paragraph.\n\nSecond paragraph.',
    categories: ['Church'],
    createdAt: '2026-11-15T10:00:00.000Z',
    ...overrides,
  }
}

describe('teachingSlug', () => {
  it('is readable, URL-safe and unique per teaching', () => {
    expect(teachingSlug(teaching())).toBe('the-church-jesus-built-123456')
    expect(teachingSlug(teaching({ id: 'zzzzzz999999' }))).toBe('the-church-jesus-built-999999')
  })

  it('falls back to the type when there is no topic', () => {
    expect(teachingSlug(teaching({ topic: '', type: 'Bible Class' }))).toBe('bible-class-123456')
  })
})

describe('splitTeachings', () => {
  it('publishes Sunday School uploads as lessons and everything else as sermons', () => {
    const all = [
      teaching({ id: 'sermon000001' }),
      teaching({ id: 'lesson000001', type: 'Sunday School', topic: 'Duty of the Church' }),
      teaching({ id: 'bclass000001', type: 'Bible Class', topic: 'Acts 2' }),
    ]
    const { sermons, lessons } = splitTeachings(all)
    expect(sermons.map((s) => s.id)).toEqual(['sermon000001', 'bclass000001'])
    expect(lessons.map((l) => l.id)).toEqual(['lesson000001'])
  })

  it('lists only teachings with a playable video as recordings', () => {
    const { recorded } = splitTeachings([
      teaching({ id: 'novideo00001' }),
      teaching({ id: 'video0000001', videoUrl: 'https://youtu.be/xyz' }),
      teaching({ id: 'badlink00001', videoUrl: 'https://example.com/clip.mp4' }),
    ])
    expect(recorded.map((r) => r.id)).toEqual(['video0000001'])
    expect(recorded[0]!.videoSrc).toBe('https://www.youtube.com/embed/xyz')
    expect(recorded[0]!.serviceType).toBe('Sunday Worship')
  })
})

describe('toPublicSermon', () => {
  it('maps the upload fields the public pages show', () => {
    const s = toPublicSermon(
      teaching({
        thumbnail: 'https://img/t.jpg',
        documentUrl: 'https://files/h.pdf',
        videoUrl: 'https://www.youtube.com/watch?v=vid1',
      })
    )
    expect(s).toMatchObject({
      title: 'The Church Jesus Built',
      preacher: 'Min. Friday Asuquo',
      date: '15 Nov 2026',
      tags: ['Church'],
      thumbnailSrc: 'https://img/t.jpg',
      documentUrl: 'https://files/h.pdf',
      videoSrc: 'https://www.youtube.com/embed/vid1',
    })
  })

  it('tags non-sermon types with their type so they can be filtered', () => {
    expect(toPublicSermon(teaching({ type: 'Prayer Meeting' })).tags).toEqual([
      'Prayer Meeting',
      'Church',
    ])
  })

  it('relates teachings that share a category first, never itself', () => {
    const a = teaching({ id: 'aaaaaa000001', categories: ['Faith'] })
    const b = teaching({ id: 'bbbbbb000001', categories: ['Grace'] })
    const c = teaching({ id: 'cccccc000001', categories: ['Faith'] })
    expect(toPublicSermon(a, [a, b, c]).relatedIds).toEqual(['cccccc000001', 'bbbbbb000001'])
  })
})

describe('toLesson', () => {
  it('sets each description paragraph as a point and keeps the scripture', () => {
    const l = toLesson(teaching({ type: 'Sunday School' }))
    expect(l.overviewGoals).toEqual(['First paragraph.', 'Second paragraph.'])
    expect(l.scripture).toBe('Matthew 16:18')
  })
})
