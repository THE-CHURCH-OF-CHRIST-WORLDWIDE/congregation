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
    <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
      <!-- Kind toggle (only when creating) -->
      <div
        v-if="!isEditing"
        class="flex gap-1 rounded-md border border-rule bg-surface-sunken p-1"
        role="group"
        aria-label="Event type"
      >
        <button
          type="button"
          :aria-pressed="kind === 'upcoming'"
          :class="[
            'inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors duration-150',
            kind === 'upcoming'
              ? 'bg-surface font-semibold text-primary-ink shadow-xs ring-1 ring-rule'
              : 'text-ink-muted hover:text-ink',
          ]"
          @click="kind = 'upcoming'"
        >
          <Icon icon="mdi:calendar-arrow-right" aria-hidden="true" />
          Upcoming
        </button>
        <button
          type="button"
          :aria-pressed="kind === 'past'"
          :class="[
            'inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors duration-150',
            kind === 'past'
              ? 'bg-surface font-semibold text-primary-ink shadow-xs ring-1 ring-rule'
              : 'text-ink-muted hover:text-ink',
          ]"
          @click="kind = 'past'"
        >
          <Icon icon="mdi:calendar-check-outline" aria-hidden="true" />
          Past
        </button>
      </div>

      <!-- Shared fields -->
      <section class="flex flex-col gap-4">
        <h3 class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Event details</h3>
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
            <label class="mb-1.5 block text-sm font-medium text-ink">Date</label>
            <input
              v-model="upcomingForm.date"
              type="date"
              class="num min-h-11 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-[15px] text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15 sm:min-h-10 sm:text-sm"
            />
            <p v-if="errors.date" class="mt-1.5 text-xs font-medium text-error">
              {{ errors.date }}
            </p>
          </div>
          <div v-else>
            <label class="mb-1.5 block text-sm font-medium text-ink">Date</label>
            <input
              v-model="pastForm.date"
              type="date"
              class="num min-h-11 w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-[15px] text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15 sm:min-h-10 sm:text-sm"
            />
            <p v-if="errors.date" class="mt-1.5 text-xs font-medium text-error">
              {{ errors.date }}
            </p>
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
      </section>

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
        <section class="flex flex-col gap-4 border-t border-rule pt-5">
          <h3 class="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Classification
          </h3>
          <Input
            v-model="pastForm.category"
            label="Category"
            placeholder="Bible Study"
            :error="errors.category"
          />
        </section>
        <section class="flex flex-col gap-4 border-t border-rule pt-5">
          <h3 class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Images</h3>
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
        </section>
        <section class="flex flex-col gap-4 border-t border-rule pt-5">
          <h3 class="text-xs font-semibold tracking-wide text-ink-muted uppercase">People</h3>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <label class="mb-1.5 block text-sm font-medium text-ink">
              Speakers
              <span class="ml-1 font-normal text-ink-subtle">
                (one per line, format: <code>Name | avatar URL</code>)
              </span>
            </label>
            <textarea
              v-model="pastForm.speakers"
              rows="3"
              placeholder="Bro. Samuel Eze | https://..."
              class="w-full resize-none rounded-md border border-rule-strong bg-surface px-3 py-2 text-sm text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
            ></textarea>
          </div>
        </section>
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
