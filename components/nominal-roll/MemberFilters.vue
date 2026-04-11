<script setup lang="ts">
const membersStore = useMembersStore()
const { exportCSV } = useExportCSV()

const tabs = [
  { label: 'All Members', value: 'all' },
  { label: 'Brothers', value: 'brothers' },
  { label: 'Sisters', value: 'sisters' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const activeTab = computed({
  get: () => membersStore.filters.tab,
  set: (v) => membersStore.setFilter({ tab: v as 'all' | 'brothers' | 'sisters' | 'active' | 'inactive' }),
})

function doImport() {
  const el = document.createElement('input')
  el.type = 'file'
  el.accept = '.csv'
  el.click()
}

function doExport() {
  exportCSV(
    membersStore.filteredMembers.map((m) => ({
      Name: m.name,
      Gender: m.gender,
      Phone: m.phone,
      Email: m.email,
      Status: m.status,
      'Absence Count': m.absenceCount,
    })),
    'members'
  )
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
      <Tabs :tabs="tabs" v-model="activeTab" />
      <div class="flex gap-2 flex-shrink-0">
        <Button variant="secondary" size="sm" @click="doExport">
          <template #icon-left><Icon icon="mdi:upload-outline" class="text-base" /></template>
          Export CSV
        </Button>
        <Button variant="secondary" size="sm" @click="doImport">
          <template #icon-left><Icon icon="mdi:download-outline" class="text-base" /></template>
          Import CSV
        </Button>
      </div>
    </div>

    <div class="flex gap-2 mt-3">
      <div class="relative flex-1">
        <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
        <input
          :value="membersStore.filters.search"
          type="search"
          placeholder="Search here..."
          class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          aria-label="Search members"
          @input="membersStore.setFilter({ search: ($event.target as HTMLInputElement).value })"
        />
      </div>
      <Button variant="secondary" size="sm">
        <template #icon-left><Icon icon="mdi:filter-outline" class="text-base" /></template>
        Filter
      </Button>
    </div>
  </div>
</template>
