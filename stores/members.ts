import { defineStore } from 'pinia'
import { recordAudit } from '~/utils/audit'
import { useMembersRepository } from '~/repositories/membersRepository'
import { churchNumberKey, normaliseChurchNumber } from '~/utils/churchNumber'
import { isYouth } from '~/utils/youth'
import {
  statusUpdatesForRoll,
  summariseStatusUpdates,
  type StatusUpdate,
} from '~/utils/attendanceStatus'
import type { AttendanceRecord, Member, MemberFilters } from '~/types'

export const useMembersStore = defineStore('members', () => {
  const members = ref<Member[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)
  const filters = ref<MemberFilters>({
    search: '',
    gender: '',
    status: '',
    tab: 'all',
  })

  // Statuses that are excluded from the "All Members" default view
  const HIDDEN_FROM_ALL: Member['status'][] = ['Late']

  const filteredMembers = computed(() => {
    let result = [...members.value]
    const { search, gender, status, tab } = filters.value

    if (tab === 'brothers')
      result = result.filter((m) => m.gender === 'Male' && !HIDDEN_FROM_ALL.includes(m.status))
    else if (tab === 'sisters')
      result = result.filter((m) => m.gender === 'Female' && !HIDDEN_FROM_ALL.includes(m.status))
    else if (tab === 'active') result = result.filter((m) => m.status === 'Active')
    else if (tab === 'inactive')
      result = result.filter((m) => !['Active', 'Late'].includes(m.status))
    else if (tab === 'disfellowshipped')
      result = result.filter((m) => m.status === 'Disfellowshipped')
    else if (tab === 'transfer') result = result.filter((m) => m.status === 'Transfer')
    else if (tab === 'weak') result = result.filter((m) => m.status === 'Weak')
    else if (tab === 'late') result = result.filter((m) => m.status === 'Late')
    else result = result.filter((m) => !HIDDEN_FROM_ALL.includes(m.status)) // 'all' tab

    if (gender) result = result.filter((m) => m.gender === gender)
    if (status) result = result.filter((m) => m.status === status)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.includes(q)
      )
    }

    return result
  })

  /**
   * Who, if anyone, already holds this church number — ignoring `exceptId`, so a member editing
   * their own record does not collide with themselves.
   *
   * This is for immediate feedback in the form. It only knows about the members already loaded,
   * so it is not the guarantee: `membersRepository` claims the number in a transaction, which is
   * what actually holds when two people save at once.
   */
  function churchNumberHolder(churchNumber: string, exceptId?: string): Member | undefined {
    const key = churchNumberKey(churchNumber)
    if (!key) return undefined
    return members.value.find(
      (m) => m.id !== exceptId && churchNumberKey(m.churchNumber ?? '') === key
    )
  }

  const activeCount = computed(() => members.value.filter((m) => m.status === 'Active').length)

  const sisterCount = computed(() => members.value.filter((m) => m.gender === 'Female').length)

  const brotherCount = computed(() => members.value.filter((m) => m.gender === 'Male').length)

  const weakCount = computed(
    () =>
      members.value.filter(
        (m) => m.status === 'Weak' || m.status === 'Distant' || m.status === 'Withdrawal'
      ).length
  )

  // Youth: members aged 13–35. `isYouth` is shared with the detail panel, which offers the
  // schooling fields on the same basis.
  const youthMembers = computed(() => {
    const now = new Date()
    return members.value.filter((m) => isYouth(m, now))
  })

  const youthActiveCount = computed(
    () => youthMembers.value.filter((m) => m.status === 'Active').length
  )

  const youthGirlsCount = computed(
    () => youthMembers.value.filter((m) => m.gender === 'Female').length
  )

  const youthBoysCount = computed(
    () => youthMembers.value.filter((m) => m.gender === 'Male').length
  )

  /**
   * Store the number as typed but tidied — trimmed, inner spaces collapsed. A blank one is
   * stored as `''` rather than dropped, so clearing a number releases its reservation instead
   * of silently leaving the old one in place.
   */
  function withNormalisedNumber<T extends { churchNumber?: string }>(input: T): T {
    if (!('churchNumber' in input)) return input
    return { ...input, churchNumber: normaliseChurchNumber(input.churchNumber ?? '') }
  }

  function fail(e: unknown, fallback: string): never {
    error.value = e instanceof Error ? e.message : fallback
    useToast().error(error.value)
    throw e
  }

  /** Fetch the roll once per session. Pass `force` after an external change. */
  async function load(force = false) {
    if (loaded.value && !force) return
    const repo = useMembersRepository()
    loading.value = true
    error.value = null
    try {
      members.value = await repo.fetchMembers()
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load members'
      useToast().error(error.value)
    } finally {
      loading.value = false
    }
  }

  async function addMember(member: Omit<Member, 'id'>): Promise<Member> {
    const repo = useMembersRepository()
    member = withNormalisedNumber(member)
    saving.value = true
    error.value = null
    try {
      const created = await repo.createMember(member)
      members.value.push(created)
      recordAudit({
        action: 'member.create',
        targetId: created.id,
        targetLabel: created.name,
      })
      useToast().success(`${created.name || 'Member'} added`)
      return created
    } catch (e: unknown) {
      fail(e, 'Failed to add member')
    } finally {
      saving.value = false
    }
  }

  async function updateMember(id: string, updates: Partial<Member>) {
    const idx = members.value.findIndex((m) => m.id === id)
    if (idx === -1) return
    const repo = useMembersRepository()
    updates = withNormalisedNumber(updates)
    saving.value = true
    error.value = null
    try {
      await repo.updateMember(id, updates)
      members.value[idx] = { ...members.value[idx], ...updates } as Member
      recordAudit({
        action: 'member.update',
        targetId: id,
        targetLabel: members.value[idx]!.name,
      })
      useToast().success(`${members.value[idx]!.name} updated`)
    } catch (e: unknown) {
      fail(e, 'Failed to update member')
    } finally {
      saving.value = false
    }
  }

  /**
   * Apply the `Active` / `Inactive` labels the Sunday register implies.
   *
   * Called after attendance is saved, which is the only moment the answer can change. Writes each
   * affected member individually — the repository has no batch API — but reports once: a dozen
   * "X updated" toasts for something the user did not ask for would bury the register they did
   * save. Each change still gets its own audit entry, so the log shows exactly who was relabelled
   * and that the app rather than a person did it.
   *
   * Failures are swallowed deliberately. This is bookkeeping that follows a successful save, and
   * it must not turn a saved register into an error.
   */
  async function syncAttendanceStatuses(records: AttendanceRecord[]): Promise<StatusUpdate[]> {
    const updates = statusUpdatesForRoll(members.value, records)
    if (!updates.length) return []

    const repo = useMembersRepository()
    const applied: StatusUpdate[] = []

    for (const update of updates) {
      try {
        await repo.updateMember(update.id, { status: update.to })
        const idx = members.value.findIndex((m) => m.id === update.id)
        if (idx !== -1) members.value[idx] = { ...members.value[idx], status: update.to } as Member
        applied.push(update)
        recordAudit({
          action: 'member.autoStatus',
          targetId: update.id,
          targetLabel: `${update.name}: ${update.from} → ${update.to}`,
        })
      } catch {
        // Leave the member as they were and carry on with the rest of the roll.
      }
    }

    if (applied.length) useToast().info(summariseStatusUpdates(applied))
    return applied
  }

  async function deleteMember(id: string) {
    const name = members.value.find((m) => m.id === id)?.name
    const repo = useMembersRepository()
    saving.value = true
    error.value = null
    try {
      await repo.deleteMember(id)
      members.value = members.value.filter((m) => m.id !== id)
      recordAudit({ action: 'member.delete', targetId: id, targetLabel: name })
      if (name) useToast().success(`${name} deleted`)
    } catch (e: unknown) {
      fail(e, 'Failed to delete member')
    } finally {
      saving.value = false
    }
  }

  function setFilter(partial: Partial<MemberFilters>) {
    filters.value = { ...filters.value, ...partial }
  }

  return {
    members,
    loading,
    saving,
    error,
    loaded,
    filters,
    filteredMembers,
    churchNumberHolder,
    activeCount,
    sisterCount,
    brotherCount,
    weakCount,
    youthMembers,
    youthActiveCount,
    youthGirlsCount,
    youthBoysCount,
    load,
    addMember,
    updateMember,
    syncAttendanceStatuses,
    deleteMember,
    setFilter,
  }
})
