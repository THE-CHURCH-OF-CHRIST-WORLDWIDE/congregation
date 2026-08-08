import { defineStore } from 'pinia'
import { useTeachingsRepository } from '~/repositories/teachingsRepository'
import { recordAudit } from '~/utils/audit'
import type { Sermon } from '~/types'

export const useTeachingsStore = defineStore('teachings', () => {
  const sermons = ref<Sermon[]>([])
  const uploading = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)
  const filterType = ref('all')
  const searchQuery = ref('')

  function fail(e: unknown, fallback: string): never {
    error.value = e instanceof Error ? e.message : fallback
    useToast().error(error.value)
    throw e
  }

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    error.value = null
    try {
      sermons.value = await useTeachingsRepository().fetchSermons()
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load teachings'
      useToast().error(error.value)
    } finally {
      loading.value = false
    }
  }

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
    [...sermons.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)
  )

  /**
   * The old version animated a fake progress bar to 100% over one second and then pushed to an
   * array. `uploading` now brackets a real write; the genuinely slow part — the image — already
   * reports its own progress through `useCloudinaryUpload`.
   */
  async function uploadSermon(data: Omit<Sermon, 'id' | 'createdAt'>) {
    uploading.value = true
    error.value = null
    try {
      const created = await useTeachingsRepository().createSermon({
        ...data,
        createdAt: new Date().toISOString(),
      })
      sermons.value.unshift(created)
      recordAudit({
        action: 'teaching.create',
        targetId: created.id,
        targetLabel: created.topic,
      })
      useToast().success(`"${data.topic || 'Sermon'}" uploaded`)
      return created
    } catch (e: unknown) {
      fail(e, 'Failed to upload teaching')
    } finally {
      uploading.value = false
    }
  }

  async function deleteSermon(id: string) {
    const topic = sermons.value.find((s) => s.id === id)?.topic
    if (!topic && !sermons.value.some((s) => s.id === id)) return
    error.value = null
    try {
      await useTeachingsRepository().deleteSermon(id)
      sermons.value = sermons.value.filter((s) => s.id !== id)
      recordAudit({ action: 'teaching.delete', targetId: id, targetLabel: topic })
      if (topic) useToast().success(`"${topic}" deleted`)
    } catch (e: unknown) {
      fail(e, 'Failed to delete teaching')
    }
  }

  async function updateSermon(id: string, updates: Partial<Sermon>) {
    const idx = sermons.value.findIndex((s) => s.id === id)
    if (idx === -1) return
    error.value = null
    try {
      await useTeachingsRepository().updateSermon(id, updates)
      sermons.value[idx] = { ...sermons.value[idx], ...updates } as Sermon
      recordAudit({
        action: 'teaching.update',
        targetId: id,
        targetLabel: sermons.value[idx]!.topic,
      })
      useToast().success(`"${sermons.value[idx]!.topic}" updated`)
    } catch (e: unknown) {
      fail(e, 'Failed to update teaching')
    }
  }

  return {
    sermons,
    uploading,
    loading,
    error,
    loaded,
    load,
    filterType,
    searchQuery,
    filteredSermons,
    recentSermons,
    uploadSermon,
    deleteSermon,
    updateSermon,
  }
})
