import { describe, expect, it } from 'vitest'
import { compressImage, fitDimensions, skipReasonFor, withExtension } from '~/utils/compressImage'

const SKIP_UNDER = 150 * 1024

function fakeFile(name: string, type: string, size: number): File {
  const file = new File(['x'], name, { type })
  // File size is derived from content; override it so tests don't allocate MBs.
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('fitDimensions', () => {
  it('leaves images already within bounds untouched', () => {
    expect(fitDimensions(800, 600, 1920, 1920)).toEqual({ width: 800, height: 600 })
  })

  it('never upscales a small image', () => {
    expect(fitDimensions(100, 100, 1920, 1920)).toEqual({ width: 100, height: 100 })
  })

  it('scales down on the longest edge, preserving aspect ratio', () => {
    expect(fitDimensions(4000, 3000, 1920, 1920)).toEqual({ width: 1920, height: 1440 })
  })

  it('respects a constraining height', () => {
    expect(fitDimensions(3000, 4000, 1920, 1920)).toEqual({ width: 1440, height: 1920 })
  })

  it('keeps at least one pixel on extreme aspect ratios', () => {
    const { height } = fitDimensions(10000, 5, 1920, 1920)
    expect(height).toBeGreaterThanOrEqual(1)
  })

  it('passes through degenerate dimensions', () => {
    expect(fitDimensions(0, 0, 1920, 1920)).toEqual({ width: 0, height: 0 })
  })
})

describe('skipReasonFor', () => {
  it('accepts a large jpeg', () => {
    expect(skipReasonFor(fakeFile('p.jpg', 'image/jpeg', 4_000_000), SKIP_UNDER)).toBeNull()
  })

  it('skips non-images', () => {
    expect(skipReasonFor(fakeFile('a.pdf', 'application/pdf', 4_000_000), SKIP_UNDER)).toBe(
      'not-an-image'
    )
  })

  it('skips gifs so animation survives', () => {
    expect(skipReasonFor(fakeFile('a.gif', 'image/gif', 4_000_000), SKIP_UNDER)).toBe('animated')
  })

  it('skips svg vectors', () => {
    expect(skipReasonFor(fakeFile('a.svg', 'image/svg+xml', 400_000), SKIP_UNDER)).toBe('vector')
  })

  it('skips files already below the threshold', () => {
    expect(skipReasonFor(fakeFile('a.png', 'image/png', 1024), SKIP_UNDER)).toBe('already-small')
  })
})

describe('withExtension', () => {
  it('swaps the extension', () => {
    expect(withExtension('photo.HEIC', 'webp')).toBe('photo.webp')
  })

  it('appends when there is no extension', () => {
    expect(withExtension('photo', 'webp')).toBe('photo.webp')
  })

  it('only replaces the final segment of a dotted name', () => {
    expect(withExtension('my.church.photo.jpeg', 'webp')).toBe('my.church.photo.webp')
  })

  it('falls back to a generic name for extension-only input', () => {
    expect(withExtension('.jpeg', 'webp')).toBe('image.webp')
  })
})

describe('compressImage', () => {
  it('returns the original file when the type is not compressible', async () => {
    const gif = fakeFile('a.gif', 'image/gif', 4_000_000)
    const result = await compressImage(gif)

    expect(result.file).toBe(gif)
    expect(result.skipped).toBe(true)
    expect(result.reason).toBe('animated')
    expect(result.bytes).toBe(gif.size)
  })

  it('passes small files straight through', async () => {
    const small = fakeFile('a.jpg', 'image/jpeg', 1024)
    const result = await compressImage(small)

    expect(result.file).toBe(small)
    expect(result.skipped).toBe(true)
    expect(result.reason).toBe('already-small')
  })

  it('never rejects — an undecodable file falls back to the original', async () => {
    const broken = fakeFile('broken.jpg', 'image/jpeg', 4_000_000)
    const result = await compressImage(broken, { decodeTimeoutMs: 50 })

    expect(result.file).toBe(broken)
    expect(result.skipped).toBe(true)
    expect(result.reason).toBe('failed')
  })
})
