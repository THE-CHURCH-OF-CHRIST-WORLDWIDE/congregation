<script setup lang="ts">
import type { ChurchRole, ChurchRoleId, RolePermissions, AppPage, AppAction } from '~/types'
import { ALL_PAGES, ALL_ACTIONS } from '~/stores/roles'

const rolesStore = useRolesStore()
const membersStore = useMembersStore()
const accountsStore = useAccountsStore()
const authStore = useAuthStore()

onMounted(() => {
  rolesStore.load()
  accountsStore.load()
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

/** A password the admin can hand to someone directly, without relying on email deliverability
 * or the project's email-link sign-in setting. */
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  const bytes = new Uint32Array(12)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (n) => chars[n % chars.length]).join('')
}

// ─── Assign role modal ─────────────────────────────────────────────────────────
const showAssign = ref(false)
const showAssignPassword = ref(false)
const assignForm = reactive({
  memberId: '',
  roleId: '',
  sendInvite: false,
  inviteEmail: '',
  invitePassword: '',
})
const assignErrors = reactive({ memberId: '', roleId: '', inviteEmail: '', invitePassword: '' })
const memberSearch = ref('')

const filteredMembers = computed(() => {
  const q = memberSearch.value.toLowerCase()
  return membersStore.members
    .filter((m) => m.name.toLowerCase().includes(q) || m.phone.includes(q))
    .slice(0, 20)
})

/** A member already wired to a login — creating another account for them would just error. */
const existingAccountForMember = computed(() =>
  assignForm.memberId
    ? accountsStore.records.find((a) => a.memberId === assignForm.memberId)
    : undefined
)

function openAssign() {
  assignForm.memberId = ''
  assignForm.roleId = ''
  assignForm.sendInvite = false
  assignForm.inviteEmail = ''
  assignForm.invitePassword = ''
  showAssignPassword.value = false
  memberSearch.value = ''
  Object.assign(assignErrors, { memberId: '', roleId: '', inviteEmail: '', invitePassword: '' })
  showAssign.value = true
}

function selectMember(m: { id: string; name: string; email?: string }) {
  assignForm.memberId = m.id
  memberSearch.value = m.name
  assignForm.inviteEmail = m.email ?? ''
  // Default the login on only when there's somewhere to send it and no account exists yet —
  // an admin can still untick it for members who shouldn't get dashboard access.
  assignForm.sendInvite = !!m.email && !existingAccountForMember.value
  assignForm.invitePassword = assignForm.sendInvite ? generatePassword() : ''
}

// The store surfaces the reason via toast on failure. Keep the modal open in that case so
// nothing the user selected is lost — a rejected write is usually a missing role, not a typo.
async function doAssign() {
  assignErrors.memberId = assignForm.memberId ? '' : 'Select a member'
  assignErrors.roleId = assignForm.roleId ? '' : 'Select a role'
  assignErrors.inviteEmail = ''
  assignErrors.invitePassword = ''
  if (assignForm.sendInvite) {
    const email = assignForm.inviteEmail.trim()
    assignErrors.inviteEmail = !email
      ? 'Enter an email address'
      : EMAIL_RE.test(email)
        ? ''
        : 'Enter a valid email address'
    assignErrors.invitePassword =
      assignForm.invitePassword.length >= 6 ? '' : 'Use at least 6 characters'
  }
  if (
    assignErrors.memberId ||
    assignErrors.roleId ||
    assignErrors.inviteEmail ||
    assignErrors.invitePassword
  )
    return
  try {
    await rolesStore.assignRole(assignForm.memberId, assignForm.roleId)
  } catch {
    return // Toast already shown; keep the modal open so nothing is lost.
  }
  showAssign.value = false
  if (!assignForm.sendInvite) return
  // Best-effort and separate from the assignment above: the role is already granted either
  // way, and createAccount shows its own toast on failure.
  await accountsStore
    .createAccount(
      assignForm.inviteEmail.trim(),
      assignForm.invitePassword,
      assignForm.roleId as ChurchRoleId,
      assignForm.memberId
    )
    .catch(() => {})
}

