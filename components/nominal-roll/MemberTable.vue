<script setup lang="ts">
import type { Member } from '~/types'

interface Props {
  /** When provided, overrides the store's filteredMembers — used by the Youth page */
  items?: Member[]
}
const props = defineProps<Props>()
const membersStore = useMembersStore()
const emit = defineEmits<{ add: []; select: [member: Member]; edit: [member: Member] }>()

const page = ref(1)
const perPage = 10
const openMenuId = ref<string | null>(null)

// Use injected items if provided, otherwise fall back to store's filtered list
const sourceMembers = computed(() => props.items ?? membersStore.filteredMembers)

const paginated = computed(() =>
  sourceMembers.value.slice((page.value - 1) * perPage, page.value * perPage)
)
const totalPages = computed(() => Math.ceil(sourceMembers.value.length / perPage))

// Reset to page 1 whenever the source list changes
watch(sourceMembers, () => {
  page.value = 1
})

const statusBadge = {
  Active: 'success',
  Backslider: 'danger',
  Weak: 'warning',
  Distant: 'info',
  Withdrawal: 'neutral',
  Disfellowshipped: 'danger',
  Transfer: 'info',
  Late: 'warning',
} as const

function deleteMember(id: string) {
  membersStore.deleteMember(id)
  openMenuId.value = null
}

function startEdit(member: Member) {
  emit('edit', member)
  openMenuId.value = null
}

function toggleMenu(id: string) {
  openMenuId.value = openMenuId.value === id ? null : id
}

onMounted(() => {
  document.addEventListener('click', () => {
    openMenuId.value = null
  })
})
</script>

<template>
  <Card padding="none">
    <div class="overflow-x-auto">
      <table class="w-full text-sm" role="table">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-800 w-10">
              S/N
            </th>
            <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-800">
              Name
            </th>
            <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-800">
              Gender
            </th>
            <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-800">
              Phone Number
            </th>
            <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-800">
              Email Address
            </th>
            <th scope="col" class="text-left px-4 py-3 text-xs font-semibold text-gray-800">
              Attendance Status
            </th>
            <th scope="col" class="w-10 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(member, idx) in paginated"
            :key="member.id"
            class="border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors"
            @click="emit('select', member)"
          >
            <td class="px-4 py-3 text-gray-500">{{ (page - 1) * perPage + idx + 1 }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <Avatar :name="member.name" size="sm" />
                <span class="font-medium text-gray-900">{{ member.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ member.gender }}</td>
            <td class="px-4 py-3 text-gray-600">{{ member.phone }}</td>
            <td class="px-4 py-3 text-gray-600">{{ member.email }}</td>
            <td class="px-4 py-3">
              <Badge :variant="statusBadge[member.status] ?? 'neutral'">{{ member.status }}</Badge>
            </td>
            <td class="px-4 py-3 relative">
              <button
                class="p-1 rounded hover:bg-gray-100 text-gray-400"
                :aria-label="`Actions for ${member.name}`"
                @click.stop="toggleMenu(member.id)"
              >
                <Icon icon="mdi:dots-vertical" />
              </button>
              <div
                v-if="openMenuId === member.id"
                class="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32"
                @click.stop
              >
                <button
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  @click="startEdit(member)"
                >
                  <Icon icon="mdi:pencil-outline" />
                  Edit
                </button>
                <button
                  class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  @click="deleteMember(member.id)"
                >
                  <Icon icon="mdi:trash-can-outline" />
                  Delete
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!paginated.length">
            <td colspan="7" class="px-4 py-10 text-center text-gray-400">
              <Icon icon="mdi:account-group-outline" class="text-4xl mb-2 block mx-auto" />
              <p>No members found</p>
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
        Showing {{ (page - 1) * perPage + 1 }}–{{
          Math.min(page * perPage, sourceMembers.length)
        }}
        of {{ sourceMembers.length }}
      </p>
      <div class="flex gap-1">
        <button
          class="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          :disabled="page <= 1"
          @click="page--"
        >
          Prev
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          :class="[
            'px-2 py-1 text-xs rounded border',
            p === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-200 hover:bg-gray-50',
          ]"
          @click="page = p"
        >
          {{ p }}
        </button>
        <button
          class="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          :disabled="page >= totalPages"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>
  </Card>
</template>
