import { defineStore } from 'pinia'
import { useMembersRepository } from '~/repositories/membersRepository'
import type { Member, MemberFilters } from '~/types'

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

  const backsliders = computed(() => members.value.filter((m) => m.absenceCount >= 3))

  const activeCount = computed(() => members.value.filter((m) => m.status === 'Active').length)

  const sisterCount = computed(() => members.value.filter((m) => m.gender === 'Female').length)

  const brotherCount = computed(() => members.value.filter((m) => m.gender === 'Male').length)

  const weakCount = computed(
    () =>
      members.value.filter(
        (m) => m.status === 'Weak' || m.status === 'Distant' || m.status === 'Withdrawal'
      ).length
  )

  // Youth: members aged 13–35
  const youthMembers = computed(() => {
    const now = new Date()
    return members.value.filter((m) => {
      if (!m.dob) return false
      const age = now.getFullYear() - new Date(m.dob).getFullYear()
      return age >= 13 && age <= 35
    })
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
    saving.value = true
    error.value = null
    try {
      const created = await repo.createMember(member)
      members.value.push(created)
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
    saving.value = true
    error.value = null
    try {
      await repo.updateMember(id, updates)
      members.value[idx] = { ...members.value[idx], ...updates } as Member
      useToast().success(`${members.value[idx]!.name} updated`)
    } catch (e: unknown) {
      fail(e, 'Failed to update member')
    } finally {
      saving.value = false
    }
  }

  async function deleteMember(id: string) {
    const name = members.value.find((m) => m.id === id)?.name
    const repo = useMembersRepository()
    saving.value = true
    error.value = null
    try {
      await repo.deleteMember(id)
      members.value = members.value.filter((m) => m.id !== id)
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
    backsliders,
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
    deleteMember,
    setFilter,
  }
})
