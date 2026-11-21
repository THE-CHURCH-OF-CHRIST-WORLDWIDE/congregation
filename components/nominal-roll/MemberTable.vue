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
  <Card padding="none" class="overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm" role="table">
        <thead class="sticky top-0 z-[1] bg-surface-muted">
          <tr>
            <th
              scope="col"
              class="w-12 border-b border-rule px-4 py-2.5 text-right text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
            >
              S/N
            </th>
            <th
              scope="col"
              class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
            >
              Name
            </th>
            <th
              scope="col"
              class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
            >
              Gender
            </th>
            <th
              scope="col"
              class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
            >
              Phone Number
            </th>
            <th
              scope="col"
              class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
            >
              Email Address
            </th>
            <th
              scope="col"
              class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
            >
              Attendance Status
            </th>
            <th scope="col" class="w-12 border-b border-rule px-4 py-2.5">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-rule">
          <tr
            v-for="(member, idx) in paginated"
            :key="member.id"
            :class="[
              'group cursor-pointer transition-colors duration-150 hover:bg-surface-muted/70',
              openMenuId === member.id && 'bg-primary-soft/60 hover:bg-primary-soft/60',
            ]"
            @click="emit('select', member)"
          >
            <td class="num px-4 py-3 text-right text-xs text-ink-subtle">{{ rangeStart + idx }}</td>
            <td class="px-4 py-3">
              <div class="flex min-w-0 items-center gap-3">
                <Avatar :src="member.avatar" :name="member.name" size="sm" />
                <span
                  class="font-medium whitespace-nowrap text-ink transition-colors group-hover:text-primary-ink"
                  >{{ member.name }}</span
                >
              </div>
            </td>
            <td class="px-4 py-3 text-ink-muted">{{ member.gender }}</td>
            <td class="num px-4 py-3 whitespace-nowrap text-ink-muted">{{ member.phone }}</td>
            <td class="px-4 py-3 text-ink-muted">{{ member.email }}</td>
            <td class="px-4 py-3">
              <Badge :variant="statusBadge[member.status] ?? 'neutral'">{{ member.status }}</Badge>
            </td>
            <td class="relative px-4 py-2 text-right">
              <button
                :ref="(el) => setMenuButtonRef(member.id, el)"
                :class="[
                  'inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink',
                  openMenuId === member.id && 'bg-surface-sunken text-ink',
                ]"
                :aria-label="`Actions for ${member.name}`"
                @click.stop="toggleMenu(member.id)"
              >
                <Icon icon="mdi:dots-vertical" class="text-lg" />
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
      class="fixed z-50 w-32 overflow-hidden rounded-md border border-rule bg-surface py-1 text-ink shadow-md"
      :style="{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }"
      @click.stop
    >
      <button
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surface-muted"
        @click="startEdit(openMenuMember)"
      >
        <Icon icon="mdi:pencil-outline" class="text-ink-subtle" />
        Edit
      </button>
      <button
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error transition-colors hover:bg-error-soft disabled:opacity-55"
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
