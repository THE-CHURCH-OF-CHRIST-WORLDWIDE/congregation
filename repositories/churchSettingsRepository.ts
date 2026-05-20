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

export interface ChurchSettings {
  // ── General ──────────────────────────────────────────────────────────────
  name: string
  address: string
  phone: string
  email: string

  // ── Hero (Landing Page) ───────────────────────────────────────────────────
  heroImageUrl: string
  activities: Activity[]

  // ── Minister Welcome ──────────────────────────────────────────────────────
  ministerName: string
  ministerTitle: string
  ministerPhoto: string
  congregationPhotos: string[]
  ministerLetterP1: string
  ministerLetterP2: string
  ministerLetterP3: string
  ministerLetterP4: string

  // ── Leaders ───────────────────────────────────────────────────────────────
  leaders: Leader[]

  // ── Gallery ───────────────────────────────────────────────────────────────
  galleryPhotos: GalleryPhoto[]
}

const COLLECTION = 'settings'
const DOCUMENT = 'church'

export function useChurchSettingsRepository() {
  const { $firestore } = useNuxtApp()

  async function fetchSettings(): Promise<Partial<ChurchSettings> | null> {
    const ref = doc($firestore, COLLECTION, DOCUMENT)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data() as Partial<ChurchSettings>
  }

  async function saveSettings(settings: ChurchSettings): Promise<void> {
    const ref = doc($firestore, COLLECTION, DOCUMENT)
    await setDoc(ref, settings, { merge: true })
  }

  return { fetchSettings, saveSettings }
}
