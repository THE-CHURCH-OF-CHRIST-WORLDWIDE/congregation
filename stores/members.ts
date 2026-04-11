import { defineStore } from 'pinia'
import type { Member, MemberFilters } from '~/types'

export const useMembersStore = defineStore('members', () => {
  const members = ref<Member[]>([])
  const loading = ref(false)
  const filters = ref<MemberFilters>({
    search: '',
    gender: '',
    status: '',
    tab: 'all',
  })

  const filteredMembers = computed(() => {
    let result = [...members.value]
    const { search, gender, status, tab } = filters.value

    if (tab === 'brothers') result = result.filter((m) => m.gender === 'Male')
    else if (tab === 'sisters') result = result.filter((m) => m.gender === 'Female')
    else if (tab === 'active') result = result.filter((m) => m.status === 'Active')
    else if (tab === 'inactive') result = result.filter((m) => m.status !== 'Active')

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

  const backsliders = computed(() =>
    members.value.filter((m) => m.absenceCount >= 3)
  )

  const activeCount = computed(() =>
    members.value.filter((m) => m.status === 'Active').length
  )

  const sisterCount = computed(() =>
    members.value.filter((m) => m.gender === 'Female').length
  )

  const brotherCount = computed(() =>
    members.value.filter((m) => m.gender === 'Male').length
  )

  const weakCount = computed(() =>
    members.value.filter((m) => m.status === 'Weak' || m.status === 'Distant' || m.status === 'Withdrawal').length
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

  const youthActiveCount = computed(() =>
    youthMembers.value.filter((m) => m.status === 'Active').length
  )

  const youthGirlsCount = computed(() =>
    youthMembers.value.filter((m) => m.gender === 'Female').length
  )

  const youthBoysCount = computed(() =>
    youthMembers.value.filter((m) => m.gender === 'Male').length
  )

  function addMember(member: Omit<Member, 'id'>) {
    const id = String(Date.now())
    members.value.push({ ...member, id })
  }

  function updateMember(id: string, updates: Partial<Member>) {
    const idx = members.value.findIndex((m) => m.id === id)
    if (idx !== -1) members.value[idx] = { ...members.value[idx], ...updates } as Member
  }

  function deleteMember(id: string) {
    members.value = members.value.filter((m) => m.id !== id)
  }

  function setFilter(partial: Partial<MemberFilters>) {
    filters.value = { ...filters.value, ...partial }
  }

  return {
    members,
    loading,
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
    addMember,
    updateMember,
    deleteMember,
    setFilter,
  }
})
