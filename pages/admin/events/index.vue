<script setup lang="ts">
import type { UpcomingEvent, PastEvent } from '~/types/events'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Events', description: 'Church events management.' })

const { setHeader } = usePageHeader()
const eventsStore = useEventsStore()

onMounted(() => {
  eventsStore.load()
  setHeader('Events', 'Manage church events and programmes')
})

type Tab = 'upcoming' | 'past'
const tabs: { label: string; value: Tab }[] = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Past', value: 'past' },
]
const activeTab = ref<Tab>('upcoming')

const search = ref('')

const filteredUpcoming = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = [...eventsStore.upcomingEvents].sort((a, b) => a.date.localeCompare(b.date))
  if (!q) return list
  return list.filter(
    (e) =>
      e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) || e.date.includes(q)
  )
})

const filteredPast = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = [...eventsStore.pastEvents].sort((a, b) => b.date.localeCompare(a.date))
  if (!q) return list
  return list.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.date.includes(q)
  )
})

// Separate pagers so switching tabs doesn't reset the other list.
const {
  page: upcomingPage,
  total: upcomingTotal,
  totalPages: upcomingTotalPages,
  paginated: pagedUpcoming,
  rangeStart: upcomingFrom,
  rangeEnd: upcomingTo,
} = usePagination(filteredUpcoming, 10)

const {
  page: pastPage,
  total: pastTotal,
  totalPages: pastTotalPages,
  paginated: pagedPast,
  rangeStart: pastFrom,
  rangeEnd: pastTo,
} = usePagination(filteredPast, 10)

const formOpen = ref(false)
const editTarget = ref<UpcomingEvent | PastEvent | null>(null)

const viewOpen = ref(false)
const viewTarget = ref<UpcomingEvent | PastEvent | null>(null)

function openCreate() {
  editTarget.value = null
  formOpen.value = true
}

function openEdit(event: UpcomingEvent | PastEvent) {
  editTarget.value = event
  formOpen.value = true
}

function openView(event: UpcomingEvent | PastEvent) {
  viewTarget.value = event
  viewOpen.value = true
}

const { confirmDelete: askDelete } = useConfirm()

/**
 * Was `window.confirm`, which is a browser chrome dialog: unstyled, unfocusable, and blocking.
 * Every other confirmation in the app is now the same in-app dialog.
 */
async function confirmDelete(event: UpcomingEvent | PastEvent) {
  const ok = await askDelete(`"${event.title}"`, {
    message: 'The event will no longer appear on the public site. This cannot be undone.',
  })
  if (!ok) return
  if (isPast(event)) {
    eventsStore.deletePastEvent(event.id)
  } else {
    eventsStore.deleteUpcomingEvent(event.id)
  }
}

function isPast(e: UpcomingEvent | PastEvent): e is PastEvent {
  return 'category' in e
}
</script>

