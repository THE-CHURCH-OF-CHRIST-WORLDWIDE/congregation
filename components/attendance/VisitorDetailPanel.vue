<script setup lang="ts">
import type { Visitor } from '~/types'

/**
 * A visitor's full record in a slide-over, mirroring `MemberDetailPanel` so the two feel like the
 * same app. Simpler than that one deliberately: a visitor has one card's worth of biodata and no
 * photograph, so this reads rather than edits — editing hands off to `VisitorFormModal`, which
 * already owns the form and its validation.
 */
interface Props {
  visitor: Visitor | null
  modelValue: boolean
}
const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  edit: [visitor: Visitor]
  delete: [visitor: Visitor]
}>()

const visitorsStore = useVisitorsStore()

function close() {
  emit('update:modelValue', false)
}

function onEdit() {
  if (props.visitor) emit('edit', props.visitor)
}

const { confirmDelete } = useConfirm()

async function onDelete() {
  if (!props.visitor) return
  const visitor = props.visitor
  const ok = await confirmDelete(visitor.name, {
    message: `Their visit on ${formatDate(visitor.date, 'full')} will be removed from the record.`,
  })
  if (!ok) return
  await visitorsStore.deleteVisitor(visitor.id).catch(() => {})
  emit('delete', visitor)
  close()
}

/**
 * Other Sundays the same name appears on. A returning visitor is the single most useful thing to
 * know when following one up, and one document per visit is exactly what makes it answerable.
 *
 * Matched on a normalised name, which is a guess rather than an identity — two people can share
 * one — so the panel says "same name", not "same person".
 */
const otherVisits = computed(() => {
  if (!props.visitor) return []
  const key = props.visitor.name.trim().toLowerCase()
  return visitorsStore.visitors
    .filter((v) => v.id !== props.visitor!.id && v.name.trim().toLowerCase() === key)
    .map((v) => v.date)
    .sort()
    .reverse()
})

/** Fallback for the avatar, same as the nominal roll's. */
const initials = computed(() =>
  (props.visitor?.name ?? '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
)

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }
  document.addEventListener('keydown', handler)
  onUnmounted(() => document.removeEventListener('keydown', handler))
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-40 bg-overlay"
        aria-hidden="true"
        @click="close"
      ></div>
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="modelValue && visitor"
        class="fixed top-0 right-0 z-50 flex h-full w-full flex-col overflow-hidden border-l border-rule bg-surface text-ink shadow-xl sm:w-[520px]"
        :aria-label="`${visitor.name} — visitor record`"
      >
        <!-- Top bar -->
        <div
          class="flex shrink-0 items-center justify-between border-b border-rule bg-surface-muted px-3 py-2"
        >
          <button
            class="inline-flex size-10 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
            aria-label="Close panel"
            @click="close"
          >
            <Icon icon="mdi:close" class="text-xl" />
          </button>
          <span class="stamp pr-2">Visitor</span>
        </div>

        <div class="sidebar-scroll flex-1 space-y-5 overflow-y-auto px-5 pt-5 pb-6">
          <!-- Hero: the visitors' book entry -->
          <div class="margin-rule flex items-center gap-4">
            <div
              class="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-xl font-semibold text-primary-ink"
              aria-hidden="true"
            >
              {{ initials }}
            </div>
            <div class="min-w-0 space-y-1">
              <h2 class="font-display text-xl leading-snug font-semibold wrap-break-word text-ink">
                {{ visitor.name }}
              </h2>
              <p class="text-sm text-ink-muted">
                {{ visitor.serviceType }}
              </p>
              <Badge variant="info" size="sm" class="num">
                <template #icon><Icon icon="mdi:calendar-outline" class="text-xs" /></template>
                {{ formatDate(visitor.date, 'full') }}
              </Badge>
            </div>
          </div>

          <!-- Contact -->
          <section class="rounded-lg border border-rule bg-surface p-4 shadow-xs">
            <h3 class="panel-heading">Contact Details</h3>
            <div class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <InfoField icon="mdi:account-outline" label="Name" :value="visitor.name" />
              <InfoField
                icon="mdi:phone-outline"
                label="Phone Number"
                :value="visitor.phone || 'Not given'"
              />
              <InfoField
                icon="mdi:email-outline"
                label="Email Address"
                :value="visitor.email || 'Not given'"
              />
              <InfoField icon="mdi:church" label="Church" :value="visitor.church || 'Not given'" />
              <InfoField
                icon="mdi:map-marker-radius-outline"
                label="Address"
                :value="visitor.address || 'Not given'"
                class="sm:col-span-2"
              />
            </div>
          </section>

          <!-- Reach out. Only rendered for details that were actually given, so there is never a
               dead button that opens an empty mail client. -->
          <div v-if="visitor.phone || visitor.email" class="flex gap-2">
            <a
              v-if="visitor.phone"
              :href="`tel:${visitor.phone}`"
              class="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary-hover"
              :aria-label="`Call ${visitor.name}`"
            >
              <Icon icon="mdi:phone-outline" class="text-base" />
              Call
            </a>
            <a
              v-if="visitor.email"
              :href="`mailto:${visitor.email}`"
              class="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-rule-strong bg-surface px-4 text-sm font-semibold text-ink shadow-xs transition-colors hover:border-ink-subtle hover:bg-surface-muted"
              :aria-label="`Email ${visitor.name}`"
            >
              <Icon icon="mdi:email-outline" class="text-base" />
              Email
            </a>
          </div>

          <!-- Previous visits under the same name -->
          <section class="rounded-lg border border-rule bg-surface p-4 shadow-xs">
            <h3 class="panel-heading">Other Visits</h3>
            <p v-if="!otherVisits.length" class="text-sm text-ink-subtle">
              No other services recorded under this name.
            </p>
            <template v-else>
              <p class="mb-2 text-sm text-ink-muted">
                <span class="num">{{ otherVisits.length }}</span> other
                {{ otherVisits.length === 1 ? 'service' : 'services' }} recorded under the same
                name.
              </p>
              <ul class="divide-y divide-rule border-y border-rule">
                <li
                  v-for="date in otherVisits"
                  :key="date"
                  class="num flex items-center gap-2 py-2 text-sm text-ink"
                >
                  <Icon icon="mdi:calendar-check-outline" class="text-base text-ink-subtle" />
                  {{ formatDate(date, 'full') }}
                </li>
              </ul>
            </template>
          </section>

          <!-- Recorded-at, when the write has been acknowledged by the server -->
          <p v-if="visitor.createdAt" class="px-1 text-xs text-ink-subtle">
            Recorded {{ formatRelative(visitor.createdAt) }}
          </p>

          <!-- Actions -->
          <div class="flex gap-2 pt-1">
            <button
              class="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary-hover"
              @click="onEdit"
            >
              <Icon icon="mdi:pencil-outline" class="text-base" />
              Edit Details
            </button>
            <button
              class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-error/40 bg-surface px-4 text-sm font-semibold text-error transition-colors hover:bg-error-soft disabled:cursor-not-allowed disabled:opacity-55"
              :disabled="visitorsStore.saving"
              @click="onDelete"
            >
              <Icon icon="mdi:trash-can-outline" class="text-base" />
              Delete
            </button>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Section label: small caps in muted ink. Kept as a class so the heading stays on one line and
   its text gains no stray leading space. */
.panel-heading {
  margin-bottom: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  color: var(--c-ink-muted);
}
</style>
