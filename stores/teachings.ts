import { defineStore } from 'pinia'
import type { Sermon } from '~/types'

export const useTeachingsStore = defineStore('teachings', () => {
  const sermons = ref<Sermon[]>([])
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const filterType = ref('all')
  const searchQuery = ref('')

  const filteredSermons = computed(() => {
    let result = [...sermons.value]
    if (filterType.value !== 'all') {
      result = result.filter((s) => s.type === filterType.value)
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (s) =>
          s.topic.toLowerCase().includes(q) ||
          s.preacher.toLowerCase().includes(q) ||
          s.categories.some((c) => c.toLowerCase().includes(q))
      )
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })

  const recentSermons = computed(() =>
    [...sermons.value]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4)
  )

  function uploadSermon(data: Omit<Sermon, 'id' | 'createdAt'>) {
    uploading.value = true
    uploadProgress.value = 0
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        uploadProgress.value += 20
        if (uploadProgress.value >= 100) {
          clearInterval(interval)
          sermons.value.unshift({
            ...data,
            id: String(Date.now()),
            createdAt: new Date().toISOString(),
          })
          uploading.value = false
          uploadProgress.value = 0
          resolve()
        }
      }, 200)
    })
  }

  function deleteSermon(id: string) {
    sermons.value = sermons.value.filter((s) => s.id !== id)
  }

  function updateSermon(id: string, updates: Partial<Sermon>) {
    const idx = sermons.value.findIndex((s) => s.id === id)
    if (idx !== -1) sermons.value[idx] = { ...sermons.value[idx], ...updates } as Sermon
  }

  return {
    sermons,
    uploading,
    uploadProgress,
    filterType,
    searchQuery,
    filteredSermons,
    recentSermons,
    uploadSermon,
    deleteSermon,
    updateSermon,
  }
})