<template>
  <div class="space-y-6">
    <!-- `defer`: the admin layout is a separately async-loaded chunk, so its header (and this
         teleport's target) is not guaranteed to exist before this page's own chunk mounts.
         Without `defer`, that race intermittently throws "Failed to locate Teleport target". -->
    <Teleport defer to="#admin-header-actions">
      <Button @click="openCreate">
        Add Event
        <template #icon-right><Icon icon="mdi:plus" /></template>
      </Button>
    </Teleport>

    <div
      class="flex flex-col gap-3 rounded-sm border border-rule bg-surface p-3 sm:flex-row sm:items-end sm:justify-between"
    >
      <Tabs v-model="activeTab" :tabs="tabs" />
      <div class="relative w-full sm:max-w-xs">
        <Icon
          icon="mdi:magnify"
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-ink-subtle"
          aria-hidden="true"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search events..."
          class="min-h-10 w-full rounded-md border border-rule-strong bg-surface py-2 pr-3 pl-9 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          aria-label="Search events"
        />
      </div>
    </div>

    <section
      v-if="activeTab === 'upcoming'"
      class="overflow-hidden rounded-sm border border-rule bg-surface"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 z-[1] bg-surface-muted">
            <tr>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Title
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Date
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Time
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Venue
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Gallery
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-right text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rule">
            <tr
              v-for="event in pagedUpcoming"
              :key="event.id"
              class="transition-colors hover:bg-surface-muted/70"
            >
              <td class="px-4 py-3 font-medium text-ink">{{ event.title }}</td>
              <td class="num px-4 py-3 whitespace-nowrap text-ink-muted">
                {{ formatDate(event.date) }}
              </td>
              <td class="num px-4 py-3 whitespace-nowrap text-ink-muted">{{ event.time }}</td>
              <td class="px-4 py-3 text-ink-muted">{{ event.venue }}</td>
              <td class="px-4 py-3 text-ink-muted">
                <span class="num">{{ event.galleryImages.length }}</span> image(s)
              </td>
              <td class="px-4 py-2">
                <div class="flex items-center justify-end gap-0.5">
                  <button
                    class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
                    :aria-label="`View ${event.title}`"
                    @click="openView(event)"
                  >
                    <Icon icon="mdi:eye-outline" class="text-base" />
                  </button>
                  <button
                    class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
                    :aria-label="`Edit ${event.title}`"
                    @click="openEdit(event)"
                  >
                    <Icon icon="mdi:pencil-outline" class="text-base" />
                  </button>
                  <button
                    class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-error-soft hover:text-error"
                    :aria-label="`Delete ${event.title}`"
                    @click="confirmDelete(event)"
                  >
                    <Icon icon="mdi:trash-can-outline" class="text-base" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!pagedUpcoming.length">
              <td colspan="6" class="px-4">
                <EmptyState
                  icon="mdi:calendar-blank-outline"
                  title="No upcoming events"
                  description="Events you schedule will be listed here until their date passes."
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination
        v-model:page="upcomingPage"
        :total-pages="upcomingTotalPages"
        :total="upcomingTotal"
        :range-start="upcomingFrom"
        :range-end="upcomingTo"
        label="events"
      />
    </section>

    <section v-else class="overflow-hidden rounded-sm border border-rule bg-surface">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 z-[1] bg-surface-muted">
            <tr>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Title
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Category
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Date
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Time
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Venue
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Moderator
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-right text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rule">
            <tr
              v-for="event in pagedPast"
              :key="event.id"
              class="transition-colors hover:bg-surface-muted/70"
            >
              <td class="px-4 py-3 font-medium text-ink">{{ event.title }}</td>
              <td class="px-4 py-3">
                <Badge variant="info" size="sm">{{ event.category }}</Badge>
              </td>
              <td class="num px-4 py-3 whitespace-nowrap text-ink-muted">
                {{ formatDate(event.date) }}
              </td>
              <td class="num px-4 py-3 whitespace-nowrap text-ink-muted">{{ event.time }}</td>
              <td class="px-4 py-3 text-ink-muted">{{ event.venue }}</td>
              <td class="px-4 py-3 text-ink-muted">{{ event.moderator.name }}</td>
              <td class="px-4 py-2">
                <div class="flex items-center justify-end gap-0.5">
                  <button
                    class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
                    :aria-label="`View ${event.title}`"
                    @click="openView(event)"
                  >
                    <Icon icon="mdi:eye-outline" class="text-base" />
                  </button>
                  <button
                    class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
                    :aria-label="`Edit ${event.title}`"
                    @click="openEdit(event)"
                  >
                    <Icon icon="mdi:pencil-outline" class="text-base" />
                  </button>
                  <button
                    class="inline-flex size-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-error-soft hover:text-error"
                    :aria-label="`Delete ${event.title}`"
                    @click="confirmDelete(event)"
                  >
                    <Icon icon="mdi:trash-can-outline" class="text-base" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!pagedPast.length">
              <td colspan="7" class="px-4">
                <EmptyState
                  icon="mdi:calendar-blank-outline"
                  title="No past events"
                  description="Events move here automatically once their date has passed."
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination
        v-model:page="pastPage"
        :total-pages="pastTotalPages"
        :total="pastTotal"
        :range-start="pastFrom"
        :range-end="pastTo"
        label="events"
      />
    </section>

    <EventFormModal v-model="formOpen" :event="editTarget" :default-kind="activeTab" />

    <Modal v-model="viewOpen" :title="viewTarget?.title ?? 'Event'" size="xl">
      <div v-if="viewTarget" class="flex flex-col gap-4">
        <img
          v-if="isPast(viewTarget) && viewTarget.featuredImage"
          :src="displayableImageUrl(viewTarget.featuredImage)"
          :alt="viewTarget.title"
          class="h-48 w-full rounded-md border border-rule object-cover"
        />
        <div
          class="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-rule bg-surface-muted p-4 text-sm"
        >
          <div>
            <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Date</p>
            <p class="num mt-0.5 font-medium text-ink">{{ formatDate(viewTarget.date) }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Time</p>
            <p class="num mt-0.5 font-medium text-ink">{{ viewTarget.time }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Venue</p>
            <p class="mt-0.5 font-medium text-ink">{{ viewTarget.venue }}</p>
          </div>
          <div v-if="isPast(viewTarget)">
            <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Category</p>
            <p class="mt-0.5 font-medium text-ink">{{ viewTarget.category }}</p>
          </div>
        </div>

        <div v-if="isPast(viewTarget)" class="flex flex-col gap-3">
          <div>
            <p class="mb-1.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
              Moderator
            </p>
            <div class="flex items-center gap-2">
              <img
                v-if="viewTarget.moderator.avatar"
                :src="displayableImageUrl(viewTarget.moderator.avatar)"
                :alt="viewTarget.moderator.name"
                class="size-8 rounded-full border border-rule object-cover"
              />
              <span class="text-sm text-ink">{{ viewTarget.moderator.name }}</span>
            </div>
          </div>
          <div v-if="viewTarget.speakers.length">
            <p class="mb-1.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
              Speakers
            </p>
            <ul class="flex flex-wrap gap-3">
              <li
                v-for="(sp, idx) in viewTarget.speakers"
                :key="`${sp.name}-${idx}`"
                class="flex items-center gap-2"
              >
                <img
                  v-if="sp.avatar"
                  :src="displayableImageUrl(sp.avatar)"
                  :alt="sp.name"
                  class="size-8 rounded-full border border-rule object-cover"
                />
                <span class="text-sm text-ink">{{ sp.name }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div v-if="!isPast(viewTarget) && viewTarget.galleryImages.length">
          <p class="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Gallery ({{ viewTarget.galleryImages.length }})
          </p>
          <div class="grid grid-cols-3 gap-2">
            <img
              v-for="(src, idx) in viewTarget.galleryImages"
              :key="idx"
              :src="displayableImageUrl(src)"
              :alt="`${viewTarget.title} ${idx + 1}`"
              class="h-24 w-full rounded-md border border-rule object-cover"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button variant="secondary" @click="viewOpen = false">Close</Button>
          <Button
            v-if="viewTarget"
            @click="
              () => {
                if (!viewTarget) return
                viewOpen = false
                openEdit(viewTarget)
              }
            "
          >
            Edit
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>
