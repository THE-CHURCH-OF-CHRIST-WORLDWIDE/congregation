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

const statCards = computed(() => [
  {
    label: 'Active Members',
    value: membersStore.activeCount,
    change: 10,
    subtitle: `${membersStore.members.length - membersStore.activeCount} inactive`,
    tab: 'active' as const,
  },
  {
    label: 'Sisters',
    value: membersStore.sisterCount,
    change: -10,
    subtitle: `${membersStore.brotherCount} brothers`,
    tab: 'sisters' as const,
  },
  {
    label: 'Brothers',
    value: membersStore.brotherCount,
    change: 10,
    subtitle: `${membersStore.sisterCount} sisters`,
    tab: 'brothers' as const,
  },
  {
    label: 'Weak Brethren',
    value: membersStore.weakCount,
    change: 10,
    subtitle: `${membersStore.members.length - membersStore.weakCount} stable`,
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
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div></div>
      <Button @click="showAddModal = true">
        <template #icon-left><Icon icon="mdi:plus" /></template>
        Add New Member
      </Button>
    </div>

    <!-- Stats row + Donut chart -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div class="xl:col-span-2 grid grid-cols-2 gap-4">
        <Card v-for="card in statCards" :key="card.label">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs text-gray-500 font-medium">{{ card.label }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ card.value }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ card.subtitle }}</p>
            </div>
            <Badge :variant="card.change >= 0 ? 'success' : 'danger'" size="sm">
              <template #icon>
                <Icon
                  :icon="card.change >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'"
                  class="text-[10px]"
                />
              </template>
              {{ Math.abs(card.change) }}%
            </Badge>
          </div>
          <button
            class="mt-3 text-xs text-blue-600 hover:underline cursor-pointer"
            @click="viewList(card.tab)"
          >
            View List
          </button>
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
