<script setup lang="ts">
import type { Member } from '~/types'

const membersStore = useMembersStore()
const { exportCSV } = useExportCSV()

const tabs = [
  { label: 'All Members', value: 'all' },
  { label: 'Brothers', value: 'brothers' },
  { label: 'Sisters', value: 'sisters' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Disfellowshipped', value: 'disfellowshipped' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Weak', value: 'weak' },
  { label: 'Late Brethren', value: 'late' },
]

const activeTab = computed({
  get: () => membersStore.filters.tab,
  set: (v) => membersStore.setFilter({ tab: v as typeof membersStore.filters.tab }),
})

const showImport = ref(false)

async function onImport(members: Omit<Member, 'id' | 'absenceCount'>[]) {
  // Sequential so a mid-import failure stops rather than firing off dozens of
  // half-finished writes.
  for (const m of members) {
    await membersStore.addMember({ ...m, absenceCount: 0 }).catch(() => {})
  }
}

function doExport() {
  exportCSV(
    membersStore.filteredMembers.map((m) => ({
      Name: m.name,
      Gender: m.gender,
      Phone: m.phone,
      Email: m.email,
      'Date of Birth': m.dob ?? '',
      Status: m.status,
      'Marital Status': m.maritalStatus ?? '',
      'Date of Baptism': m.dateOfBaptism ?? '',
      'Date of Registration': m.dateJoined ?? '',
      Country: m.country ?? '',
      State: m.state ?? '',
      LGA: m.localGovernment ?? '',
      Village: m.village ?? '',
      Address: m.address ?? '',
      Occupation: m.occupation ?? '',
    })),
    'members'
  )
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <Tabs v-model="activeTab" :tabs="tabs" />
      <div class="flex shrink-0 gap-2">
        <Button variant="secondary" size="sm" @click="doExport">
          <template #icon-left><Icon icon="mdi:upload-outline" class="text-base" /></template>
          Export CSV
        </Button>
        <Button variant="secondary" size="sm" @click="showImport = true">
          <template #icon-left><Icon icon="mdi:download-outline" class="text-base" /></template>
          Import CSV
        </Button>
      </div>
    </div>

    <div class="flex flex-wrap items-end gap-3 rounded-sm border border-rule bg-surface p-3">
      <div class="relative min-w-48 flex-1">
        <Icon
          icon="mdi:magnify"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base text-ink-subtle"
        />
        <input
          :value="membersStore.filters.search"
          type="search"
          placeholder="Search here..."
          class="min-h-10 w-full rounded-md border border-rule-strong bg-surface py-2 pr-3 pl-9 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          aria-label="Search members"
          @input="membersStore.setFilter({ search: ($event.target as any).value })"
        />
      </div>
      <Button variant="secondary" size="sm" class="min-h-10">
        <template #icon-left><Icon icon="mdi:filter-outline" class="text-base" /></template>
        Filter
      </Button>
    </div>

    <ImportCsvModal v-model="showImport" @import="onImport" />
  </div>
</template>
