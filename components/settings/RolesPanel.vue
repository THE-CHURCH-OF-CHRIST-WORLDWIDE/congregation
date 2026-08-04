<script setup lang="ts">
import type { ChurchRole, ChurchRoleId, RolePermissions, AppPage, AppAction } from '~/types'
import { ALL_PAGES, ALL_ACTIONS } from '~/stores/roles'

const rolesStore = useRolesStore()
const membersStore = useMembersStore()
const accountsStore = useAccountsStore()
const invitationsStore = useInvitationsStore()
const authStore = useAuthStore()

onMounted(() => {
  rolesStore.load()
  accountsStore.load()
  invitationsStore.load()
})

// ─── Action labels ─────────────────────────────────────────────────────────────
const actionLabels: Record<AppAction, string> = {
  view: 'View',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  export: 'Export',
}

// ─── Role card selection ───────────────────────────────────────────────────────
const selectedRoleId = ref<string | null>(null)
const selectedRole = computed(
  () => rolesStore.roles.find((r) => r.id === selectedRoleId.value) ?? null
)

// Editable copy of the selected role's permissions
const editPerms = ref<RolePermissions>({})

function openRole(role: ChurchRole) {
  selectedRoleId.value = role.id
  editPerms.value = JSON.parse(JSON.stringify(role.permissions))
}

function closeRole() {
  selectedRoleId.value = null
  editPerms.value = {}
}

function togglePerm(page: AppPage, action: AppAction) {
  if (!editPerms.value[page]) editPerms.value[page] = {}
  editPerms.value[page]![action] = !editPerms.value[page]![action]
  // If disabling view, disable all other actions too
  if (action === 'view' && !editPerms.value[page]![action]) {
    for (const a of ALL_ACTIONS) editPerms.value[page]![a] = false
  }
  // If enabling any action other than view, auto-enable view
  if (action !== 'view' && editPerms.value[page]![action]) {
    editPerms.value[page]!.view = true
  }
}

function toggleAllForPage(page: AppPage) {
  const allOn = ALL_ACTIONS.every((a) => editPerms.value[page]?.[a])
  if (!editPerms.value[page]) editPerms.value[page] = {}
  for (const a of ALL_ACTIONS) editPerms.value[page]![a] = !allOn
}

function toggleAllForAction(action: AppAction) {
  const allOn = ALL_PAGES.every((p) => editPerms.value[p]?.[action])
  for (const p of ALL_PAGES) {
    if (!editPerms.value[p]) editPerms.value[p] = {}
    editPerms.value[p]![action] = !allOn
    if (!allOn && action !== 'view') editPerms.value[p]!.view = true
    if (allOn && action === 'view') {
      for (const a of ALL_ACTIONS) editPerms.value[p]![a] = false
    }
  }
}

async function saveRolePerms() {
  if (!selectedRoleId.value) return
  try {
    await rolesStore.updateRolePermissions(selectedRoleId.value, { ...editPerms.value })
  } catch {
    return // Toast already shown; keep the matrix open so the edit is not lost.
  }
  closeRole()
}

// ─── Assign role modal ─────────────────────────────────────────────────────────
const showAssign = ref(false)
const assignForm = reactive({ memberId: '', roleId: '' })
const assignErrors = reactive({ memberId: '', roleId: '' })
const memberSearch = ref('')

const filteredMembers = computed(() => {
  const q = memberSearch.value.toLowerCase()
  return membersStore.members
    .filter((m) => m.name.toLowerCase().includes(q) || m.phone.includes(q))
    .slice(0, 20)
})

function openAssign() {
  assignForm.memberId = ''
  assignForm.roleId = ''
  memberSearch.value = ''
  Object.assign(assignErrors, { memberId: '', roleId: '' })
  showAssign.value = true
}

function selectMember(m: { id: string; name: string }) {
  assignForm.memberId = m.id
  memberSearch.value = m.name
}

// The store surfaces the reason via toast on failure. Keep the modal open in that case so
// nothing the user selected is lost — a rejected write is usually a missing role, not a typo.
async function doAssign() {
  assignErrors.memberId = assignForm.memberId ? '' : 'Select a member'
  assignErrors.roleId = assignForm.roleId ? '' : 'Select a role'
  if (assignErrors.memberId || assignErrors.roleId) return
  try {
    await rolesStore.assignRole(assignForm.memberId, assignForm.roleId)
    showAssign.value = false
  } catch {
    // Toast already shown.
  }
}

