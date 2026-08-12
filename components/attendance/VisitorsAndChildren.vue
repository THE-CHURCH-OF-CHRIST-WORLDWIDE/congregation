<script setup lang="ts">
import type { Visitor } from '~/types'

interface Props {
  /** Which service these records belong to. Sunday Worship is the only one that collects them. */
  serviceType?: string
  /** How many past Sundays the date picker offers. */
  sundays?: number
}
const props = withDefaults(defineProps<Props>(), {
  serviceType: 'Sunday Worship',
  sundays: 12,
})

const visitorsStore = useVisitorsStore()
const { exportCSV } = useExportCSV()

onMounted(() => visitorsStore.load())

// ─── Which Sunday ────────────────────────────────────────────────────────────
/**
 * Offer a list of Sundays rather than a free date field. The record is meaningless against a
 * Tuesday, and a mistyped date files a morning's visitors under a service that never happened.
 */
const sundayOptions = computed(() => recentSundays(props.sundays))
const selectedDate = ref(sundayOptions.value[0] ?? formatDate(new Date(), 'iso'))

// ─── Children ────────────────────────────────────────────────────────────────
const recordedChildren = computed(() =>
  visitorsStore.childrenOn(selectedDate.value, props.serviceType)
)

/**
 * Bound to the number box.
 *
 * Typed loosely because `v-model` on an `<input type="number">` does not hand back a string:
 * Vue casts through `parseFloat` and gives a **number** for anything parseable, the original
 * string otherwise — `''` when the box is cleared, `'-'` or `'1e'` part-way through typing.
 * Assuming a string here is what broke the Save button: `.trim()` threw inside a computed, which
 * killed the update that was meant to enable it, so a typed figure could never be saved.
 */
const childrenInput = ref<number | string>('')

/** `null` for "the box is empty", a number for a usable figure, `NaN` for a part-typed one. */
const typedChildren = computed<number | null>(() => {
  const raw = childrenInput.value
  if (typeof raw === 'number') return raw
  const trimmed = String(raw ?? '').trim()
  return trimmed === '' ? null : Number(trimmed)
})

// Follow the selected Sunday, and any save that changes the stored figure. Assigns a number, the
// same shape v-model produces, so the two directions cannot disagree about the type.
watch(
  recordedChildren,
  (value) => {
    childrenInput.value = value === null ? '' : value
  },
  { immediate: true }
)

const MAX_CHILDREN = 10000

const childrenError = computed(() => {
  const n = typedChildren.value
  if (n === null) return ''
  if (!Number.isInteger(n) || n < 0) return 'Enter a whole number, or clear the box.'
  // Matches the ceiling in firestore.rules — caught here so it reads as a mistake to fix rather
  // than arriving as a permission error.
  if (n > MAX_CHILDREN) return `That is above the ${MAX_CHILDREN.toLocaleString()} limit.`
  return ''
})

/** Nothing to save when the box already matches what is stored. */
const childrenDirty = computed(() => typedChildren.value !== recordedChildren.value)

async function saveChildren() {
  if (childrenError.value || !childrenDirty.value) return
  await visitorsStore
    .setChildrenCount(selectedDate.value, props.serviceType, typedChildren.value)
    .catch(() => {})
}

/** Explicit action, so removing a figure does not depend on knowing to empty the box. */
async function clearChildren() {
  await visitorsStore.setChildrenCount(selectedDate.value, props.serviceType, null).catch(() => {})
}

/** Unique so the label binds to this instance's input rather than another card's. */
const childrenFieldId = useId()

// ─── Visitors ────────────────────────────────────────────────────────────────
const visitorsForDate = computed(() =>
  visitorsStore.visitorsOn(selectedDate.value, props.serviceType)
)

/** Named the table for screen readers, which otherwise meet six columns with no context. */
const tableCaption = computed(
  () => `Visitors recorded for ${props.serviceType} on ${formatDate(selectedDate.value, 'full')}`
)

const showForm = ref(false)
const editing = ref<Visitor | null>(null)

// ─── Detail panel ────────────────────────────────────────────────────────────
const showPanel = ref(false)
const selected = ref<Visitor | null>(null)

function openDetails(visitor: Visitor) {
  selected.value = visitor
  showPanel.value = true
}

/**
 * The panel keeps a reference to a row; the store replaces that object on save. Re-reading it from
 * the store keeps the open panel showing the saved values rather than the ones it was opened with.
 */
watch(
  () => visitorsStore.visitors,
  (all) => {
    if (!selected.value) return
    selected.value = all.find((v) => v.id === selected.value!.id) ?? null
    if (!selected.value) showPanel.value = false
  },
  { deep: true }
)

function openAdd() {
  editing.value = null
  showForm.value = true
}

function openEdit(visitor: Visitor) {
  editing.value = visitor
  showForm.value = true
}

/** Editing from the panel: close it so the form is not buried behind the slide-over. */
function editFromPanel(visitor: Visitor) {
  showPanel.value = false
  openEdit(visitor)
}

