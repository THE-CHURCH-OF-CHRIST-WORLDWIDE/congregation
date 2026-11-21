/**
 * Maps the teachings staff upload in Admin → Teachings (`teachings` collection, `Sermon` shape)
 * onto what the public pages render: sermons, Sunday School lessons and recorded streams.
 *
 * Pure functions, so the mapping is testable without Firestore.
 */
import type { Sermon } from '~/types'
import type { Lesson, PublicSermon, RecordedStream } from '~/types/public'
import { formatDate } from '~/utils/date'
import { toEmbedUrl } from '~/utils/videoEmbed'

/** Upload type that becomes a Sunday School lesson; every other type is published as a sermon. */
export const LESSON_TYPE = 'Sunday School'

/** URL-safe slug from a title, suffixed with part of the id so two "Faith" sermons never clash. */
export function teachingSlug(t: Pick<Sermon, 'id' | 'topic' | 'type'>): string {
  const base = (t.topic || t.type || 'teaching')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${base || 'teaching'}-${t.id.slice(-6).toLowerCase()}`
}

/** Splits free text into paragraphs / points on blank lines or line breaks. */
function paragraphs(text: string | undefined): string[] {
  return (text ?? '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function title(t: Sermon): string {
  return t.topic?.trim() || t.type
}

function tags(t: Sermon): string[] {
  const cats = (t.categories ?? []).filter(Boolean)
  // Non-sermon types (Bible Class, Prayer Meeting…) carry their type as a tag so visitors can
  // filter for them on the sermons page.
  return t.type && t.type !== 'Sermon' && t.type !== LESSON_TYPE ? [t.type, ...cats] : cats
}

/** Up to three other teachings of the same kind, preferring ones that share a category. */
function related(t: Sermon, pool: Sermon[]): string[] {
  const mine = new Set(t.categories ?? [])
  return pool
    .filter((o) => o.id !== t.id)
    .map((o) => ({ o, shared: (o.categories ?? []).filter((c) => mine.has(c)).length }))
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 3)
    .map(({ o }) => o.id)
}

export function toPublicSermon(t: Sermon, pool: Sermon[] = []): PublicSermon {
  return {
    id: t.id,
    slug: teachingSlug(t),
    title: title(t),
    preacher: t.preacher,
    date: formatDate(t.date) || t.date,
    tags: tags(t),
    thumbnailSrc: t.thumbnail ?? '',
    videoSrc: toEmbedUrl(t.videoUrl),
    description: t.description,
    // Structured point lists aren't part of the upload form; the detail page hides empty ones.
    lessonPoints: [],
    soulWinnerPoints: [],
    relatedIds: related(t, pool),
    documentUrl: t.documentUrl || undefined,
  }
}

export function toLesson(t: Sermon, pool: Sermon[] = []): Lesson {
  return {
    id: t.id,
    slug: teachingSlug(t),
    title: title(t),
    preacher: t.preacher,
    date: formatDate(t.date) || t.date,
    tags: tags(t),
    thumbnailSrc: t.thumbnail ?? '',
    // The lesson's description, one point per paragraph, under "Why This Lesson?".
    overviewGoals: paragraphs(t.description),
    churchDuties: [],
    scripture: t.scripture ?? '',
    relatedIds: related(t, pool),
  }
}

/** A teaching with a playable recording, listed under Live Streams → Recorded. */
export function toRecordedStream(t: Sermon): RecordedStream {
  return {
    id: t.id,
    title: title(t),
    serviceType: t.type === 'Sermon' ? 'Sunday Worship' : t.type,
    preacher: t.preacher,
    date: formatDate(t.date) || t.date,
    duration: '',
    views: t.videoAttendees ?? 0,
    thumbnailSrc: t.thumbnail ?? '',
    slug: teachingSlug(t),
    videoSrc: toEmbedUrl(t.videoUrl),
  }
}

/** Splits the raw collection into the three public lists. Input is newest-first. */
export function splitTeachings(all: Sermon[]) {
  const lessonsRaw = all.filter((t) => t.type === LESSON_TYPE)
  const sermonsRaw = all.filter((t) => t.type !== LESSON_TYPE)
  return {
    sermons: sermonsRaw.map((t) => toPublicSermon(t, sermonsRaw)),
    lessons: lessonsRaw.map((t) => toLesson(t, lessonsRaw)),
    recorded: all.filter((t) => toEmbedUrl(t.videoUrl)).map(toRecordedStream),
  }
}