async function revoke(assignmentId: string) {
  await rolesStore.revokeAssignment(assignmentId).catch(() => {})
}

// ─── Account access (users/{uid}) ──────────────────────────────────────────────
// Separate from member assignments above: this is what Firestore rules read to authorise
// writes. Only a Super Admin may change it, and the Firebase client SDK cannot list Auth
// accounts — so a brand-new account is added by pasting its UID from the console.
const grantForm = reactive({ uid: '', email: '', roleId: '' as ChurchRoleId | '' })
const grantErrors = reactive({ uid: '', roleId: '' })

async function doGrant() {
  grantErrors.uid = grantForm.uid.trim() ? '' : 'Paste the account UID'
  grantErrors.roleId = grantForm.roleId ? '' : 'Choose a role'
  if (grantErrors.uid || grantErrors.roleId) return
  try {
    await accountsStore.grantRole(grantForm.uid, grantForm.roleId as ChurchRoleId, grantForm.email)
    Object.assign(grantForm, { uid: '', email: '', roleId: '' })
  } catch {
    // Toast already shown.
  }
}

async function changeAccountRole(uid: string, roleId: string, email?: string) {
  await accountsStore.grantRole(uid, roleId as ChurchRoleId, email).catch(() => {})
}

async function doRevokeAccess(uid: string) {
  await accountsStore.revokeAccess(uid).catch(() => {})
}

// ─── Invitations ───────────────────────────────────────────────────────────────
// Preferred over pasting a UID: the invitee gets an emailed link, and claiming it creates
// both their Auth account and their users/{uid} record. No UID hunting in the console.
const inviteForm = reactive({ email: '', roleId: '' as ChurchRoleId | '' })
const inviteErrors = reactive({ email: '', roleId: '' })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function doInvite() {
  const email = inviteForm.email.trim()
  inviteErrors.email = !email
    ? 'Enter an email address'
    : EMAIL_RE.test(email)
      ? ''
      : 'Enter a valid email address'
  inviteErrors.roleId = inviteForm.roleId ? '' : 'Choose a role'
  if (inviteErrors.email || inviteErrors.roleId) return
  try {
    await invitationsStore.invite(
      email,
      inviteForm.roleId as ChurchRoleId,
      authStore.user?.email ?? undefined
    )
    Object.assign(inviteForm, { email: '', roleId: '' })
  } catch {
    // Toast already shown.
  }
}

async function doRevokeInvite(email: string) {
  await invitationsStore.revoke(email).catch(() => {})
}

function inviteRoleName(roleId: string) {
  return rolesStore.roleById(roleId)?.name ?? roleId
}

// ─── Custom permissions modal ─────────────────────────────────────────────────
const showCustom = ref(false)
const customAssignmentId = ref('')
const customPerms = ref<RolePermissions>({})

function openCustom(assignmentId: string) {
  customAssignmentId.value = assignmentId
  const assignment = rolesStore.assignments.find((a) => a.id === assignmentId)
  const basePerms = rolesStore.roleById(assignment?.roleId ?? '')?.permissions ?? {}
  // Start from merged base + existing custom
  customPerms.value = JSON.parse(
    JSON.stringify({
      ...basePerms,
      ...(assignment?.customPermissions ?? {}),
    })
  )
  showCustom.value = true
}

async function saveCustomPerms() {
  try {
    await rolesStore.updateCustomPermissions(customAssignmentId.value, { ...customPerms.value })
  } catch {
    return // Toast already shown; leave the modal open.
  }
  showCustom.value = false
}

function toggleCustomPerm(page: AppPage, action: AppAction) {
  if (!customPerms.value[page]) customPerms.value[page] = {}
  customPerms.value[page]![action] = !customPerms.value[page]![action]
  if (action === 'view' && !customPerms.value[page]![action]) {
    for (const a of ALL_ACTIONS) customPerms.value[page]![a] = false
  }
  if (action !== 'view' && customPerms.value[page]![action]) {
    customPerms.value[page]!.view = true
  }
}

