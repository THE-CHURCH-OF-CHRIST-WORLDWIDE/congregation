import { doc, getDoc, setDoc } from 'firebase/firestore'

export interface ChurchSettings {
  name: string
  address: string
  heroImageUrl: string
}

const COLLECTION = 'settings'
const DOCUMENT = 'church'

export function useChurchSettingsRepository() {
  const { $firestore } = useNuxtApp()

  async function fetchSettings(): Promise<ChurchSettings | null> {
    const ref = doc($firestore, COLLECTION, DOCUMENT)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data() as ChurchSettings
  }

  async function saveSettings(settings: ChurchSettings): Promise<void> {
    const ref = doc($firestore, COLLECTION, DOCUMENT)
    await setDoc(ref, settings, { merge: true })
  }

  return { fetchSettings, saveSettings }
}
