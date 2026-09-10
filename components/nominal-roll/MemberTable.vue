<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { Member } from '~/types'

interface Props {
  /** When provided, overrides the store's filteredMembers — used by the Youth page */
  items?: Member[]
}
const props = defineProps<Props>()
const membersStore = useMembersStore()
const emit = defineEmits<{ add: []; select: [member: Member]; edit: [member: Member] }>()

const openMenuId = ref<string | null>(null)
/**
 * Fixed-position coordinates for the open row menu, in viewport space.
 *
 * The menu is teleported to `body` (see template) rather than positioned relative to its row,
 * because the table sits in an `overflow-x-auto` container — and per the CSS overflow spec,
 * giving one axis `auto` while the other is `visible` forces that one to behave as `auto` too. So
 * an absolutely-positioned menu near the bottom of the table got clipped by that same scroll
 * container instead of floating above the page.
 */
const menuPos = ref<{ top: number; left: number } | null>(null)
/** Actions buttons keyed by member id, so `toggleMenu` can compute a position without depending
 * on a click event being passed through correctly. */
const menuButtons: Record<string, HTMLElement | null> = {}
function setMenuButtonRef(id: string, el: Element | ComponentPublicInstance | null) {
  menuButtons[id] = el instanceof HTMLElement ? el : null
}

// Use injected items if provided, otherwise fall back to store's filtered list
const sourceMembers = computed(() => props.items ?? membersStore.filteredMembers)

const { page, total, totalPages, paginated, rangeStart, rangeEnd } = usePagination(
  sourceMembers,
  10
)

// Distinguishes "the roll is empty" from "filters excluded everything", so the
// empty state can say something useful instead of a bare "no members found".
const hasAnyMembers = computed(() =>
  props.items ? props.items.length > 0 : membersStore.members.length > 0
)

const statusBadge = {
  Active: 'success',
  Inactive: 'neutral',
  Backslider: 'danger',
  Weak: 'warning',
  Distant: 'info',
  Withdrawal: 'neutral',
  Disfellowshipped: 'danger',
  Transfer: 'info',
  Late: 'warning',
} as const

// Keyed by member id so only the row being deleted shows a spinner, rather than every row
// reacting to the store's shared `saving` flag.
const { isPending, run } = usePendingAction()

const { confirmDelete } = useConfirm()

async function deleteMember(id: string) {
  openMenuId.value = null
  const member = sourceMembers.value.find((m) => m.id === id)
  // Named, so somebody who clicked the wrong row in a long table can see that they did.
  const ok = await confirmDelete(member?.name ?? 'this member', {
    message:
      'Their record, and their place on the nominal roll, will be removed. This cannot be undone.',
  })
  if (!ok) return
  await run(id, () => membersStore.deleteMember(id).catch(() => {}))
}

function startEdit(member: Member) {
  emit('edit', member)
  openMenuId.value = null
}

/** The member the open row menu belongs to, for the teleported menu template. */
const openMenuMember = computed(() => paginated.value.find((m) => m.id === openMenuId.value))

function toggleMenu(id: string) {
  if (openMenuId.value === id) {
    openMenuId.value = null
    return
  }
  const button = menuButtons[id]
  if (button) {
    const rect = button.getBoundingClientRect()
    menuPos.value = { top: rect.bottom + 4, left: rect.right - 128 } // 128px = the menu's w-32
  }
  openMenuId.value = id
}

// A click anywhere dismisses an open row menu. The handler has to be a named
// reference so it can actually be removed: an inline arrow function leaked one
// permanent document listener — and a retained component instance with it — on
// every mount, and this table renders on both the nominal roll and youth pages.
function closeRowMenu() {
  openMenuId.value = null
}

onMounted(() => {
  document.addEventListener('click', closeRowMenu)
  // The menu is fixed-positioned from a snapshot of the button's coordinates, so a scroll
  // anywhere would leave it floating over the wrong row instead of tracking it.
  window.addEventListener('scroll', closeRowMenu, { passive: true, capture: true })
})
onUnmounted(() => {
  document.removeEventListener('click', closeRowMenu)
  window.removeEventListener('scroll', closeRowMenu, true)
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
            <td class="px-4 py-3 text-gray-500">{{ rangeStart + idx }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <Avatar :src="member.avatar" :name="member.name" size="sm" />
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
                :ref="(el) => setMenuButtonRef(member.id, el)"
                class="p-1 rounded hover:bg-gray-100 text-gray-400"
                :aria-label="`Actions for ${member.name}`"
                @click.stop="toggleMenu(member.id)"
              >
                <Icon icon="mdi:dots-vertical" />
              </button>
            </td>
          </tr>

          <tr v-if="membersStore.loading && !paginated.length">
            <td colspan="7" class="px-4">
              <LoadingState :rows="6" title="Loading members…" />
            </td>
          </tr>
          <tr v-else-if="!paginated.length">
            <td colspan="7" class="px-4">
              <EmptyState
                icon="mdi:account-group-outline"
                :title="hasAnyMembers ? 'No members match these filters' : 'No members yet'"
                :description="
                  hasAnyMembers
                    ? 'Try clearing the search or switching tabs.'
                    : 'Members appear here once they register or are added to the roll.'
                "
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      v-model:page="page"
      :total-pages="totalPages"
      :total="total"
      :range-start="rangeStart"
      :range-end="rangeEnd"
      label="members"
    />
  </Card>

  <!-- Row actions menu: teleported to `body` and fixed-positioned (see `menuPos`) so the
       table's `overflow-x-auto` scroll container can't clip it. -->
  <Teleport to="body">
    <div
      v-if="openMenuMember && menuPos"
      class="fixed z-50 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
      :style="{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }"
      @click.stop
    >
      <button
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
        @click="startEdit(openMenuMember)"
      >
        <Icon icon="mdi:pencil-outline" />
        Edit
      </button>
      <button
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        :disabled="isPending(openMenuMember.id)"
        @click="deleteMember(openMenuMember.id)"
      >
        <Icon
          :icon="isPending(openMenuMember.id) ? 'mdi:loading' : 'mdi:trash-can-outline'"
          :class="isPending(openMenuMember.id) && 'animate-spin'"
        />
        {{ isPending(openMenuMember.id) ? 'Deleting…' : 'Delete' }}
      </button>
    </div>
  </Teleport>
</template>
