<script setup lang="ts">
import { auditActionLabel } from '~/stores/audit'

/**
 * Who changed what, newest first. Super Admin only — the Settings nav hides this panel for
 * everyone else, and Firestore rules refuse the read regardless, so the guard is not cosmetic.
 */
const auditStore = useAuditStore()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isSuperAdmin) auditStore.load()
})

// A Super Admin arriving before their role resolves would otherwise see an empty log.
watch(
  () => authStore.isSuperAdmin,
  (allowed) => {
    if (allowed) auditStore.load()
  }
)

const { page, total, totalPages, paginated, rangeStart, rangeEnd } = usePagination(
  computed(() => auditStore.entries),
  15
)

/** Actor label: the email if we have it, else a short uid — never a bare blank cell. */
function actorLabel(entry: { actorEmail?: string; actorUid: string }) {
  return entry.actorEmail ?? `${entry.actorUid.slice(0, 8)}…`
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h2 class="text-base font-semibold text-gray-900">Audit log</h2>
      <p class="mt-0.5 text-sm text-gray-500">
        Every change made through the dashboard, newest first. Visible to Super Admins only.
      </p>
    </div>

    <!-- Not a Super Admin: say so plainly rather than showing an empty table. -->
    <Card v-if="authStore.roleLoaded && !authStore.isSuperAdmin">
      <div class="flex items-start gap-2.5 text-sm text-gray-600">
        <Icon icon="mdi:shield-lock-outline" class="mt-0.5 shrink-0 text-gray-400" />
        <p>Only a Super Admin can view the audit log.</p>
      </div>
    </Card>

    <template v-else>
      <Card padding="none">
        <div class="overflow-x-auto">
          <table class="w-full text-sm" role="table">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">When</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Who</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Action</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Target</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in paginated"
                :key="entry.id"
                class="border-b border-gray-50 transition-colors hover:bg-gray-50"
              >
                <td class="whitespace-nowrap px-4 py-3 text-gray-500">
                  <span :title="entry.at ? formatDate(entry.at, 'long') : ''">
                    {{ entry.at ? formatRelative(entry.at) : '—' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="text-gray-900">{{ actorLabel(entry) }}</span>
                </td>
                <td class="px-4 py-3 text-gray-700">{{ auditActionLabel(entry.action) }}</td>
                <td class="max-w-[16rem] truncate px-4 py-3 text-gray-500">
                  {{ entry.targetLabel ?? entry.targetId ?? '—' }}
                </td>
              </tr>
            </tbody>
          </table>

          <LoadingState v-if="auditStore.loading" />
          <EmptyState
            v-else-if="!auditStore.entries.length"
            title="Nothing recorded yet"
            description="Changes made through the dashboard will appear here."
          />
        </div>

        <Pagination
          v-if="totalPages > 1"
          v-model:page="page"
          :total-pages="totalPages"
          :total="total"
          :range-start="rangeStart"
          :range-end="rangeEnd"
          label="entries"
        />
      </Card>

      <p class="text-xs leading-relaxed text-gray-400">
        Entries are append-only — they cannot be edited or deleted, by anyone. They are written by
        the app as each change succeeds, so the log evidences what the dashboard did rather than
        everything that could have happened in the database.
      </p>
    </template>
  </div>
</template>
