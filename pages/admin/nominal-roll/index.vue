<script setup lang="ts">
import type { Member } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Nominal Roll', description: 'Church member nominal roll management.' })

const { setHeader } = usePageHeader()
const membersStore = useMembersStore()

onMounted(() => {
  setHeader('Church Nominal Roll', 'Showing summary and member details for all categories')
})

const showAddModal = ref(false)
const panelOpen = ref(false)
const panelAutoEdit = ref(false)
const selectedMember = ref<Member | null>(null)

function openPanel(member: Member) {
  panelAutoEdit.value = false
  selectedMember.value = member
  panelOpen.value = true
}

function openPanelEdit(member: Member) {
  selectedMember.value = member
  panelAutoEdit.value = true
  panelOpen.value = true
}

function onMemberSaved(member: Omit<Member, 'id' | 'absenceCount'>) {
  membersStore.addMember({ ...member, absenceCount: 0 })
}

// "Last year" baseline: count members who had joined on or before Dec 31 of the
// previous year. This isn't a true historical snapshot of status (we don't keep
// that), but it gives a useful trend signal off the dateJoined column.
const lastYearCutoff = `${new Date().getFullYear() - 1}-12-31`
const memberJoinedByLastYear = (m: { dateJoined?: string }) =>
  !!m.dateJoined && m.dateJoined <= lastYearCutoff

const lastYear = computed(() => {
  const ms = membersStore.members.filter(memberJoinedByLastYear)
  return {
    active: ms.filter((m) => m.status === 'Active').length,
    sisters: ms.filter((m) => m.gender === 'Female').length,
    brothers: ms.filter((m) => m.gender === 'Male').length,
    weak: ms.filter(
      (m) => m.status === 'Weak' || m.status === 'Distant' || m.status === 'Withdrawal'
    ).length,
  }
})

function pctChange(current: number, prior: number): number {
  if (!prior) return 0
  return Math.round(((current - prior) / prior) * 100)
}

const statCards = computed(() => [
  {
    label: 'Active Members',
    value: membersStore.activeCount,
    priorValue: lastYear.value.active,
    change: pctChange(membersStore.activeCount, lastYear.value.active),
    tab: 'active' as const,
  },
  {
    label: 'Sisters',
    value: membersStore.sisterCount,
    priorValue: lastYear.value.sisters,
    change: pctChange(membersStore.sisterCount, lastYear.value.sisters),
    tab: 'sisters' as const,
  },
  {
    label: 'Brothers',
    value: membersStore.brotherCount,
    priorValue: lastYear.value.brothers,
    change: pctChange(membersStore.brotherCount, lastYear.value.brothers),
    tab: 'brothers' as const,
  },
  {
    label: 'Weak Brethren',
    value: membersStore.weakCount,
    priorValue: lastYear.value.weak,
    change: pctChange(membersStore.weakCount, lastYear.value.weak),
    tab: 'inactive' as const,
  },
])

const tableRef = ref<HTMLElement | null>(null)

function viewList(tab: 'active' | 'sisters' | 'brothers' | 'inactive') {
  membersStore.setFilter({ tab })
  nextTick(() => {
    tableRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Add New Member CTA lives in the admin topbar via teleport, alongside
         the page title rendered by the layout. -->
    <Teleport to="#admin-header-actions" defer>
      <Button @click="showAddModal = true">
        Add New Member
        <template #icon-right><Icon icon="mdi:plus" /></template>
      </Button>
    </Teleport>

    <!-- Stats row + Donut chart -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div class="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card v-for="card in statCards" :key="card.label">
          <div class="flex flex-col gap-2">
            <!-- Top: title + trend badge -->
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm text-gray-600">{{ card.label }}</p>
              <span
                :class="[
                  'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                  card.change > 0 && 'bg-green-50 text-green-600',
                  card.change < 0 && 'bg-red-50 text-red-600',
                  card.change === 0 && 'bg-gray-50 text-gray-500',
                ]"
              >
                <Icon
                  :icon="
                    card.change > 0
                      ? 'mdi:trending-up'
                      : card.change < 0
                        ? 'mdi:trending-down'
                        : 'mdi:minus'
                  "
                  class="text-[12px]"
                />
                {{ Math.abs(card.change) }}%
              </span>
            </div>

            <!-- Big number -->
            <p class="text-3xl font-bold text-gray-900">{{ card.value }}</p>

            <!-- Footer: last year + view list -->
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-400">{{ card.priorValue }} last year</span>
              <button
                class="font-medium text-gray-700 hover:text-blue-600 cursor-pointer"
                @click="viewList(card.tab)"
              >
                View List
              </button>
            </div>
          </div>
        </Card>
      </div>
      <RoleSummaryChart />
    </div>

    <!-- Filters -->
    <div ref="tableRef">
      <MemberFilters />
    </div>

    <!-- Table -->
    <MemberTable @select="openPanel" @edit="openPanelEdit" />

    <!-- Member detail panel -->
    <MemberDetailPanel v-model="panelOpen" :member="selectedMember" :auto-edit="panelAutoEdit" />

    <AddMemberModal v-model="showAddModal" title="Add New Member" @save="onMemberSaved" />
  </div>
</template>
