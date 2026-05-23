<script setup lang="ts">
const membersStore = useMembersStore()
const { exportCSV } = useExportCSV()

const search = ref('')
const page = ref(1)
const perPage = 5

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return membersStore.backsliders.filter(
    (m) => !q || m.name.toLowerCase().includes(q) || m.phone.includes(q)
  )
})

const paginated = computed(() =>
  filtered.value.slice((page.value - 1) * perPage, page.value * perPage)
)

const totalPages = computed(() => Math.ceil(filtered.value.length / perPage))

function doExport() {
  exportCSV(
    membersStore.backsliders.map((m) => ({
      Name: m.name,
      Phone: m.phone,
      'Absence Count': m.absenceCount,
      Status: m.status,
    })),
    'backsliders'
  )
}
</script>

<template>
  <Card padding="none">
    <div
      class="p-4 lg:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div>
        <h3 class="text-sm font-semibold text-gray-900">
          Backslider Summary - Members Needing Follow-up
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">Members absent 3 or more times</p>
      </div>
      <button
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
        style="border-color: #0ba5ec; color: #0ba5ec"
        :aria-label="`Export ${filtered.length} backsliders to CSV`"
        @click="doExport"
      >
        <Icon icon="mdi:upload-outline" class="text-base" />
        Export CSV
      </button>
    </div>

    <div class="p-4 flex gap-2">
      <div class="relative flex-1">
        <Icon
          icon="mdi:magnify"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search here..."
          class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          aria-label="Search backsliders"
        />
      </div>
      <Button variant="secondary" size="sm">
        <template #icon-left><Icon icon="mdi:filter-variant" class="text-base" /></template>
        Filter
      </Button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm" role="table">
        <thead>
          <tr class="bg-gray-50 border-y border-gray-100">
            <th scope="col" class="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-10">
              S/N
            </th>
            <th scope="col" class="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
              Name
            </th>
            <th scope="col" class="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
              Phone Number
            </th>
            <th scope="col" class="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
              Absence Count
            </th>
            <th scope="col" class="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
              Action Required
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(member, idx) in paginated"
            :key="member.id"
            class="border-b border-gray-50 hover:bg-gray-50/50"
          >
            <td class="px-4 py-3 text-gray-500">{{ (page - 1) * perPage + idx + 1 }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <Avatar :name="member.name" size="sm" />
                <span class="font-medium text-gray-900">{{ member.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ member.phone }}</td>
            <td class="px-4 py-3">
              <Badge variant="danger" size="sm">
                <template #icon><Icon icon="mdi:alert-circle" class="text-[10px]" /></template>
                {{ member.absenceCount }} times
              </Badge>
            </td>
            <td class="px-4 py-3">
              <a
                :href="`tel:${member.phone}`"
                class="hover:underline text-sm font-medium"
                style="color: #0ba5ec"
                :aria-label="`Contact ${member.name}`"
              >
                Contact member
              </a>
            </td>
          </tr>
          <tr v-if="!paginated.length">
            <td colspan="5" class="px-4 py-8 text-center text-gray-400">
              <Icon icon="mdi:account-check-outline" class="text-3xl mb-2 block mx-auto" />
              <p>No members needing follow-up</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between px-4 py-3 border-t border-gray-100"
    >
      <p class="text-xs text-gray-500">
        Showing {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, filtered.length) }} of
        {{ filtered.length }}
      </p>
      <div class="flex gap-1">
        <button
          class="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          :disabled="page <= 1"
          @click="page--"
        >
          <Icon icon="mdi:chevron-left" />
        </button>
        <button
          class="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          :disabled="page >= totalPages"
          @click="page++"
        >
          <Icon icon="mdi:chevron-right" />
        </button>
      </div>
    </div>
  </Card>
</template>
