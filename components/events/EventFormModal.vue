<script setup lang="ts">
import type { UpcomingEvent, PastEvent, Speaker } from '~/types/events'

type EventKind = 'upcoming' | 'past'

interface Props {
  modelValue: boolean
  /** When provided, the modal opens in edit mode and prefills the form. */
  event?: UpcomingEvent | PastEvent | null
  /** Which kind of event to create when not editing. Ignored if `event` is set. */
  defaultKind?: EventKind
}

const props = withDefaults(defineProps<Props>(), {
  event: null,
  defaultKind: 'upcoming',
})

const emit = defineEmits<{ 'update:modelValue': [val: boolean] }>()

const kind = ref<EventKind>(props.defaultKind)

// Form state for upcoming events
const upcomingForm = ref<{
  title: string
  date: string
  time: string
  venue: string
  galleryImages: string[]
}>({ title: '', date: '', time: '', venue: '', galleryImages: [] })

// Form state for past events
const pastForm = ref<{
  title: string
  date: string
  time: string
  venue: string
  category: string
  thumbnail: string
  featuredImage: string
  moderatorName: string
  moderatorAvatar: string
  speakers: string
}>({
  title: '',
  date: '',
  time: '',
  venue: '',
  category: '',
  thumbnail: '',
  featuredImage: '',
  moderatorName: '',
  moderatorAvatar: '',
  speakers: '',
})

const errors = ref<Record<string, string>>({})

function isPastEvent(e: UpcomingEvent | PastEvent): e is PastEvent {
  return 'category' in e
}

function reset() {
  errors.value = {}
  upcomingForm.value = { title: '', date: '', time: '', venue: '', galleryImages: [] }
  pastForm.value = {
    title: '',
    date: '',
    time: '',
    venue: '',
    category: '',
    thumbnail: '',
    featuredImage: '',
    moderatorName: '',
    moderatorAvatar: '',
    speakers: '',
  }
}

// Whenever the modal opens (or the target event changes), seed the form.
watch(
  () => [props.modelValue, props.event, props.defaultKind] as const,
  ([isOpen, event, defaultKind]) => {
    if (!isOpen) return
    if (event) {
      if (isPastEvent(event)) {
        kind.value = 'past'
        pastForm.value = {
          title: event.title,
          date: event.date,
          time: event.time,
          venue: event.venue,
          category: event.category,
          thumbnail: event.thumbnail,
          featuredImage: event.featuredImage,
          moderatorName: event.moderator.name,
          moderatorAvatar: event.moderator.avatar,
          speakers: event.speakers.map((s) => `${s.name}|${s.avatar}`).join('\n'),
        }
      } else {
        kind.value = 'upcoming'
        upcomingForm.value = {
          title: event.title,
          date: event.date,
          time: event.time,
          venue: event.venue,
          galleryImages: [...event.galleryImages],
        }
      }
    } else {
      kind.value = defaultKind
      reset()
    }
  },
  { immediate: true }
)

const isEditing = computed(() => !!props.event)
const title = computed(() =>
  isEditing.value
    ? kind.value === 'upcoming'
      ? 'Edit Upcoming Event'
      : 'Edit Past Event'
    : kind.value === 'upcoming'
      ? 'Add Upcoming Event'
      : 'Add Past Event'
)

function close() {
  emit('update:modelValue', false)
}

function validate(): boolean {
  errors.value = {}
  const form = kind.value === 'upcoming' ? upcomingForm.value : pastForm.value
  if (!form.title.trim()) errors.value.title = 'Title is required'
  if (!form.date) errors.value.date = 'Date is required'
  if (!form.time.trim()) errors.value.time = 'Time is required'
  if (!form.venue.trim()) errors.value.venue = 'Venue is required'
  if (kind.value === 'past' && !pastForm.value.category.trim()) {
    errors.value.category = 'Category is required'
  }
  return Object.keys(errors.value).length === 0
}

const eventsStore = useEventsStore()

