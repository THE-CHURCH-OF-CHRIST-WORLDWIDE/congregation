import { describe, expect, it } from 'vitest'
import { isEmbeddable, toEmbedUrl } from '~/utils/videoEmbed'

describe('toEmbedUrl', () => {
  it.each([
    ['https://www.youtube.com/watch?v=abc123XYZ_-', 'https://www.youtube.com/embed/abc123XYZ_-'],
    ['https://youtu.be/abc123?t=40', 'https://www.youtube.com/embed/abc123'],
    ['https://www.youtube.com/live/LIVE987?si=x', 'https://www.youtube.com/embed/LIVE987'],
    ['https://m.youtube.com/shorts/SHORT1', 'https://www.youtube.com/embed/SHORT1'],
    ['https://www.youtube.com/embed/EMB1', 'https://www.youtube.com/embed/EMB1'],
    ['https://vimeo.com/123456789', 'https://player.vimeo.com/video/123456789'],
  ])('turns %s into an embeddable player URL', (input, expected) => {
    expect(toEmbedUrl(input)).toBe(expected)
  })

  it('embeds Facebook videos through the official plugin, keeping the original link', () => {
    const link = 'https://www.facebook.com/church/videos/1234567890/'
    expect(toEmbedUrl(link)).toBe(
      `https://www.facebook.com/plugins/video.php?show_text=false&href=${encodeURIComponent(link)}`
    )
  })

  it.each(['', '   ', 'not a url', 'javascript:alert(1)', 'https://example.com/video.mp4'])(
    'rejects %j',
    (input) => {
      expect(toEmbedUrl(input)).toBe('')
      expect(isEmbeddable(input)).toBe(false)
    }
  )
})
