import { defineStore } from 'pinia'
import { useChurchSettingsRepository, type ChurchSettings } from '~/repositories/churchSettingsRepository'

export const useChurchSettingsStore = defineStore('churchSettings', () => {
  const settings = ref<ChurchSettings>({
    name: 'The Church of Christ',
    address: '7B Esa Atan Ext. Ikot Ekpene, Akwa Ibom State',
    heroImageUrl: '',
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const repo = useChurchSettingsRepository()
      const data = await repo.fetchSettings()
      if (data) settings.value = data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load church settings'
    } finally {
      loading.value = false
    }
  }

  return { settings, loading, error, load }
})
