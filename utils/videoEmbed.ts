/**
 * Turns the link staff paste (a YouTube / Facebook / Vimeo watch, share or live URL) into a URL
 * that can sit in an <iframe>. `VideoPlayer` appends `?autoplay=1`, so the result carries no
 * query string of its own where the provider allows it.
 *
 * Returns '' for anything that isn't a recognisable, embeddable http(s) link, so callers can
 * treat "no playable video" uniformly.
 */
export function toEmbedUrl(raw: string | null | undefined): string {
  const input = (raw ?? '').trim()
  if (!input) return ''
  let url: URL
  try {
    url = new URL(input)
  } catch {
    return ''
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return ''
  const host = url.hostname.replace(/^www\.|^m\./, '')

  // YouTube: watch?v=, youtu.be/, /live/, /shorts/, /embed/
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0]
    return id ? `https://www.youtube.com/embed/${id}` : ''
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const v = url.searchParams.get('v')
    if (v) return `https://www.youtube.com/embed/${v}`
    const m = url.pathname.match(/^\/(?:live|shorts|embed)\/([\w-]+)/)
    return m ? `https://www.youtube.com/embed/${m[1]}` : ''
  }

  // Vimeo: vimeo.com/<id> or player.vimeo.com/video/<id>
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = url.pathname.match(/(\d{5,})/)
    return m ? `https://player.vimeo.com/video/${m[1]}` : ''
  }

  // Facebook video / live: embedded through the official video plugin.
  if (host === 'facebook.com' || host === 'fb.watch') {
    return `https://www.facebook.com/plugins/video.php?show_text=false&href=${encodeURIComponent(input)}`
  }

  return ''
}

/** True when the link can be played inside the page. */
export function isEmbeddable(raw: string | null | undefined): boolean {
  return toEmbedUrl(raw) !== ''
}
