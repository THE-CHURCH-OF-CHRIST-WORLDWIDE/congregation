import { defineStore } from 'pinia'
import { useVisitorsRepository, childrenDocId } from '~/repositories/visitorsRepository'
import { recordAudit } from '~/utils/audit'
import type { ChildrenCount, Visitor } from '~/types'

/**
 * Visitors and children's numbers, service by service.
 *
 * One store for both because they are always recorded together — somebody writing up last
 * Sunday enters the children's figure and the visitors' slips in the same sitting — and every
 * screen that shows one shows the other.
 */
export const useVisitorsStore = defineStore('visitors', () => {
  const visitors = ref<Visitor[]>([])
  const childrenCounts = ref<ChildrenCount[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  function fail(e: unknown, fallback: string): never {
    error.value = e instanceof Error ? e.message : fallback
    useToast().error(error.value)
    throw e
  }

  /** Fetch both sets once per session. Pass `force` after an external change. */
  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    error.value = null
    try {
      const repo = useVisitorsRepository()
      const [fetchedVisitors, fetchedCounts] = await Promise.all([
        repo.fetchVisitors(),
        repo.fetchChildrenCounts(),
      ])
      visitors.value = fetchedVisitors
      childrenCounts.value = fetchedCounts
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load visitors'
      useToast().error(error.value)
    } finally {
      loading.value = false
    }
  }

  // ─── Reading ────────────────────────────────────────────────────────────────

  function visitorsOn(date: string, serviceType: string): Visitor[] {
    return visitors.value.filter((v) => v.date === date && v.serviceType === serviceType)
  }

  /** `null` rather than 0 when nothing was recorded — "none came" and "nobody counted" differ. */
  function childrenOn(date: string, serviceType: string): number | null {
    const entry = childrenCounts.value.find((c) => c.date === date && c.serviceType === serviceType)
    return entry ? entry.count : null
  }

  /** Dates with either a visitor or a children's figure, most recent first. */
  const recordedDates = computed(() => {
    const dates = new Set<string>()
    for (const v of visitors.value) dates.add(v.date)
    for (const c of childrenCounts.value) dates.add(c.date)
    return [...dates].sort().reverse()
  })

  const totalVisitors = computed(() => visitors.value.length)

  // ─── Writing ────────────────────────────────────────────────────────────────

  async function addVisitor(visitor: Omit<Visitor, 'id'>): Promise<Visitor> {
    const repo = useVisitorsRepository()
    saving.value = true
    error.value = null
    try {
      const created = await repo.createVisitor(visitor)
      visitors.value.unshift(created)
      recordAudit({ action: 'visitor.create', targetId: created.id, targetLabel: created.name })
      useToast().success(`${created.name || 'Visitor'} recorded`)
      return created
    } catch (e: unknown) {
      fail(e, 'Failed to record visitor')
    } finally {
      saving.value = false
    }
  }

  async function updateVisitor(id: string, updates: Partial<Omit<Visitor, 'id'>>) {
    const idx = visitors.value.findIndex((v) => v.id === id)
    if (idx === -1) return
    const repo = useVisitorsRepository()
    saving.value = true
    error.value = null
    try {
      await repo.updateVisitor(id, updates)
      visitors.value[idx] = { ...visitors.value[idx], ...updates } as Visitor
      recordAudit({
        action: 'visitor.update',
        targetId: id,
        targetLabel: visitors.value[idx]!.name,
      })
      useToast().success(`${visitors.value[idx]!.name} updated`)
    } catch (e: unknown) {
      fail(e, 'Failed to update visitor')
    } finally {
      saving.value = false
    }
  }

  async function deleteVisitor(id: string) {
    const name = visitors.value.find((v) => v.id === id)?.name
    const repo = useVisitorsRepository()
    saving.value = true
    error.value = null
    try {
      await repo.deleteVisitor(id)
      visitors.value = visitors.value.filter((v) => v.id !== id)
      recordAudit({ action: 'visitor.delete', targetId: id, targetLabel: name })
      if (name) useToast().success(`${name} removed`)
    } catch (e: unknown) {
      fail(e, 'Failed to delete visitor')
    } finally {
      saving.value = false
    }
  }

  /**
   * Record or correct the children's figure for one service.
   *
   * Clearing the box removes the record rather than storing 0, so the difference between "no
   * children came" and "nobody counted" survives — `childrenOn` reports the latter as `null`.
   */
  async function setChildrenCount(date: string, serviceType: string, count: number | null) {
    const repo = useVisitorsRepository()
    saving.value = true
    error.value = null
    try {
      if (count === null) {
        const id = childrenDocId({ date, serviceType })
        await repo.deleteChildrenCount(id)
        childrenCounts.value = childrenCounts.value.filter((c) => c.id !== id)
        useToast().success('Children’s figure cleared')
        return
      }

      const saved = await repo.saveChildrenCount({ date, serviceType, count })
      const idx = childrenCounts.value.findIndex((c) => c.id === saved.id)
      if (idx === -1) childrenCounts.value.unshift(saved)
      else childrenCounts.value[idx] = saved
      recordAudit({
        action: 'children.record',
        targetId: saved.id,
        targetLabel: `${count} children on ${date}`,
      })
      useToast().success(`${count} children recorded`)
    } catch (e: unknown) {
      fail(e, "Failed to record children's attendance")
    } finally {
      saving.value = false
    }
  }

  return {
    visitors,
    childrenCounts,
    loading,
    saving,
    error,
    loaded,
    load,
    visitorsOn,
    childrenOn,
    recordedDates,
    totalVisitors,
    addVisitor,
    updateVisitor,
    deleteVisitor,
    setChildrenCount,
  }
})