function parseLines(input: string): string[] {
  return input
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function parseSpeakers(input: string): Speaker[] {
  return parseLines(input).map((line) => {
    const [name, avatar] = line.split('|').map((s) => s.trim())
    return { name: name ?? '', avatar: avatar ?? '' }
  })
}

function handleSubmit() {
  if (!validate()) return

  if (kind.value === 'upcoming') {
    const payload: Omit<UpcomingEvent, 'id'> = {
      title: upcomingForm.value.title.trim(),
      date: upcomingForm.value.date,
      time: upcomingForm.value.time.trim(),
      venue: upcomingForm.value.venue.trim(),
      galleryImages: [...upcomingForm.value.galleryImages],
    }
    if (isEditing.value && props.event) {
      eventsStore.updateUpcomingEvent(props.event.id, payload)
    } else {
      eventsStore.addUpcomingEvent(payload)
    }
  } else {
    const payload: Omit<PastEvent, 'id'> = {
      title: pastForm.value.title.trim(),
      date: pastForm.value.date,
      time: pastForm.value.time.trim(),
      venue: pastForm.value.venue.trim(),
      category: pastForm.value.category.trim(),
      thumbnail: pastForm.value.thumbnail.trim(),
      featuredImage: pastForm.value.featuredImage.trim(),
      moderator: {
        name: pastForm.value.moderatorName.trim(),
        avatar: pastForm.value.moderatorAvatar.trim(),
      },
      speakers: parseSpeakers(pastForm.value.speakers),
    }
    if (isEditing.value && props.event) {
      eventsStore.updatePastEvent(props.event.id, payload)
    } else {
      eventsStore.addPastEvent(payload)
    }
  }
  close()
}
</script>

<template>
  <Modal :model-value="modelValue" :title="title" size="xl" @update:model-value="close">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <!-- Kind toggle (only when creating) -->
      <div v-if="!isEditing" class="flex gap-2 rounded-lg bg-gray-50 p-1">
        <button
          type="button"
          :class="[
            'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition',
            kind === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500',
          ]"
          @click="kind = 'upcoming'"
        >
          Upcoming
        </button>
        <button
          type="button"
          :class="[
            'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition',
            kind === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500',
          ]"
          @click="kind = 'past'"
        >
          Past
        </button>
      </div>

      <!-- Shared fields -->
      <Input
        v-if="kind === 'upcoming'"
        v-model="upcomingForm.title"
        label="Title"
        placeholder="Equipping for Evangelism"
        :error="errors.title"
      />
      <Input
        v-else
        v-model="pastForm.title"
        label="Title"
        placeholder="Equipping for Evangelism"
        :error="errors.title"
      />

      <div class="grid grid-cols-2 gap-3">
        <div v-if="kind === 'upcoming'">
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Date</label>
          <input
            v-model="upcomingForm.date"
            type="date"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <p v-if="errors.date" class="mt-1 text-xs text-red-600">{{ errors.date }}</p>
        </div>
        <div v-else>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Date</label>
          <input
            v-model="pastForm.date"
            type="date"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <p v-if="errors.date" class="mt-1 text-xs text-red-600">{{ errors.date }}</p>
        </div>

        <Input
          v-if="kind === 'upcoming'"
          v-model="upcomingForm.time"
          label="Time"
          placeholder="7:00 PM"
          :error="errors.time"
        />
        <Input
          v-else
          v-model="pastForm.time"
          label="Time"
          placeholder="7:00 PM"
          :error="errors.time"
        />
      </div>

      <Input
        v-if="kind === 'upcoming'"
        v-model="upcomingForm.venue"
        label="Venue"
        placeholder="Church Hall"
        :error="errors.venue"
      />
      <Input
        v-else
        v-model="pastForm.venue"
        label="Venue"
        placeholder="Church Hall"
        :error="errors.venue"
      />

      <!-- Upcoming-only: gallery images upload directly to Cloudinary -->
      <GalleryUploader
        v-if="kind === 'upcoming'"
        v-model="upcomingForm.galleryImages"
        label="Gallery images"
        folder="congregation/events"
        helper="Click or drop one or more images. Each upload streams to Cloudinary; the secure URLs are stored when you save."
      />

      <!-- Past-only -->
      <template v-if="kind === 'past'">
        <Input
          v-model="pastForm.category"
          label="Category"
          placeholder="Bible Study"
          :error="errors.category"
        />
        <ImageUpload
          v-model="pastForm.thumbnail"
          label="Thumbnail"
          folder="congregation/events"
          compact
        />
        <ImageUpload
          v-model="pastForm.featuredImage"
          label="Featured image"
          folder="congregation/events"
        />

        <div class="grid grid-cols-2 gap-3">
          <Input
            v-model="pastForm.moderatorName"
            label="Moderator name"
            placeholder="Bro. James Ikpe"
          />
          <ImageUpload
            v-model="pastForm.moderatorAvatar"
            label="Moderator avatar"
            folder="congregation/events"
            shape="circle"
            compact
          />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">
            Speakers
            <span class="ml-1 font-normal text-gray-400">
              (one per line, format: <code>Name | avatar URL</code>)
            </span>
          </label>
          <textarea
            v-model="pastForm.speakers"
            rows="3"
            placeholder="Bro. Samuel Eze | https://..."
            class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          ></textarea>
        </div>
      </template>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="secondary" type="button" @click="close">Cancel</Button>
        <Button type="button" @click="handleSubmit">
          {{ isEditing ? 'Save changes' : 'Create event' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
