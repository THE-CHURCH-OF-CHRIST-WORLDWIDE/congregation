import { defineStore } from 'pinia'
import { useChurchSettingsRepository, type ChurchSettings } from '~/repositories/churchSettingsRepository'

export const DEFAULT_SETTINGS: ChurchSettings = {
  // General
  name: 'The Church of Christ',
  address: '7B Esa Atan Ext. Ikot Ekpene, Akwa Ibom State',
  phone: '(+234) 900 197 0700',
  email: 'churchofchristesa_atan@gmail.com',

  // Hero
  heroImageUrl: '',
  activities: [
    { name: 'Sunday Worship Service', timeRange: '9:00 am - 12:00 noon', frequency: 'Every Sunday' },
    { name: 'Bible Class', timeRange: '5:00 pm - 6:30 pm', frequency: 'Every Wednesday' },
  ],

  // Minister Welcome
  ministerName: 'Min. Friday Asuquo',
  ministerTitle: 'Resident Minister',
  ministerPhoto: 'https://picsum.photos/seed/minister-portrait/400/520',
  congregationPhotos: [
    'https://picsum.photos/seed/congregation1/400/520',
    'https://picsum.photos/seed/congregation2/400/520',
  ],
  ministerLetterP1: 'We are delighted to welcome you to the online home of the Church of Christ, located at No. 7B Esa Atan Road Extension, Ikot Ekpene, Akwa Ibom State.',
  ministerLetterP2: 'As a congregation, we are firmly rooted in the teachings of the Bible, which serves as our sole and authoritative guide. We believe in baptism by immersion and are committed to worshipping God in spirit and in truth. Guided by the simple pattern of the New Testament, we worship through teaching, singing, prayer, giving, and communion.',
  ministerLetterP3: 'Feel free to explore our sermons and Sunday School teachings, and join us live every Sunday. You can also reach out to us anytime for enquiries, support, or Bible study.',
  ministerLetterP4: 'We warmly encourage you to worship with the Church of Christ congregation nearest to you.',

  // Leaders
  leaders: [
    { id: 'l1', name: 'Akpan Lincoln',     role: 'Elder',    avatar: 'https://picsum.photos/seed/ldr-al1/300/300' },
    { id: 'l2', name: 'Chidi Okafor',      role: 'Elder',    avatar: 'https://picsum.photos/seed/ldr-co/300/300' },
    { id: 'l3', name: 'Obinna Nwosu',      role: 'Elder',    avatar: 'https://picsum.photos/seed/ldr-on/300/300' },
    { id: 'l4', name: 'Tunde Adebayo',     role: 'Elder',    avatar: 'https://picsum.photos/seed/ldr-ta/300/300' },
    { id: 'l5', name: 'Bola Mikhail',      role: 'Deacon',   avatar: 'https://picsum.photos/seed/ldr-bm/300/300' },
    { id: 'l6', name: 'Chijioke Emmanuel', role: 'Deacon',   avatar: 'https://picsum.photos/seed/ldr-ce/300/300' },
    { id: 'l7', name: 'Peter Eze',         role: 'Deacon',   avatar: 'https://picsum.photos/seed/ldr-pe/300/300' },
    { id: 'l8', name: 'Friday Asuquo',     role: 'Minister', avatar: 'https://picsum.photos/seed/ldr-al3/300/300' },
  ],

  // Gallery
  galleryPhotos: [
    { id: 'g1', src: 'https://picsum.photos/seed/gallery1/600/800', alt: 'Church congregation gathered for worship' },
    { id: 'g2', src: 'https://picsum.photos/seed/gallery2/800/500', alt: 'Sunday morning worship service' },
    { id: 'g3', src: 'https://picsum.photos/seed/gallery3/600/600', alt: 'Bible study session' },
    { id: 'g4', src: 'https://picsum.photos/seed/gallery4/800/600', alt: 'Youth convention gathering' },
    { id: 'g5', src: 'https://picsum.photos/seed/gallery5/600/700', alt: 'Baptism ceremony' },
    { id: 'g6', src: 'https://picsum.photos/seed/gallery6/800/450', alt: 'Church choir performance' },
    { id: 'g7', src: 'https://picsum.photos/seed/gallery7/600/600', alt: 'Community outreach event' },
    { id: 'g8', src: 'https://picsum.photos/seed/gallery8/800/500', alt: 'Congregation fellowship' },
  ],
}

export const useChurchSettingsStore = defineStore('churchSettings', () => {
  const settings = ref<ChurchSettings>(structuredClone(DEFAULT_SETTINGS))
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function load() {
    if (loaded.value) return
    loading.value = true
    error.value = null
    try {
      const repo = useChurchSettingsRepository()
      const data = await repo.fetchSettings()
      if (data) settings.value = { ...DEFAULT_SETTINGS, ...data }
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load church settings'
    } finally {
      loading.value = false
    }
  }

  async function save(updates: Partial<ChurchSettings>) {
    saving.value = true
    error.value = null
    settings.value = { ...settings.value, ...updates }
    try {
      const repo = useChurchSettingsRepository()
      await repo.saveSettings(settings.value)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save church settings'
      throw e
    } finally {
      saving.value = false
    }
  }

  return { settings, loading, saving, error, loaded, load, save }
})