async function onSave(payload: Omit<Visitor, 'id' | 'createdAt'>) {
  const target = editing.value
  if (target) await visitorsStore.updateVisitor(target.id, payload).catch(() => {})
  else await visitorsStore.addVisitor(payload).catch(() => {})
}

// Keyed by id so only the row being removed shows a spinner, matching MemberTable.
const { isPending, run } = usePendingAction()

async function remove(visitor: Visitor) {
  await run(visitor.id, () => visitorsStore.deleteVisitor(visitor.id).catch(() => {}))
}

/** Exports the whole visitors book, not just this Sunday — the useful thing to hand over. */
function doExport() {
  exportCSV(
    visitorsStore.visitors.map((v) => ({
      Date: v.date,
      Service: v.serviceType,
      Name: v.name,
      Phone: v.phone ?? '',
      'Email Address': v.email ?? '',
      Church: v.church ?? '',
      Address: v.address ?? '',
    })),
    'visitors'
  )
}
</script>

<template>
  <Card padding="none">
    <div class="p-4 lg:p-5 border-b border-gray-100">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Visitors &amp; Children</h3>
          <p class="text-xs text-gray-400 mt-0.5">
            Recorded per {{ serviceType }} — visitors by name, children by number
          </p>
        </div>
        <div class="flex gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            :disabled="!visitorsStore.visitors.length"
            :aria-label="`Export ${visitorsStore.totalVisitors} visitors to CSV`"
            @click="doExport"
          >
            <template #icon-left><Icon icon="mdi:upload-outline" /></template>
            Export CSV
          </Button>
          <Button size="sm" @click="openAdd">
            <template #icon-left><Icon icon="mdi:account-plus-outline" /></template>
            Add Visitor
          </Button>
        </div>
      </div>

      <!-- Which Sunday these records belong to. Just the date — the figures for it are the two
           cards below, where a number can be read at a glance instead of being buried in the
           label of a closed dropdown. -->
      <div class="mt-4 sm:max-w-md">
        <EditField label="Service Date">
          <select v-model="selectedDate">
            <option v-for="date in sundayOptions" :key="date" :value="date">
              {{ formatDate(date, 'full') }}
            </option>
          </select>
        </EditField>
      </div>
    </div>

    <!-- ── Figures for the selected service ──────────────────────────────────
         Two tiles rather than one band: visitors and children are the two numbers somebody
         writing up a Sunday wants to see, and a figure sitting in the label of a closed dropdown
         cannot be read at all. Each tile shows its own count; the children's tile also carries
         the control, because it is the one of the two that is typed in rather than counted from
         a list. -->
    <div
      class="grid grid-cols-1 gap-3 border-b border-gray-100 bg-gray-50/70 p-4 sm:grid-cols-2 lg:p-5"
    >
      <!-- Visitors -->
      <div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-medium text-gray-500">Visitors</p>
            <p class="mt-1 text-3xl font-bold text-gray-900 tabular-nums">
              {{ visitorsForDate.length }}
            </p>
            <p class="mt-1 text-xs text-gray-400">
              {{
                visitorsForDate.length
                  ? 'Listed below for this service'
                  : 'None recorded for this service'
              }}
            </p>
          </div>
          <div
            class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0BA5EC]/10"
            aria-hidden="true"
          >
            <Icon icon="mdi:account-multiple-outline" class="text-xl text-[#0BA5EC]" />
          </div>
        </div>
      </div>

      <!-- Children -->
      <div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-medium text-gray-500">Children</p>
            <!-- An em dash, not 0: nothing has been counted, which is not the same as none came. -->
            <p class="mt-1 text-3xl font-bold text-gray-900 tabular-nums">
              {{ recordedChildren === null ? '—' : recordedChildren }}
            </p>
            <p class="mt-1 flex items-center gap-1 text-xs">
              <template v-if="recordedChildren !== null">
                <Icon icon="mdi:check-circle" class="shrink-0 text-emerald-500" />
                <span class="text-gray-400">Recorded for this service</span>
              </template>
              <span v-else class="text-gray-400">Not counted yet</span>
            </p>
          </div>
          <div
            class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0BA5EC]/10"
            aria-hidden="true"
          >
            <Icon icon="mdi:human-child" class="text-xl text-[#0BA5EC]" />
          </div>
        </div>

        <!-- The control. A bare input rather than EditField: the label/hint stack pushed the
             button out of line with the box, which is what the `mb-6` nudge was papering over. -->
        <div class="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
          <label :for="childrenFieldId" class="sr-only">Number of children present</label>
          <input
            :id="childrenFieldId"
            v-model="childrenInput"
            type="number"
            min="0"
            :max="MAX_CHILDREN"
            inputmode="numeric"
            placeholder="0"
            class="h-9 w-20 rounded-lg border bg-white px-3 text-center text-sm font-semibold text-gray-900 tabular-nums transition-colors outline-none focus:ring-3"
            :class="
              childrenError
                ? 'border-red-400 focus:border-red-400 focus:ring-red-500/15'
                : 'border-gray-300 focus:border-[#0BA5EC] focus:ring-[#0BA5EC]/15'
            "
            :aria-invalid="Boolean(childrenError)"
            :aria-describedby="childrenError ? `${childrenFieldId}-error` : undefined"
            @keyup.enter="saveChildren"
          />

          <Button
            size="sm"
            class="h-9"
            :loading="visitorsStore.saving"
            :disabled="Boolean(childrenError) || !childrenDirty"
            @click="saveChildren"
          >
            <template #icon-left><Icon icon="mdi:check" /></template>
            Save
          </Button>

          <!-- Only offered when there is something to remove. -->
          <Button
            v-if="recordedChildren !== null"
            variant="ghost"
            size="sm"
            class="h-9"
            :disabled="visitorsStore.saving"
            aria-label="Remove the children's figure for this service"
            @click="clearChildren"
          >
            Clear
          </Button>
        </div>

        <!-- role="alert" so the reason a save is refused is announced, not just coloured. -->
        <p
          v-if="childrenError"
          :id="`${childrenFieldId}-error`"
          role="alert"
          class="mt-2 text-xs text-red-600"
        >
          {{ childrenError }}
        </p>
      </div>
    </div>

    <!-- Visitors for the selected Sunday -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <caption class="sr-only">
          {{
            tableCaption
          }}
        </caption>
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
              Name
            </th>
            <th scope="col" class="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
              Phone Number
            </th>
            <th scope="col" class="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
              Email Address
            </th>
            <th scope="col" class="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
              Church
            </th>
            <th scope="col" class="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
              Address
            </th>
            <th scope="col" class="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="visitorsStore.loading && !visitorsForDate.length">
            <td colspan="6" class="px-4 py-6">
              <LoadingState :rows="3" size="sm" title="Loading visitors…" />
            </td>
          </tr>
          <tr v-else-if="!visitorsForDate.length">
            <td colspan="6" class="px-4 py-8">
              <EmptyState
                icon="mdi:account-multiple-outline"
                title="No visitors recorded for this service"
                description="Add the visitors' slips from this Sunday and they will be listed here."
              >
                <template #action>
                  <Button size="sm" @click="openAdd">
                    <template #icon-left><Icon icon="mdi:account-plus-outline" /></template>
                    Add Visitor
                  </Button>
                </template>
              </EmptyState>
            </td>
          </tr>
          <tr
            v-for="visitor in visitorsForDate"
            v-else
            :key="visitor.id"
            class="border-b border-gray-50 hover:bg-gray-50/50"
          >
            <td class="px-4 py-3">
              <!-- A button, not a click handler on the row: the row also holds Call and Email
                   links, and nesting those inside one clickable region makes both unreachable
                   by keyboard. -->
              <button
                class="flex items-center gap-2.5 text-left group"
                :aria-label="`View ${visitor.name}'s details`"
                @click="openDetails(visitor)"
              >
                <Avatar :name="visitor.name" size="sm" />
                <span
                  class="font-medium text-gray-900 group-hover:text-blue-600 group-hover:underline"
                >
                  {{ visitor.name }}
                </span>
              </button>
            </td>
            <td class="px-4 py-3 text-gray-600">
              <a v-if="visitor.phone" :href="`tel:${visitor.phone}`" class="hover:underline">
                {{ visitor.phone }}
              </a>
              <span v-else class="text-gray-300">—</span>
            </td>
            <td class="px-4 py-3 text-gray-600">
              <a v-if="visitor.email" :href="`mailto:${visitor.email}`" class="hover:underline">
                {{ visitor.email }}
              </a>
              <span v-else class="text-gray-300">—</span>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ visitor.church || '—' }}</td>
            <td class="px-4 py-3 text-gray-600">{{ visitor.address || '—' }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  :aria-label="`View ${visitor.name}'s details`"
                  @click="openDetails(visitor)"
                >
                  <Icon icon="mdi:eye-outline" />
                </button>
                <button
                  class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  :aria-label="`Edit ${visitor.name}`"
                  @click="openEdit(visitor)"
                >
                  <Icon icon="mdi:pencil-outline" />
                </button>
                <button
                  class="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-40"
                  :aria-label="`Remove ${visitor.name}`"
                  :disabled="isPending(visitor.id)"
                  @click="remove(visitor)"
                >
                  <Icon
                    :icon="isPending(visitor.id) ? 'mdi:loading' : 'mdi:trash-can-outline'"
                    :class="isPending(visitor.id) && 'animate-spin'"
                  />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <VisitorFormModal
      v-model="showForm"
      :date="selectedDate"
      :service-type="serviceType"
      :visitor="editing"
      @save="onSave"
    />

    <VisitorDetailPanel v-model="showPanel" :visitor="selected" @edit="editFromPanel" />
  </Card>
</template>
