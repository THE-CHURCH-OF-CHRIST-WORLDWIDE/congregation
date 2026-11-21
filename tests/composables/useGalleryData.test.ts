import { describe, expect, it } from 'vitest'
import { buildGalleries } from '~/composables/useGalleryData'

describe('buildGalleries', () => {
  it('groups Settings photos into their gallery categories', () => {
    const g = buildGalleries([
      { id: '1', src: 'https://img/1.jpg', alt: 'Worship', category: 'sunday-service' },
      { id: '2', src: 'https://img/2.jpg', alt: 'Outreach', category: 'evangelism' },
    ])
    expect(g['sunday-service']!.images.map((i) => i.id)).toEqual(['1'])
    expect(g.evangelism!.images.map((i) => i.id)).toEqual(['2'])
    expect(g['bible-class']!.images).toEqual([])
  })

  it('puts photos saved before categories existed under the first category', () => {
    const g = buildGalleries([{ id: 'old', src: 'https://img/o.jpg', alt: '' }])
    expect(g['sunday-service']!.images[0]).toMatchObject({ id: 'old', alt: 'Sunday Service' })
  })

  it('skips empty rows and unknown categories', () => {
    const g = buildGalleries([
      { id: 'blank', src: '', alt: 'not uploaded yet' },
      { id: 'x', src: 'https://img/x.jpg', alt: 'x', category: 'no-such-gallery' },
    ])
    expect(Object.values(g).every((gal) => gal.images.length === 0)).toBe(true)
  })
})
