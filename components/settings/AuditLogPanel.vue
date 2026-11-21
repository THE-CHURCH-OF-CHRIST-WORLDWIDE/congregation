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
      <h2 class="font-display text-lg font-semibold text-ink">Audit log</h2>
      <p class="mt-0.5 text-sm text-ink-muted">
        Every change made through the dashboard, newest first. Visible to Super Admins only.
      </p>
    </div>

    <!-- Not a Super Admin: say so plainly rather than showing an empty table. -->
    <Card v-if="authStore.roleLoaded && !authStore.isSuperAdmin">
      <div class="flex items-start gap-2.5 text-sm text-ink-muted">
        <Icon icon="mdi:shield-lock-outline" class="mt-0.5 shrink-0 text-ink-subtle" />
        <p>Only a Super Admin can view the audit log.</p>
      </div>
    </Card>

    <template v-else>
      <Card padding="none">
        <div class="overflow-x-auto">
          <table class="w-full text-sm" role="table">
            <thead>
              <tr>
                <th
                  class="sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
                >
                  When
                </th>
                <th
                  class="sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
                >
                  Who
                </th>
                <th
                  class="sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
                >
                  Action
                </th>
                <th
                  class="sticky top-0 z-[1] border-b border-rule bg-surface-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
                >
                  Target
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-rule">
              <tr
                v-for="entry in paginated"
                :key="entry.id"
                class="transition-colors hover:bg-surface-muted/70"
              >
                <td class="num whitespace-nowrap px-4 py-3 text-ink-muted">
                  <span :title="entry.at ? formatDate(entry.at, 'long') : ''">
                    {{ entry.at ? formatRelative(entry.at) : '—' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="font-medium text-ink">{{ actorLabel(entry) }}</span>
                </td>
                <td class="px-4 py-3 text-ink">{{ auditActionLabel(entry.action) }}</td>
                <td class="max-w-[16rem] truncate px-4 py-3 text-ink-muted">
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

      <p class="max-w-[70ch] text-xs leading-relaxed text-ink-subtle">
        Entries are append-only — they cannot be edited or deleted, by anyone. They are written by
        the app as each change succeeds, so the log evidences what the dashboard did rather than
        everything that could have happened in the database.
      </p>
    </template>
  </div>
</template>
