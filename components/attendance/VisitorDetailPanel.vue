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

async function onDelete() {
  if (!props.visitor) return
  const visitor = props.visitor
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
        class="fixed inset-0 bg-black/25 z-40"
        aria-hidden="true"
        @click="close"
      ></div>
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="modelValue && visitor"
        class="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white z-50 flex flex-col shadow-2xl overflow-hidden"
        :aria-label="`${visitor.name} — visitor record`"
      >
        <!-- Top bar -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-100 shrink-0">
          <button
            class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
            aria-label="Close panel"
            @click="close"
          >
            <Icon icon="mdi:close" class="text-lg" />
          </button>
          <span class="text-xs font-medium text-gray-500">Visitor</span>
        </div>

        <div class="flex-1 overflow-y-auto px-4 pb-6 pt-4 space-y-3 sidebar-scroll bg-white">
          <!-- Hero -->
          <div class="bg-[#F0F9FF] rounded-2xl px-4 py-4 flex items-center gap-4">
            <div
              class="w-20 h-20 flex shrink-0 items-center justify-center rounded-2xl bg-[#0BA5EC]/10 text-2xl font-bold text-[#0BA5EC] shadow-lg"
              aria-hidden="true"
            >
              {{ initials }}
            </div>
            <div class="space-y-1 min-w-0">
              <h2 class="font-montserrat text-base font-bold leading-6 wrap-break-word">
                {{ visitor.name }}
              </h2>
              <p class="text-[#717680] text-sm">
                {{ visitor.serviceType }}
              </p>
              <Badge variant="info" size="sm">
                <template #icon><Icon icon="mdi:calendar" class="text-[10px]" /></template>
                {{ formatDate(visitor.date, 'full') }}
              </Badge>
            </div>
          </div>

          <!-- Contact -->
          <div class="bg-white rounded-2xl p-4 border-[#7CD4FD] border">
            <h3 class="text-xs font-bold text-gray-700 mb-3">Contact Details</h3>
            <div class="grid grid-cols-2 gap-x-3 gap-y-3">
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
                class="col-span-2"
              />
            </div>
          </div>

          <!-- Reach out. Only rendered for details that were actually given, so there is never a
               dead button that opens an empty mail client. -->
          <div v-if="visitor.phone || visitor.email" class="flex gap-2">
            <a
              v-if="visitor.phone"
              :href="`tel:${visitor.phone}`"
              class="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
              :aria-label="`Call ${visitor.name}`"
            >
              <Icon icon="mdi:phone-outline" class="text-base" />
              Call
            </a>
            <a
              v-if="visitor.email"
              :href="`mailto:${visitor.email}`"
              class="flex-1 flex items-center justify-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium py-2.5 rounded-xl transition-colors"
              :aria-label="`Email ${visitor.name}`"
            >
              <Icon icon="mdi:email-outline" class="text-base" />
              Email
            </a>
          </div>

          <!-- Previous visits under the same name -->
          <div class="bg-white rounded-2xl p-4 border-[#7CD4FD] border">
            <h3 class="text-xs font-bold text-gray-700 mb-3">Other Visits</h3>
            <p v-if="!otherVisits.length" class="text-xs text-gray-400">
              No other services recorded under this name.
            </p>
            <template v-else>
              <p class="text-xs text-gray-500 mb-2">
                {{ otherVisits.length }} other
                {{ otherVisits.length === 1 ? 'service' : 'services' }} recorded under the same
                name.
              </p>
              <ul class="space-y-1.5">
                <li
                  v-for="date in otherVisits"
                  :key="date"
                  class="flex items-center gap-2 text-xs text-gray-700"
                >
                  <Icon icon="mdi:calendar-check-outline" class="text-blue-500" />
                  {{ formatDate(date, 'full') }}
                </li>
              </ul>
            </template>
          </div>

          <!-- Recorded-at, when the write has been acknowledged by the server -->
          <p v-if="visitor.createdAt" class="px-1 text-[11px] text-gray-400">
            Recorded {{ formatRelative(visitor.createdAt) }}
          </p>

          <!-- Actions -->
          <div class="flex gap-2 pt-1">
            <button
              class="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
              @click="onEdit"
            >
              <Icon icon="mdi:pencil-outline" class="text-base" />
              Edit Details
            </button>
            <button
              class="flex items-center justify-center gap-1.5 border border-red-500 text-red-500 hover:bg-red-50 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
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