// Row-level revokes are keyed so only the clicked row spins, not every row bound to a
// shared store flag.
const { isPending, run } = usePendingAction()

const { confirm } = useConfirm()

async function revoke(assignmentId: string) {
  const assignment = rolesStore.assignments.find((a) => a.id === assignmentId)
  const memberId = assignment?.memberId
  const who = membersStore.members.find((m) => m.id === memberId)?.name

  // Only warn about losing login access when this is the member's last remaining role — someone
  // holding another role assignment keeps whatever access that one grants.
  const isLastRole =
    !!memberId && rolesStore.assignments.filter((a) => a.memberId === memberId).length === 1
  const account = memberId ? accountsStore.records.find((a) => a.memberId === memberId) : undefined
  const willLoseAccess = isLastRole && !!account

  const ok = await confirm({
    title: who ? `Revoke ${who}'s role?` : 'Revoke this role?',
    message: willLoseAccess
      ? 'This is their only role, so their dashboard login will be revoked too. They keep their place on the nominal roll, and reassigning a role later can create them a fresh login.'
      : 'They keep their place on the nominal roll — only the role is removed.',
    confirmLabel: 'Revoke',
  })
  if (!ok) return

  await run(assignmentId, async () => {
    try {
      await rolesStore.revokeAssignment(assignmentId)
    } catch {
      return // Toast already shown; nothing else to clean up.
    }
    if (!willLoseAccess || !account) return
    // Best-effort: the role assignment is already gone either way, and this shows its own
    // toast on failure.
    if (account.uid !== authStore.user?.uid) {
      await accountsStore.revokeAccess(account.uid).catch(() => {})
    }
  })
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
  const account = accountsStore.records.find((a) => a.uid === uid)
  const ok = await confirm({
    title: `Revoke dashboard access for ${account?.email || 'this account'}?`,
    // The consequence worth stating: this is the document Firestore rules read, so revoking it
    // takes effect everywhere at once, not just in this screen.
    message:
      'They will be able to sign in but not read or change anything until access is granted again.',
    confirmLabel: 'Revoke access',
  })
  if (!ok) return
  await run(uid, () => accountsStore.revokeAccess(uid).catch(() => {}))
}

/** Optional: ties the login to a nominal-roll record, so the two systems describe one person. */
const memberOptions = computed(() =>
  membersStore.members
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((m) => ({ label: m.name, value: m.id }))
)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Create login with password ────────────────────────────────────────────────
// Sets a password directly for a new account — see `accountsStore.createAccount`.
const createForm = reactive({
  email: '',
  password: '',
  roleId: '' as ChurchRoleId | '',
  memberId: '',
})
const createErrors = reactive({ email: '', roleId: '', password: '' })
const showCreatePassword = ref(false)