// ─── Assignments pagination ───────────────────────────────────────────────────
const assignments = computed(() => rolesStore.assignmentsWithRole())
const {
  page: assignPage,
  total: assignTotal,
  totalPages: assignTotalPages,
  paginated: pagedAssignments,
  rangeStart: assignFrom,
  rangeEnd: assignTo,
} = usePagination(assignments, 10)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function memberName(id: string) {
  return membersStore.members.find((m) => m.id === id)?.name ?? '—'
}

function memberAvatar(id: string) {
  return membersStore.members.find((m) => m.id === id)?.avatar
}

function permCount(perms: RolePermissions) {
  let count = 0
  for (const p of ALL_PAGES) {
    for (const a of ALL_ACTIONS) {
      if (perms[p]?.[a]) count++
    }
  }
  return count
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- ── Section header ───────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-gray-900">Roles & Permissions</h2>
        <p class="text-sm text-gray-500 mt-0.5">
          Define what each role can access and assign roles to members.
        </p>
      </div>
      <Button @click="openAssign">
        <template #icon-left><Icon icon="mdi:account-plus-outline" /></template>
        Assign Role
      </Button>
    </div>

    <!-- ── Role definitions grid ─────────────────────────────────────────────── -->
    <div>
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Role Definitions
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <button
          v-for="role in rolesStore.roles"
          :key="role.id"
          class="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition-all group"
          @click="openRole(role)"
        >
          <div class="flex items-start justify-between mb-3">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: role.color + '20' }"
            >
              <Icon
                icon="mdi:shield-account-outline"
                class="text-lg"
                :style="{ color: role.color }"
              />
            </div>
            <Badge variant="neutral" size="sm">{{ permCount(role.permissions) }} perms</Badge>
          </div>
          <p class="text-sm font-bold text-gray-900 leading-tight">{{ role.name }}</p>
          <p class="text-xs text-gray-400 mt-1 line-clamp-2">{{ role.description }}</p>
          <p class="text-xs text-blue-500 mt-3 font-medium group-hover:underline">
            Edit permissions →
          </p>
        </button>
      </div>
    </div>

    <!-- ── Member assignments table ──────────────────────────────────────────── -->
    <div>
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Member Assignments
      </p>
      <Card padding="none">
        <div class="overflow-x-auto">
          <table class="w-full text-sm" role="table">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Member</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Role</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Assigned</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Custom Perms</th>
                <th class="w-24 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="a in pagedAssignments"
                :key="a.id"
                class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <Avatar
                      :src="memberAvatar(a.memberId)"
                      :name="memberName(a.memberId)"
                      size="sm"
                    />
                    <span class="font-medium text-gray-900">{{ memberName(a.memberId) }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    v-if="a.role"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    :style="{ backgroundColor: a.role.color + '18', color: a.role.color }"
                  >
                    <Icon icon="mdi:shield-account-outline" class="text-[11px]" />
                    {{ a.role.name }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500 text-xs">{{ a.assignedAt }}</td>
                <td class="px-4 py-3">
                  <Badge
                    v-if="a.customPermissions && Object.keys(a.customPermissions).length"
                    variant="warning"
                    size="sm"
                  >
                    <template #icon><Icon icon="mdi:tune-variant" class="text-[10px]" /></template>
                    Custom
                  </Badge>
                  <span v-else class="text-xs text-gray-400">Role defaults</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 justify-end">
                    <button
                      class="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      aria-label="Customize permissions"
                      title="Customize permissions"
                      @click="openCustom(a.id)"
                    >
                      <Icon icon="mdi:tune-variant" class="text-base" />
                    </button>
                    <button
                      class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Revoke role"
                      title="Revoke role"
                      @click="revoke(a.id)"
                    >
                      <Icon icon="mdi:account-remove-outline" class="text-base" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="membersStore.loading && !pagedAssignments.length">
                <td colspan="5" class="px-4">
                  <LoadingState :rows="4" size="sm" title="Loading assignments…" />
                </td>
              </tr>
              <tr v-else-if="!pagedAssignments.length">
                <td colspan="5" class="px-4">
                  <EmptyState
                    icon="mdi:shield-account-outline"
                    title="No roles assigned yet"
                    description="Use the Assign Role button to give a member access to the dashboard."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-model:page="assignPage"
          :total-pages="assignTotalPages"
          :total="assignTotal"
          :range-start="assignFrom"
          :range-end="assignTo"
          label="assignments"
        />
      </Card>
    </div>

    <!-- ── Account access ────────────────────────────────────────────────────── -->
    <div>
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Dashboard Access
      </p>

      <Card>
        <div class="flex items-start gap-2.5 rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
          <Icon icon="mdi:information-outline" class="mt-0.5 shrink-0 text-sm" />
          <p>
            This is what actually grants access: an account can only read or change church data once
            it appears here. It is separate from the member assignments above — most people on the
            nominal roll have no login at all. Accounts are created in the Firebase console
            (Authentication → Users); copy the UID from there to grant access.
          </p>
        </div>

        <!-- Invite by email — the normal way to add someone -->
        <div v-if="authStore.isSuperAdmin" class="mt-4">
          <p class="mb-2 text-xs font-semibold text-gray-500">Invite by email</p>
          <div class="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              v-model="inviteForm.email"
              label="Email address"
              type="email"
              placeholder="person@example.com"
              :error="inviteErrors.email"
            />
            <Select
              v-model="inviteForm.roleId"
              label="Role"
              placeholder="Choose a role"
              :options="rolesStore.roles.map((r) => ({ label: r.name, value: r.id }))"
              :error="inviteErrors.roleId"
            />
            <div class="flex items-end">
              <Button :loading="invitationsStore.saving" @click="doInvite">
                <template #icon-left><Icon icon="mdi:email-fast-outline" /></template>
                Send Invitation
              </Button>
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            They receive a sign-in link by email. Opening it creates their account and applies this
            role — no password to share, and nothing to do in the Firebase console.
          </p>
        </div>

        <!-- Pending invitations -->
        <div v-if="invitationsStore.invitations.length" class="mt-4">
          <p class="mb-2 text-xs font-semibold text-gray-500">Pending invitations</p>
          <ul class="divide-y divide-gray-100 rounded-lg border border-gray-200">
            <li
              v-for="invite in invitationsStore.invitations"
              :key="invite.email"
              class="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span class="min-w-0 truncate text-gray-700">{{ invite.email }}</span>
              <span class="flex shrink-0 items-center gap-2">
                <span class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {{ inviteRoleName(invite.roleId) }}
                </span>
                <button
                  v-if="authStore.isSuperAdmin"
                  class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  :aria-label="`Revoke invitation for ${invite.email}`"
                  @click="doRevokeInvite(invite.email)"
                >
                  <Icon icon="mdi:close" class="text-sm" />
                </button>
              </span>
            </li>
          </ul>
        </div>

        <!-- Grant by UID — fallback for an account that already exists -->
        <details v-if="authStore.isSuperAdmin" class="mt-4">
          <summary class="cursor-pointer text-xs font-semibold text-gray-500">
            Or grant an existing account by UID
          </summary>
          <div class="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              v-model="grantForm.uid"
              label="Account UID"
              placeholder="from Authentication → Users"
              :error="grantErrors.uid"
            />
            <Input
              v-model="grantForm.email"
              label="Email (optional)"
              placeholder="for legibility"
            />
            <div class="flex flex-col gap-1">
              <Select
                v-model="grantForm.roleId"
                label="Role"
                placeholder="Choose a role"
                :options="rolesStore.roles.map((r) => ({ label: r.name, value: r.id }))"
                :error="grantErrors.roleId"
              />
            </div>
            <div class="sm:col-span-3 flex justify-end">
              <Button :loading="accountsStore.saving" @click="doGrant">
                <template #icon-left><Icon icon="mdi:shield-key-outline" /></template>
                Grant Access
              </Button>
            </div>
          </div>
        </details>

        <p v-if="!authStore.isSuperAdmin" class="mt-4 text-xs text-gray-500">
          Only a Super Admin can invite people or change who has access.
        </p>
      </Card>

      <Card padding="none" class="mt-3">
        <div class="overflow-x-auto">
          <table class="w-full text-sm" role="table">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Account</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">UID</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Role</th>
                <th class="w-20 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="account in accountsStore.records"
                :key="account.uid"
                class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3">
                  <span class="text-gray-900">{{ account.email ?? '—' }}</span>
                  <span
                    v-if="account.uid === authStore.user?.uid"
                    class="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500"
                  >
                    you
                  </span>
                </td>
                <td class="px-4 py-3">
                  <code class="text-xs text-gray-500">{{ account.uid }}</code>
                </td>
                <td class="px-4 py-3">
                  <select
                    v-if="authStore.isSuperAdmin"
                    :value="account.roleId"
                    :aria-label="`Role for ${account.email ?? account.uid}`"
                    class="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs"
                    @change="
                      changeAccountRole(
                        account.uid,
                        ($event.target as HTMLSelectElement).value,
                        account.email
                      )
                    "
                  >
                    <option v-for="role in rolesStore.roles" :key="role.id" :value="role.id">
                      {{ role.name }}
                    </option>
                  </select>
                  <span v-else class="text-xs text-gray-600">
                    {{ rolesStore.roleById(account.roleId)?.name ?? account.roleId }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    v-if="authStore.isSuperAdmin && account.uid !== authStore.user?.uid"
                    class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    :aria-label="`Revoke access for ${account.email ?? account.uid}`"
                    @click="doRevokeAccess(account.uid)"
                  >
                    <Icon icon="mdi:close" class="text-sm" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <LoadingState v-if="accountsStore.loading" />
          <p
            v-else-if="!accountsStore.records.length"
            class="px-4 py-6 text-center text-sm text-gray-400"
          >
            No accounts have been granted access yet.
          </p>
        </div>
      </Card>
    </div>
  </div>

  <!-- ── Edit role permissions modal ──────────────────────────────────────────── -->
  <Modal
    :model-value="!!selectedRoleId"
    :title="selectedRole ? `Edit Permissions — ${selectedRole.name}` : ''"
    size="xl"
    @update:model-value="closeRole"
  >
    <div v-if="selectedRole" class="flex flex-col gap-4">
      <p class="text-sm text-gray-500">{{ selectedRole.description }}</p>

      <!-- Permission matrix -->
      <div class="overflow-x-auto rounded-xl border border-gray-200">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-36">Page</th>
              <th v-for="action in ALL_ACTIONS" :key="action" class="px-3 py-2.5 text-center">
                <button
                  class="text-xs font-semibold text-gray-600 hover:text-blue-600 capitalize transition-colors"
                  :title="`Toggle all ${action}`"
                  @click="toggleAllForAction(action)"
                >
                  {{ actionLabels[action] }}
                </button>
              </th>
              <th class="px-3 py-2.5 text-center text-xs font-medium text-gray-400">All</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="page in ALL_PAGES"
              :key="page"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-2.5 font-medium text-gray-700 text-xs">{{ page }}</td>
              <td v-for="action in ALL_ACTIONS" :key="action" class="px-3 py-2.5 text-center">
                <button
                  :class="[
                    'w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all',
                    editPerms[page]?.[action]
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300 hover:border-blue-400',
                  ]"
                  :aria-label="`${editPerms[page]?.[action] ? 'Revoke' : 'Grant'} ${action} on ${page}`"
                  @click="togglePerm(page, action)"
                >
                  <Icon
                    v-if="editPerms[page]?.[action]"
                    icon="mdi:check"
                    class="text-white text-xs"
                  />
                </button>
              </td>
              <td class="px-3 py-2.5 text-center">
                <button
                  class="text-xs text-gray-400 hover:text-blue-600 font-medium transition-colors"
                  @click="toggleAllForPage(page)"
                >
                  {{ ALL_ACTIONS.every((a) => editPerms[page]?.[a]) ? 'None' : 'All' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-xs text-gray-400">
        Click column headers to toggle all pages for that action. Click "All/None" on a row to
        toggle all actions for that page. Enabling any action auto-enables View. Disabling View
        clears all.
      </p>
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <Button variant="secondary" @click="closeRole">Cancel</Button>
        <Button @click="saveRolePerms">
          <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
          Save Permissions
        </Button>
      </div>
    </template>
  </Modal>

  <!-- ── Assign role modal ─────────────────────────────────────────────────── -->
  <Modal v-model="showAssign" title="Assign Role to Member" size="md">
    <div class="flex flex-col gap-4">
      <!-- Member search -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700"
          >Member<span class="text-red-500 ml-0.5">*</span></label
        >
        <div class="relative">
          <Icon
            icon="mdi:magnify"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base"
          />
          <input
            v-model="memberSearch"
            type="text"
            placeholder="Search by name or phone..."
            class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div
          v-if="memberSearch || filteredMembers.length"
          class="mt-1 border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto"
        >
          <button
            v-for="m in filteredMembers"
            :key="m.id"
            :class="[
              'w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-blue-50 transition-colors',
              assignForm.memberId === m.id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700',
            ]"
            @click="selectMember(m)"
          >
            <Avatar :src="m.avatar" :name="m.name" size="sm" class="flex-shrink-0" />
            <div>
              <p class="font-medium">{{ m.name }}</p>
              <p class="text-xs text-gray-400">{{ m.phone }}</p>
            </div>
            <Icon
              v-if="assignForm.memberId === m.id"
              icon="mdi:check-circle"
              class="ml-auto text-blue-600"
            />
          </button>
          <p v-if="!filteredMembers.length" class="text-center py-4 text-xs text-gray-400">
            No members found
          </p>
        </div>
        <p v-if="assignErrors.memberId" class="text-xs text-red-500">{{ assignErrors.memberId }}</p>
      </div>

      <!-- Role picker -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700"
          >Role<span class="text-red-500 ml-0.5">*</span></label
        >
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="role in rolesStore.roles"
            :key="role.id"
            :class="[
              'text-left px-3 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2',
              assignForm.roleId === role.id
                ? 'border-current'
                : 'border-gray-200 hover:border-gray-300',
            ]"
            :style="
              assignForm.roleId === role.id
                ? { borderColor: role.color, backgroundColor: role.color + '10' }
                : {}
            "
            @click="assignForm.roleId = role.id"
          >
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: role.color + '22' }"
            >
              <Icon
                icon="mdi:shield-account-outline"
                class="text-sm"
                :style="{ color: role.color }"
              />
            </div>
            <span class="text-xs font-semibold text-gray-800">{{ role.name }}</span>
          </button>
        </div>
        <p v-if="assignErrors.roleId" class="text-xs text-red-500">{{ assignErrors.roleId }}</p>
      </div>

      <!-- Role description preview -->
      <div
        v-if="assignForm.roleId"
        class="rounded-xl p-3 text-xs text-gray-600"
        :style="{
          backgroundColor: (rolesStore.roleById(assignForm.roleId)?.color ?? '#6366f1') + '12',
        }"
      >
        <p
          class="font-semibold mb-0.5"
          :style="{ color: rolesStore.roleById(assignForm.roleId)?.color }"
        >
          {{ rolesStore.roleById(assignForm.roleId)?.name }}
        </p>
        <p>{{ rolesStore.roleById(assignForm.roleId)?.description }}</p>
        <p class="mt-1 text-gray-400">
          {{ permCount(rolesStore.roleById(assignForm.roleId)?.permissions ?? {}) }} permissions
          across
          {{ Object.keys(rolesStore.roleById(assignForm.roleId)?.permissions ?? {}).length }} pages
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <Button variant="secondary" @click="showAssign = false">Cancel</Button>
        <Button @click="doAssign">
          <template #icon-left><Icon icon="mdi:shield-check-outline" /></template>
          Assign Role
        </Button>
      </div>
    </template>
  </Modal>

  <!-- ── Custom permissions modal ──────────────────────────────────────────── -->
  <Modal v-model="showCustom" title="Customize Member Permissions" size="xl">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-gray-500">
        These permissions override the role defaults for this specific member only.
      </p>

      <div class="overflow-x-auto rounded-xl border border-gray-200">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-36">Page</th>
              <th
                v-for="action in ALL_ACTIONS"
                :key="action"
                class="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 capitalize"
              >
                {{ actionLabels[action] }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="page in ALL_PAGES"
              :key="page"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-2.5 font-medium text-gray-700 text-xs">{{ page }}</td>
              <td v-for="action in ALL_ACTIONS" :key="action" class="px-3 py-2.5 text-center">
                <button
                  :class="[
                    'w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all',
                    customPerms[page]?.[action]
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300 hover:border-blue-400',
                  ]"
                  :aria-label="`${customPerms[page]?.[action] ? 'Revoke' : 'Grant'} ${action} on ${page}`"
                  @click="toggleCustomPerm(page, action)"
                >
                  <Icon
                    v-if="customPerms[page]?.[action]"
                    icon="mdi:check"
                    class="text-white text-xs"
                  />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <Button variant="secondary" @click="showCustom = false">Cancel</Button>
        <Button @click="saveCustomPerms">
          <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
          Save Custom Permissions
        </Button>
      </div>
    </template>
  </Modal>
</template>
