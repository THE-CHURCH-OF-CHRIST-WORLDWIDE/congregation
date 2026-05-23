<script setup lang="ts">
import type { UpcomingEvent, PastEvent } from '~/types/events'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Events', description: 'Church events management.' })

const { setHeader } = usePageHeader()
const eventsStore = useEventsStore()

onMounted(() => {
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

function confirmDelete(event: UpcomingEvent | PastEvent) {
  if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return
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
  <div class="flex flex-col gap-5">
    <Teleport to="#admin-header-actions">
      <Button @click="openCreate">
        Add Event
        <template #icon-right><Icon icon="mdi:plus" /></template>
      </Button>
    </Teleport>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs v-model="activeTab" :tabs="tabs" />
      <div class="relative w-full sm:max-w-xs">
        <Icon
          icon="mdi:magnify"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search events..."
          class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          aria-label="Search events"
        />
      </div>
    </div>

    <Card v-if="activeTab === 'upcoming'" padding="none">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              class="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500"
            >
              <th class="text-left px-4 py-2.5 font-medium">Title</th>
              <th class="text-left px-4 py-2.5 font-medium">Date</th>
              <th class="text-left px-4 py-2.5 font-medium">Time</th>
              <th class="text-left px-4 py-2.5 font-medium">Venue</th>
              <th class="text-left px-4 py-2.5 font-medium">Gallery</th>
              <th class="text-right px-4 py-2.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="event in filteredUpcoming"
              :key="event.id"
              class="border-b border-gray-50 hover:bg-gray-50/50"
            >
              <td class="px-4 py-3 font-medium text-gray-900">{{ event.title }}</td>
              <td class="px-4 py-3 text-gray-600">{{ formatDate(event.date) }}</td>
              <td class="px-4 py-3 text-gray-600">{{ event.time }}</td>
              <td class="px-4 py-3 text-gray-600">{{ event.venue }}</td>
              <td class="px-4 py-3 text-gray-600">{{ event.galleryImages.length }} image(s)</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    :aria-label="`View ${event.title}`"
                    @click="openView(event)"
                  >
                    <Icon icon="mdi:eye-outline" class="text-base" />
                  </button>
                  <button
                    class="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    :aria-label="`Edit ${event.title}`"
                    @click="openEdit(event)"
                  >
                    <Icon icon="mdi:pencil-outline" class="text-base" />
                  </button>
                  <button
                    class="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    :aria-label="`Delete ${event.title}`"
                    @click="confirmDelete(event)"
                  >
                    <Icon icon="mdi:trash-can-outline" class="text-base" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredUpcoming.length">
              <td colspan="6" class="px-4 py-10 text-center text-gray-400">
                <Icon icon="mdi:calendar-blank-outline" class="text-3xl mb-2 block mx-auto" />
                <p>No upcoming events</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <Card v-else padding="none">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              class="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500"
            >
              <th class="text-left px-4 py-2.5 font-medium">Title</th>
              <th class="text-left px-4 py-2.5 font-medium">Category</th>
              <th class="text-left px-4 py-2.5 font-medium">Date</th>
              <th class="text-left px-4 py-2.5 font-medium">Time</th>
              <th class="text-left px-4 py-2.5 font-medium">Venue</th>
              <th class="text-left px-4 py-2.5 font-medium">Moderator</th>
              <th class="text-right px-4 py-2.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="event in filteredPast"
              :key="event.id"
              class="border-b border-gray-50 hover:bg-gray-50/50"
            >
              <td class="px-4 py-3 font-medium text-gray-900">{{ event.title }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium"
                  style="color: #0ba5ec"
                >
                  {{ event.category }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ formatDate(event.date) }}</td>
              <td class="px-4 py-3 text-gray-600">{{ event.time }}</td>
              <td class="px-4 py-3 text-gray-600">{{ event.venue }}</td>
              <td class="px-4 py-3 text-gray-600">{{ event.moderator.name }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    :aria-label="`View ${event.title}`"
                    @click="openView(event)"
                  >
                    <Icon icon="mdi:eye-outline" class="text-base" />
                  </button>
                  <button
                    class="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    :aria-label="`Edit ${event.title}`"
                    @click="openEdit(event)"
                  >
                    <Icon icon="mdi:pencil-outline" class="text-base" />
                  </button>
                  <button
                    class="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    :aria-label="`Delete ${event.title}`"
                    @click="confirmDelete(event)"
                  >
                    <Icon icon="mdi:trash-can-outline" class="text-base" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredPast.length">
              <td colspan="7" class="px-4 py-10 text-center text-gray-400">
                <Icon icon="mdi:calendar-blank-outline" class="text-3xl mb-2 block mx-auto" />
                <p>No past events</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <EventFormModal v-model="formOpen" :event="editTarget" :default-kind="activeTab" />

    <Modal v-model="viewOpen" :title="viewTarget?.title ?? 'Event'" size="xl">
      <div v-if="viewTarget" class="flex flex-col gap-4">
        <img
          v-if="isPast(viewTarget) && viewTarget.featuredImage"
          :src="viewTarget.featuredImage"
          :alt="viewTarget.title"
          class="w-full h-48 object-cover rounded-lg"
        />
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-xs text-gray-500">Date</p>
            <p class="font-medium text-gray-900">{{ formatDate(viewTarget.date) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Time</p>
            <p class="font-medium text-gray-900">{{ viewTarget.time }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Venue</p>
            <p class="font-medium text-gray-900">{{ viewTarget.venue }}</p>
          </div>
          <div v-if="isPast(viewTarget)">
            <p class="text-xs text-gray-500">Category</p>
            <p class="font-medium text-gray-900">{{ viewTarget.category }}</p>
          </div>
        </div>

        <div v-if="isPast(viewTarget)" class="flex flex-col gap-3">
          <div>
            <p class="text-xs text-gray-500 mb-1">Moderator</p>
            <div class="flex items-center gap-2">
              <img
                v-if="viewTarget.moderator.avatar"
                :src="viewTarget.moderator.avatar"
                :alt="viewTarget.moderator.name"
                class="h-8 w-8 rounded-full object-cover"
              />
              <span class="text-sm text-gray-900">{{ viewTarget.moderator.name }}</span>
            </div>
          </div>
          <div v-if="viewTarget.speakers.length">
            <p class="text-xs text-gray-500 mb-1">Speakers</p>
            <ul class="flex flex-wrap gap-3">
              <li
                v-for="(sp, idx) in viewTarget.speakers"
                :key="`${sp.name}-${idx}`"
                class="flex items-center gap-2"
              >
                <img
                  v-if="sp.avatar"
                  :src="sp.avatar"
                  :alt="sp.name"
                  class="h-8 w-8 rounded-full object-cover"
                />
                <span class="text-sm text-gray-900">{{ sp.name }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div v-if="!isPast(viewTarget) && viewTarget.galleryImages.length">
          <p class="text-xs text-gray-500 mb-2">Gallery ({{ viewTarget.galleryImages.length }})</p>
          <div class="grid grid-cols-3 gap-2">
            <img
              v-for="(src, idx) in viewTarget.galleryImages"
              :key="idx"
              :src="src"
              :alt="`${viewTarget.title} ${idx + 1}`"
              class="h-24 w-full object-cover rounded-md"
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