async function doCreate() {
  const email = createForm.email.trim()
  createErrors.email = !email
    ? 'Enter an email address'
    : EMAIL_RE.test(email)
      ? ''
      : 'Enter a valid email address'
  createErrors.roleId = createForm.roleId ? '' : 'Choose a role'
  createErrors.password = createForm.password.length >= 6 ? '' : 'Use at least 6 characters'
  if (createErrors.email || createErrors.roleId || createErrors.password) return
  try {
    await accountsStore.createAccount(
      email,
      createForm.password,
      createForm.roleId as ChurchRoleId,
      createForm.memberId || undefined
    )
    Object.assign(createForm, { email: '', password: '', roleId: '', memberId: '' })
    showCreatePassword.value = false
  } catch {
    // Toast already shown.
  }
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
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="font-display text-lg font-semibold text-ink">Roles & Permissions</h2>
        <p class="mt-0.5 text-sm text-ink-muted">
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
      <h3 class="mb-3 font-display text-lg font-semibold text-ink">Role Definitions</h3>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <button
          v-for="role in rolesStore.roles"
          :key="role.id"
          class="group flex flex-col rounded-lg border border-rule bg-surface p-4 text-left shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-rule-strong hover:shadow-md"
          @click="openRole(role)"
        >
          <div class="flex items-start justify-between mb-3">
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-sunken"
            >
              <Icon
                icon="mdi:shield-account-outline"
                class="text-lg"
                :style="{ color: role.color }"
              />
            </div>
            <Badge variant="neutral" size="sm"
              ><span class="num">{{ permCount(role.permissions) }}</span> perms</Badge
            >
          </div>
          <p class="font-display text-[15px] leading-tight font-semibold text-ink">
            {{ role.name }}
          </p>
          <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">
            {{ role.description }}
          </p>
          <p
            class="mt-auto pt-3 text-xs font-semibold text-primary-ink underline-offset-3 group-hover:underline"
          >
            Edit permissions →
          </p>
        </button>
      </div>
    </div>

    <!-- ── Member assignments table ──────────────────────────────────────────── -->
    <div>
      <h3 class="mb-3 font-display text-lg font-semibold text-ink">Member Assignments</h3>
      <Card padding="none">
        <div class="overflow-x-auto">
          <table class="w-full text-sm" role="table">
            <thead>
              <tr>
                <th
                  class="sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
                >
                  Member
                </th>
                <th
                  class="sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
                >
                  Role
                </th>
                <th
                  class="sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
                >
                  Assigned
                </th>
                <th
                  class="sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
                >
                  Custom Perms
                </th>
                <th class="w-24 border-b border-rule bg-surface-muted px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-rule">
              <tr
                v-for="a in pagedAssignments"
                :key="a.id"
                class="transition-colors hover:bg-surface-muted/70"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <Avatar
                      :src="memberAvatar(a.memberId)"
                      :name="memberName(a.memberId)"
                      size="sm"
                    />
                    <span class="font-medium text-ink">{{ memberName(a.memberId) }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    v-if="a.role"
                    class="inline-flex items-center gap-1.5 rounded-sm bg-surface-sunken px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-ink ring-1 ring-rule-strong/60 ring-inset"
                  >
                    <span
                      class="size-2 shrink-0 rounded-full"
                      :style="{ backgroundColor: a.role.color }"
                      aria-hidden="true"
                    ></span>
                    {{ a.role.name }}
                  </span>
                </td>
                <td class="num px-4 py-3 text-xs whitespace-nowrap text-ink-muted">
                  {{ a.assignedAt }}
                </td>
                <td class="px-4 py-3">
                  <Badge
                    v-if="a.customPermissions && Object.keys(a.customPermissions).length"
                    variant="warning"
                    size="sm"
                  >
                    <template #icon><Icon icon="mdi:tune-variant" class="text-[10px]" /></template>
                    Custom
                  </Badge>
                  <span v-else class="text-xs text-ink-subtle">Role defaults</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-surface-sunken hover:text-primary-ink"
                      aria-label="Customize permissions"
                      title="Customize permissions"
                      @click="openCustom(a.id)"
                    >
                      <Icon icon="mdi:tune-variant" class="text-base" />
                    </button>
                    <button
                      class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-error-soft hover:text-error disabled:opacity-55"
                      aria-label="Revoke role"
                      title="Revoke role"
                      :disabled="isPending(a.id)"
                      @click="revoke(a.id)"
                    >
                      <Icon
                        :icon="isPending(a.id) ? 'mdi:loading' : 'mdi:account-remove-outline'"
                        :class="['text-base', isPending(a.id) && 'animate-spin']"
                      />
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
      <h3 class="mb-3 font-display text-lg font-semibold text-ink">Dashboard Access</h3>

      <Card>
        <div
          class="flex items-start gap-2.5 rounded-md border border-info/20 bg-info-soft px-3.5 py-3 text-xs leading-relaxed text-ink"
        >
          <Icon icon="mdi:information-outline" class="mt-px shrink-0 text-sm text-info" />
          <p>
            This is what actually grants access: an account can only read or change church data once
            it appears here. It is separate from the member assignments above — most people on the
            nominal roll have no login at all. Create a login with a password below, or grant access
            to an account that already exists by pasting its UID from the Firebase console.
          </p>
        </div>

        <!-- Create login with password -->
        <div v-if="authStore.isSuperAdmin" class="mt-5 border-t border-rule pt-5">
          <p class="mb-3 font-display text-[15px] font-semibold text-ink">
            Create login with password
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <Input
              v-model="createForm.email"
              label="Email address"
              type="email"
              placeholder="person@example.com"
              :error="createErrors.email"
            />
            <Input
              v-model="createForm.password"
              label="Password"
              :type="showCreatePassword ? 'text' : 'password'"
              placeholder="At least 6 characters"
              :error="createErrors.password"
            >
              <template #icon-right>
                <button
                  type="button"
                  :aria-label="showCreatePassword ? 'Hide password' : 'Show password'"
                  class="pointer-events-auto inline-flex rounded-sm text-ink-subtle transition-colors hover:text-ink"
                  @click="showCreatePassword = !showCreatePassword"
                >
                  <Icon :icon="showCreatePassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" />
                </button>
              </template>
            </Input>
            <Select
              v-model="createForm.roleId"
              label="Role"
              placeholder="Choose a role"
              :options="rolesStore.roles.map((r) => ({ label: r.name, value: r.id }))"
              :error="createErrors.roleId"
            />
            <Select
              v-model="createForm.memberId"
              label="Link to a member (optional)"
              placeholder="Not linked"
              :options="memberOptions"
            />
          </div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" size="sm" @click="createForm.password = generatePassword()">
              <template #icon-left><Icon icon="mdi:dice-5-outline" /></template>
              Generate a password
            </Button>
            <Button :loading="accountsStore.saving" @click="doCreate">
              <template #icon-left><Icon icon="mdi:account-key-outline" /></template>
              Create Account
            </Button>
          </div>
          <p class="mt-2 text-xs text-ink-subtle">
            Creates their account immediately with this password and grants the role above — share
            the password with them directly.
          </p>
        </div>

        <!-- Grant by UID — fallback for an account that already exists -->
        <details v-if="authStore.isSuperAdmin" class="group mt-5 border-t border-rule pt-4">
          <summary
            class="flex min-h-9 cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink [&::-webkit-details-marker]:hidden"
          >
            <Icon
              icon="mdi:chevron-right"
              class="text-base transition-transform duration-150 group-open:rotate-90"
            />
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
            <div class="flex justify-end sm:col-span-3">
              <Button :loading="accountsStore.saving" @click="doGrant">
                <template #icon-left><Icon icon="mdi:shield-key-outline" /></template>
                Grant Access
              </Button>
            </div>
          </div>
        </details>

        <p v-if="!authStore.isSuperAdmin" class="mt-4 text-xs text-ink-subtle">
          Only a Super Admin can invite people or change who has access.
        </p>
      </Card>

      <Card padding="none" class="mt-3">
        <div class="overflow-x-auto">
          <table class="w-full text-sm" role="table">
            <thead>
              <tr>
                <th
                  class="sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
                >
                  Account
                </th>
                <th
                  class="sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
                >
                  UID
                </th>
                <th
                  class="sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
                >
                  Member
                </th>
                <th
                  class="sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
                >
                  Role
                </th>
                <th class="w-20 border-b border-rule bg-surface-muted px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-rule">
              <tr
                v-for="account in accountsStore.records"
                :key="account.uid"
                class="transition-colors hover:bg-surface-muted/70"
              >
                <td class="px-4 py-3">
                  <span class="font-medium text-ink">{{ account.email ?? '—' }}</span>
                  <span
                    v-if="account.uid === authStore.user?.uid"
                    class="ml-2 rounded-sm bg-surface-sunken px-1.5 py-px text-2xs font-semibold text-ink-muted ring-1 ring-rule-strong/60 ring-inset"
                  >
                    you
                  </span>
                </td>
                <td class="px-4 py-3">
                  <code class="font-mono text-xs text-ink-subtle">{{ account.uid }}</code>
                </td>
                <td class="px-4 py-3 text-xs text-ink-muted">
                  {{ account.memberId ? memberName(account.memberId) : '—' }}
                </td>
                <td class="px-4 py-3">
                  <select
                    v-if="authStore.isSuperAdmin"
                    :value="account.roleId"
                    :aria-label="`Role for ${account.email ?? account.uid}`"
                    class="min-h-8 rounded-md border border-rule-strong bg-surface px-2 py-1 text-xs text-ink shadow-xs outline-none transition-[border-color,box-shadow] hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
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
                  <span
                    v-else
                    class="inline-flex items-center rounded-sm bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-ink ring-1 ring-primary/20 ring-inset"
                  >
                    {{ rolesStore.roleById(account.roleId)?.name ?? account.roleId }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    v-if="authStore.isSuperAdmin && account.uid !== authStore.user?.uid"
                    class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-error-soft hover:text-error disabled:opacity-55"
                    :aria-label="`Revoke access for ${account.email ?? account.uid}`"
                    :disabled="isPending(account.uid)"
                    @click="doRevokeAccess(account.uid)"
                  >
                    <Icon
                      :icon="isPending(account.uid) ? 'mdi:loading' : 'mdi:close'"
                      :class="['text-sm', isPending(account.uid) && 'animate-spin']"
                    />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <LoadingState v-if="accountsStore.loading" />
          <p
            v-else-if="!accountsStore.records.length"
            class="px-4 py-6 text-center text-sm text-ink-subtle"
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
      <p class="text-sm text-ink-muted">{{ selectedRole.description }}</p>

      <!-- Permission matrix -->
      <div class="overflow-x-auto rounded-lg border border-rule bg-surface">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th
                class="w-36 sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Page
              </th>
              <th
                v-for="action in ALL_ACTIONS"
                :key="action"
                class="border-b border-rule bg-surface-muted px-3 py-2.5 text-center"
              >
                <button
                  class="rounded-sm text-xs font-semibold tracking-wide text-ink-muted uppercase underline-offset-3 transition-colors hover:text-primary-ink hover:underline"
                  :title="`Toggle all ${action}`"
                  @click="toggleAllForAction(action)"
                >
                  {{ actionLabels[action] }}
                </button>
              </th>
              <th
                class="border-b border-rule bg-surface-muted px-3 py-2.5 text-center text-xs font-semibold tracking-wide text-ink-subtle uppercase"
              >
                All
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rule">
            <tr
              v-for="page in ALL_PAGES"
              :key="page"
              class="transition-colors hover:bg-surface-muted/70"
            >
              <td class="px-4 py-2 text-sm font-medium whitespace-nowrap text-ink">{{ page }}</td>
              <td v-for="action in ALL_ACTIONS" :key="action" class="px-3 py-2 text-center">
                <button
                  :class="[
                    'mx-auto flex size-8 items-center justify-center rounded-md border transition-colors duration-150',
                    editPerms[page]?.[action]
                      ? 'border-primary bg-primary text-on-primary hover:bg-primary-hover'
                      : 'border-rule-strong bg-surface-sunken hover:border-primary',
                  ]"
                  :aria-label="`${editPerms[page]?.[action] ? 'Revoke' : 'Grant'} ${action} on ${page}`"
                  @click="togglePerm(page, action)"
                >
                  <Icon v-if="editPerms[page]?.[action]" icon="mdi:check" class="text-base" />
                </button>
              </td>
              <td class="px-3 py-2.5 text-center">
                <button
                  class="inline-flex min-h-8 items-center rounded-md px-2 text-xs font-semibold text-ink-muted transition-colors hover:bg-surface-sunken hover:text-primary-ink"
                  @click="toggleAllForPage(page)"
                >
                  {{ ALL_ACTIONS.every((a) => editPerms[page]?.[a]) ? 'None' : 'All' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-xs leading-relaxed text-ink-subtle">
        Click column headers to toggle all pages for that action. Click "All/None" on a row to
        toggle all actions for that page. Enabling any action auto-enables View. Disabling View
        clears all.
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="secondary" @click="closeRole">Cancel</Button>
        <Button :loading="rolesStore.saving" @click="saveRolePerms">
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
        <label class="text-sm font-medium text-ink"
          >Member<span class="ml-0.5 text-error">*</span></label
        >
        <div class="relative">
          <Icon
            icon="mdi:magnify"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-ink-subtle"
          />
          <input
            v-model="memberSearch"
            type="text"
            placeholder="Search by name or phone..."
            class="min-h-10 w-full rounded-md border border-rule-strong bg-surface py-2 pr-3 pl-9 text-sm text-ink shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
        </div>
        <div
          v-if="memberSearch || filteredMembers.length"
          class="mt-1 max-h-40 divide-y divide-rule overflow-hidden overflow-y-auto rounded-md border border-rule bg-surface"
        >
          <button
            v-for="m in filteredMembers"
            :key="m.id"
            :class="[
              'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-muted',
              assignForm.memberId === m.id
                ? 'bg-primary-soft font-medium text-primary-ink'
                : 'text-ink',
            ]"
            @click="selectMember(m)"
          >
            <Avatar :src="m.avatar" :name="m.name" size="sm" class="shrink-0" />
            <div>
              <p class="font-medium">{{ m.name }}</p>
              <p class="num text-xs text-ink-subtle">{{ m.phone }}</p>
            </div>
            <Icon
              v-if="assignForm.memberId === m.id"
              icon="mdi:check-circle"
              class="ml-auto text-primary-ink"
            />
          </button>
          <p v-if="!filteredMembers.length" class="py-4 text-center text-xs text-ink-subtle">
            No members found
          </p>
        </div>
        <p v-if="assignErrors.memberId" class="text-xs font-medium text-error">
          {{ assignErrors.memberId }}
        </p>
      </div>

      <!-- Role picker -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-ink"
          >Role<span class="ml-0.5 text-error">*</span></label
        >
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="role in rolesStore.roles"
            :key="role.id"
            :class="[
              'flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors duration-150',
              assignForm.roleId === role.id
                ? 'border-primary bg-primary-soft ring-1 ring-primary ring-inset'
                : 'border-rule-strong bg-surface hover:border-ink-subtle hover:bg-surface-muted',
            ]"
            @click="assignForm.roleId = role.id"
          >
            <div
              class="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary-soft text-primary-ink"
            >
              <Icon icon="mdi:shield-account-outline" class="text-sm" />
            </div>
            <span class="text-xs font-semibold text-ink">{{ role.name }}</span>
          </button>
        </div>
        <p v-if="assignErrors.roleId" class="text-xs font-medium text-error">
          {{ assignErrors.roleId }}
        </p>
      </div>

      <!-- Role description preview -->
      <div
        v-if="assignForm.roleId"
        class="rounded-md border border-rule bg-surface-muted p-3 text-xs leading-relaxed text-ink-muted"
      >
        <p class="mb-0.5 font-display text-sm font-semibold text-primary-ink">
          {{ rolesStore.roleById(assignForm.roleId)?.name }}
        </p>
        <p>{{ rolesStore.roleById(assignForm.roleId)?.description }}</p>
        <p class="num mt-1 text-ink-subtle">
          {{ permCount(rolesStore.roleById(assignForm.roleId)?.permissions ?? {}) }} permissions
          across
          {{ Object.keys(rolesStore.roleById(assignForm.roleId)?.permissions ?? {}).length }} pages
        </p>
      </div>

      <!-- Dashboard login — creates the same users/{uid} record as Dashboard Access below -->
      <div
        v-if="authStore.isSuperAdmin && assignForm.memberId"
        class="flex flex-col gap-3 border-t border-rule pt-4"
      >
        <label
          for="assign-send-invite"
          class="flex min-h-9 items-center gap-2.5 text-sm font-medium text-ink"
        >
          <input
            id="assign-send-invite"
            v-model="assignForm.sendInvite"
            type="checkbox"
            :disabled="!!existingAccountForMember"
            class="size-4 rounded-xs border-rule-strong disabled:opacity-55"
          />
          Also give them a login to the dashboard
        </label>

        <p v-if="existingAccountForMember" class="text-xs text-ink-subtle">
          Already has dashboard access ({{
            existingAccountForMember.email ?? existingAccountForMember.uid
          }}).
        </p>

        <template v-if="assignForm.sendInvite">
          <Input
            v-model="assignForm.inviteEmail"
            label="Email address"
            type="email"
            placeholder="person@example.com"
            :error="assignErrors.inviteEmail"
          />

          <div class="flex flex-col gap-1">
            <div class="flex items-end gap-2">
              <Input
                v-model="assignForm.invitePassword"
                label="Password"
                :type="showAssignPassword ? 'text' : 'password'"
                placeholder="At least 6 characters"
                :error="assignErrors.invitePassword"
                class="flex-1"
              >
                <template #icon-right>
                  <button
                    type="button"
                    :aria-label="showAssignPassword ? 'Hide password' : 'Show password'"
                    class="pointer-events-auto inline-flex rounded-sm text-ink-subtle transition-colors hover:text-ink"
                    @click="showAssignPassword = !showAssignPassword"
                  >
                    <Icon :icon="showAssignPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" />
                  </button>
                </template>
              </Input>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                @click="assignForm.invitePassword = generatePassword()"
              >
                Generate
              </Button>
            </div>
            <p class="text-xs text-ink-subtle">
              Share this password with them directly — there is no way to look it up again once you
              close this window.
            </p>
          </div>
        </template>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="secondary" @click="showAssign = false">Cancel</Button>
        <Button :loading="rolesStore.saving || accountsStore.saving" @click="doAssign">
          <template #icon-left><Icon icon="mdi:shield-check-outline" /></template>
          {{ assignForm.sendInvite ? 'Assign Role & Create Login' : 'Assign Role' }}
        </Button>
      </div>
    </template>
  </Modal>

  <!-- ── Custom permissions modal ──────────────────────────────────────────── -->
  <Modal v-model="showCustom" title="Customize Member Permissions" size="xl">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-ink-muted">
        These permissions override the role defaults for this specific member only.
      </p>

      <div class="overflow-x-auto rounded-lg border border-rule bg-surface">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th
                class="w-36 sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Page
              </th>
              <th
                v-for="action in ALL_ACTIONS"
                :key="action"
                class="border-b border-rule bg-surface-muted px-3 py-2.5 text-center text-xs font-semibold tracking-wide text-ink-muted uppercase"
              >
                {{ actionLabels[action] }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rule">
            <tr
              v-for="page in ALL_PAGES"
              :key="page"
              class="transition-colors hover:bg-surface-muted/70"
            >
              <td class="px-4 py-2 text-sm font-medium whitespace-nowrap text-ink">{{ page }}</td>
              <td v-for="action in ALL_ACTIONS" :key="action" class="px-3 py-2 text-center">
                <button
                  :class="[
                    'mx-auto flex size-8 items-center justify-center rounded-md border transition-colors duration-150',
                    customPerms[page]?.[action]
                      ? 'border-primary bg-primary text-on-primary hover:bg-primary-hover'
                      : 'border-rule-strong bg-surface-sunken hover:border-primary',
                  ]"
                  :aria-label="`${customPerms[page]?.[action] ? 'Revoke' : 'Grant'} ${action} on ${page}`"
                  @click="toggleCustomPerm(page, action)"
                >
                  <Icon v-if="customPerms[page]?.[action]" icon="mdi:check" class="text-base" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="secondary" @click="showCustom = false">Cancel</Button>
        <Button :loading="rolesStore.saving" @click="saveCustomPerms">
          <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
          Save Custom Permissions
        </Button>
      </div>
    </template>
  </Modal>
</template>
