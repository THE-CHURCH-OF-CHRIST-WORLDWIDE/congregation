/**
 * Asks Cloudinary to deliver an image in a browser-displayable format.
 *
 * `useCloudinaryUpload` compresses on the way in, but can't do that for formats no browser
 * decoder can read client-side — HEIC/HEIF from an iPhone being the common case. Those upload
 * untouched, and a `.heic` asset then only renders in Safari; every other browser shows nothing.
 *
 * Cloudinary can transcode server-side regardless of the source format, so this rewrites the
 * delivery URL to request `f_auto,q_auto` (best format for the requesting browser, at Cloudinary's
 * automatic quality) instead of re-uploading anything. Safe to apply to every Cloudinary URL,
 * including ones already in a displayable format — `f_auto` just serves those as-is or as WebP.
 *
 * Leaves non-Cloudinary URLs (and anything already carrying a transformation) untouched.
 */
export function displayableImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  const match = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/)
  if (!match) return url

  const [, prefix, rest] = match
  // A transformation segment is comma/underscore-joined key-value pairs, e.g. "f_auto,q_auto" or
  // "w_200,h_200,c_fill" — distinct from the "v1234567890/" version segment that always follows.
  if (/^[a-z]+_[^/]+\//.test(rest!)) return url

  return `${prefix}f_auto,q_auto/${rest}`
}
