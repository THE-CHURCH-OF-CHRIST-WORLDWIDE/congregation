import { doc, getDoc, setDoc } from 'firebase/firestore'

export interface Activity {
  name: string
  timeRange: string
  frequency: string
}

export interface Leader {
  id: string
  name: string
  role: string
  avatar: string
}

export interface GalleryPhoto {
  id: string
  src: string
  alt: string
}

export interface LiveWorshipSettings {
  heading: string
  subheading: string
  nextTitle: string
  nextSchedule: string
  moderatorLabel: string
  recentHeading: string
  watchCtaLabel: string
  reminderCtaLabel: string
}

export interface AboutHeroSettings {
  scriptureRef: string
  title: string
  subtitle: string
  backgroundImage: string
}

export interface HistoryScheduleRow {
  label: string
  time: string
}

export interface FounderEntry {
  id: string
  name: string
}

export interface AboutHistorySettings {
  eyebrow: string
  heading: string
  openingParagraph: string
  foundersHeading: string
  founders: FounderEntry[]
  growthParagraph: string
  scheduleHeading: string
  schedule: HistoryScheduleRow[]
  closingParagraph: string
  signatureName: string
  signatureRole: string
  cornerImages: string[]
}

export interface WorshipActivityItem {
  id: string
  name: string
  icon: string
  scripture: string
}

export interface WorshipActivitiesSettings {
  eyebrow: string
  heading: string
  subtitle: string
  items: WorshipActivityItem[]
}

export interface ActivityCalendarRow {
  id: string
  day: string
  activity: string
  time: string
}

export interface ActivityCalendarSettings {
  eyebrow: string
  heading: string
  subtitle: string
  rows: ActivityCalendarRow[]
}

export interface WorshipServiceDetail {
  id: string
  icon: string
  primary: string
  secondary: string
}

export interface WorshipThisSundaySettings {
  eyebrow: string
  heading: string
  cardChurchName: string
  cardChurchSubtitle: string
  details: WorshipServiceDetail[]
  directionsUrl: string
  mapAddress: string
}

export interface ChurchSettings {
  // ── General ──────────────────────────────────────────────────────────────
  name: string
  address: string
  phone: string
  email: string

  // ── Hero (Landing Page) ───────────────────────────────────────────────────
  heroImageUrl: string
  heroEyebrow: string
  heroTagline: string
  heroPrimaryCtaLabel: string
  heroPrimaryCtaHref: string
  heroSecondaryCtaLabel: string
  heroSecondaryCtaHref: string
  activities: Activity[]

  // ── Minister Welcome ──────────────────────────────────────────────────────
  ministerName: string
  ministerTitle: string
  ministerPhoto: string
  congregationPhotos: string[]
  ministerLetterHeading: string
  ministerLetterGreeting: string
  ministerLetterP1: string
  ministerLetterP2: string
  ministerLetterP3: string
  ministerLetterP4: string

  // ── Live Worship Teaser ───────────────────────────────────────────────────
  liveWorship: LiveWorshipSettings

  // ── About Page: Hero ──────────────────────────────────────────────────────
  aboutHero: AboutHeroSettings

  // ── About Page: Church History ────────────────────────────────────────────
  aboutHistory: AboutHistorySettings

  // ── About Page: Worship Activities ────────────────────────────────────────
  worshipActivities: WorshipActivitiesSettings

  // ── About Page: Activity Calendar ─────────────────────────────────────────
  activityCalendar: ActivityCalendarSettings

  // ── About Page: Worship This Sunday ───────────────────────────────────────
  worshipThisSunday: WorshipThisSundaySettings

  // ── Leaders ───────────────────────────────────────────────────────────────
  leaders: Leader[]

  // ── Gallery ───────────────────────────────────────────────────────────────
  galleryPhotos: GalleryPhoto[]
}

const COLLECTION = 'settings'
const DOCUMENT = 'church'
const LOCAL_STORAGE_KEY = 'congregation:churchSettings'

function isFirebaseConfigured(): boolean {
  const cfg = useRuntimeConfig().public
  const key = cfg.firebaseApiKey
  const project = cfg.firebaseProjectId
  if (!key || !project) return false
  // Detect the placeholder values in .env.example so dev never tries to hit Firebase
  if (typeof key === 'string' && key.startsWith('your_')) return false
  if (typeof project === 'string' && project.startsWith('your_')) return false
  return true
}

function readLocal(): Partial<ChurchSettings> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<ChurchSettings>
  } catch {
    return null
  }
}

function writeLocal(settings: ChurchSettings): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Storage may be unavailable (private mode, quota); ignore — Firestore is the source of truth in prod.
  }
}

export function useChurchSettingsRepository() {
  const nuxt = useNuxtApp()
  const useFirebase = isFirebaseConfigured()

  async function fetchSettings(): Promise<Partial<ChurchSettings> | null> {
    if (!useFirebase) return readLocal()

    try {
      const ref = doc(nuxt.$firestore, COLLECTION, DOCUMENT)
      const snap = await getDoc(ref)
      if (!snap.exists()) return readLocal()
      return snap.data() as Partial<ChurchSettings>
    } catch {
      return readLocal()
    }
  }

  async function saveSettings(settings: ChurchSettings): Promise<void> {
    // Always write locally so the UI persists even when Firestore is offline or misconfigured.
    writeLocal(settings)
    if (!useFirebase) return

    const ref = doc(nuxt.$firestore, COLLECTION, DOCUMENT)
    await setDoc(ref, settings, { merge: true })
  }

  return { fetchSettings, saveSettings }
}
