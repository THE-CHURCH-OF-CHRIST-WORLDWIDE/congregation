/**
 * Client-side image compression.
 *
 * Every image the app uploads is re-encoded in the browser before it leaves the
 * device: oversized photos are scaled down to sane display dimensions and
 * written out as WebP (JPEG where WebP is unavailable) at a quality that stays
 * visually indistinguishable from the original at normal viewing sizes.
 *
 * The pass is deliberately conservative — it never upscales, never touches
 * animated or vector images, and falls back to the untouched original whenever
 * compression fails or fails to actually save bytes. A compressor that corrupts
 * an upload is worse than no compressor at all.
 */

export interface CompressOptions {
  /** Longest edge, in pixels, the output may have. Default 1920. */
  maxWidth?: number
  maxHeight?: number
  /** Starting encoder quality, 0–1. Default 0.82 — visually lossless for photos. */
  quality?: number
  /**
   * Soft size ceiling. While the encoded result is above this, quality steps
   * down (never below `minQuality`) and it re-encodes. Default 1MB.
   */
  targetBytes?: number
  /** Floor for the quality ladder. Default 0.6. */
  minQuality?: number
  /** Files already smaller than this are passed through untouched. Default 150KB. */
  skipUnderBytes?: number
  /**
   * Give up decoding after this long and upload the original. Guards against
   * an `<img>` that resolves neither `onload` nor `onerror`, which would
   * otherwise leave the upload spinner stuck forever. Default 15s.
   */
  decodeTimeoutMs?: number
}

export type CompressSkipReason =
  | 'already-small'
  | 'animated'
  | 'vector'
  | 'not-an-image'
  | 'no-gain'
  | 'unsupported-environment'
  | 'failed'
  /** The caller opted out via `compress: false`. */
  | 'disabled'

export interface CompressedImage {
  /** The file to upload — the compressed one, or the original when skipped. */
  file: File
  originalBytes: number
  bytes: number
  width: number
  height: number
  /** True when the original was returned untouched. */
  skipped: boolean
  reason?: CompressSkipReason
}

const DEFAULTS = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.82,
  targetBytes: 1024 * 1024,
  minQuality: 0.6,
  skipUnderBytes: 150 * 1024,
  decodeTimeoutMs: 15_000,
} satisfies Required<CompressOptions>

/** Quality is reduced by this much per re-encode attempt. */
const QUALITY_STEP = 0.1

/**
 * Scale `width`×`height` to fit inside the given bounds, preserving aspect
 * ratio. Images already within bounds are returned unchanged — never upscaled.
 */
export function fitDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width, height }

  const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
  if (ratio === 1) return { width, height }

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

/**
 * Why a file should bypass compression, or `null` when it is a candidate.
 * GIFs are excluded because canvas re-encoding would flatten the animation to
 * its first frame; SVGs because they are already vectors.
 */
export function skipReasonFor(file: File, skipUnderBytes: number): CompressSkipReason | null {
  if (!file.type.startsWith('image/')) return 'not-an-image'
  if (file.type === 'image/gif') return 'animated'
  if (file.type === 'image/svg+xml') return 'vector'
  if (file.size <= skipUnderBytes) return 'already-small'
  return null
}

/** Swap a filename's extension, e.g. `photo.HEIC` → `photo.webp`. */
export function withExtension(name: string, extension: string): string {
  const base = name.replace(/\.[^./\\]+$/, '')
  return `${base || 'image'}.${extension}`
}

let webpSupport: boolean | null = null

/** Whether this browser's canvas can encode WebP. Probed once, then cached. */
function supportsWebp(): boolean {
  if (webpSupport !== null) return webpSupport
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  } catch {
    webpSupport = false
  }
  return webpSupport
}

interface DecodedImage {
  source: CanvasImageSource
  width: number
  height: number
  release: () => void
}

/**
 * Decode a file to something drawable. `createImageBitmap` is preferred (it
 * decodes off the main thread); `imageOrientation: 'from-image'` makes it honour
 * EXIF rotation so portrait phone photos don't come out sideways.
 */
async function decode(file: File, timeoutMs: number): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      }
    } catch {
      // Fall through to the <img> path below.
    }
  }

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      const timer = setTimeout(() => reject(new Error('Timed out decoding image.')), timeoutMs)
      const settle = (fn: () => void) => {
        clearTimeout(timer)
        fn()
      }
      el.onload = () => settle(() => resolve(el))
      el.onerror = () => settle(() => reject(new Error('Could not decode image.')))
      el.src = url
    })
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    }
  } catch (e) {
    URL.revokeObjectURL(url)
    throw e
  }
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Compress `file`. Always resolves — on any failure the original file comes
 * back with `skipped: true`, so callers can upload the result unconditionally.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressedImage> {
  const opts = { ...DEFAULTS, ...options }
  const untouched = (reason: CompressSkipReason): CompressedImage => ({
    file,
    originalBytes: file.size,
    bytes: file.size,
    width: 0,
    height: 0,
    skipped: true,
    reason,
  })

  if (typeof document === 'undefined') return untouched('unsupported-environment')

  const skip = skipReasonFor(file, opts.skipUnderBytes)
  if (skip) return untouched(skip)

  let decoded: DecodedImage | null = null
  try {
    decoded = await decode(file, opts.decodeTimeoutMs)
    const { width, height } = fitDimensions(
      decoded.width,
      decoded.height,
      opts.maxWidth,
      opts.maxHeight
    )

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return untouched('failed')

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(decoded.source, 0, 0, width, height)

    // WebP keeps alpha and beats JPEG at equal quality. Without it, PNGs stay
    // PNG (lossless, but the resize alone still saves bytes) so transparency
    // isn't flattened onto a black background.
    const useWebp = supportsWebp()
    const type = useWebp ? 'image/webp' : file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const extension = type.split('/')[1] ?? 'jpg'
    const lossless = type === 'image/png'

    let blob = await encode(canvas, type, opts.quality)
    if (!lossless) {
      let quality = opts.quality
      while (blob && blob.size > opts.targetBytes && quality > opts.minQuality) {
        quality = Math.max(opts.minQuality, Math.round((quality - QUALITY_STEP) * 100) / 100)
        blob = await encode(canvas, type, quality)
      }
    }

    if (!blob) return untouched('failed')
    // Re-encoding can inflate already-optimised files; keep whichever is smaller.
    if (blob.size >= file.size) return untouched('no-gain')

    const compressed = new File([blob], withExtension(file.name, extension), {
      type,
      lastModified: file.lastModified,
    })

    return {
      file: compressed,
      originalBytes: file.size,
      bytes: compressed.size,
      width,
      height,
      skipped: false,
    }
  } catch {
    return untouched('failed')
  } finally {
    decoded?.release()
  }
}
