<script setup lang="ts">
import { isEmbeddable } from '~/utils/videoEmbed'

const teachingsStore = useTeachingsStore()
const { uploadDocument, uploading: docUploading } = useCloudinaryUpload()

const form = reactive({
  type: '',
  date: '',
  preacher: '',
  topic: '',
  scripture: '',
  description: '',
  categories: [] as string[],
  videoUrl: '',
})

const thumbnailUrl = ref<string>('')
const documentFile = ref<File | null>(null)
const docDragging = ref(false)
const success = ref(false)

const errors = reactive({
  type: '',
  date: '',
  preacher: '',
  description: '',
  videoUrl: '',
})

const typeOptions = [
  { label: 'Sunday School', value: 'Sunday School' },
  { label: 'Sermon', value: 'Sermon' },
  { label: 'Bible Class', value: 'Bible Class' },
  { label: 'Prayer Meeting', value: 'Prayer Meeting' },
  { label: 'Youth Class', value: 'Youth Class' },
]

const videoLinkInvalid = computed(
  () => Boolean(form.videoUrl.trim()) && !isEmbeddable(form.videoUrl)
)
const isValid = computed(
  () => form.type && form.preacher && form.description && !videoLinkInvalid.value
)
const busy = computed(() => teachingsStore.uploading || docUploading.value)

function onDocChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    if (file.size > 20 * 1024 * 1024) {
      alert('Document must be under 20MB')
      return
    }
    documentFile.value = file
  }
}

function onDocDrop(e: DragEvent) {
  docDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) {
    if (file.size > 20 * 1024 * 1024) {
      alert('Document must be under 20MB')
      return
    }
    documentFile.value = file
  }
}

async function submit() {
  errors.type = form.type ? '' : 'Upload type is required'
  errors.preacher = form.preacher ? '' : 'Preacher name is required'
  errors.description = form.description ? '' : 'Description is required'
  errors.videoUrl = videoLinkInvalid.value
    ? 'Paste a YouTube, Facebook or Vimeo link to the recording'
    : ''

  if (!isValid.value) return

  // The handout goes to the file host first; only its URL is stored with the teaching.
  let documentUrl: string | undefined
  if (documentFile.value) {
    try {
      documentUrl = (await uploadDocument(documentFile.value, { folder: 'congregation/handouts' }))
        .url
    } catch (e: unknown) {
      useToast().error(e instanceof Error ? e.message : 'The document could not be uploaded.')
      return
    }
  }

  const created = await teachingsStore.uploadSermon({
    ...form,
    videoUrl: form.videoUrl.trim() || undefined,
    thumbnail: thumbnailUrl.value || undefined,
    documentFile: documentFile.value?.name,
    documentUrl,
    videoAttendees: 0,
  })
  // A failed save keeps everything that was typed; the store has already shown the error.
  if (!created) return

  success.value = true
  Object.assign(form, {
    type: '',
    date: '',
    preacher: '',
    topic: '',
    scripture: '',
    description: '',
    categories: [],
    videoUrl: '',
  })
  thumbnailUrl.value = ''
  documentFile.value = null
  setTimeout(() => {
    success.value = false
  }, 3000)
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <Transition name="fade">
      <div
        v-if="success"
        class="flex items-center gap-2 rounded-md border border-success/25 bg-success-soft px-4 py-3 text-sm font-medium text-success"
        role="status"
      >
        <Icon icon="mdi:check-circle-outline" class="shrink-0 text-base" aria-hidden="true" />
        Sermon uploaded successfully!
      </div>
    </Transition>

    <h3 class="t-label text-ink-muted">Sermon details</h3>

    <!-- Upload Type -->
    <Select
      v-model="form.type"
      label="Upload Type"
      :options="typeOptions"
      placeholder="Select Upload type"
      required
      :error="errors.type"
    />

    <!-- Sermon Date -->
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-ink">Sermon</label>
      <input
        v-model="form.date"
        type="date"
        class="num min-h-11 w-full px-3 py-2 text-[15px] sm:min-h-10 sm:text-sm rounded-md border border-rule-strong bg-surface text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
        aria-label="Sermon date"
      />
    </div>

    <!-- Preacher -->
    <Input
      v-model="form.preacher"
      label="Preacher"
      placeholder="Enter Preacher's name"
      required
      :error="errors.preacher"
    />

    <!-- Topic -->
    <Input v-model="form.topic" label="Topic" placeholder="Enter the topic of the Sermon" />

    <!-- Scripture -->
    <Input v-model="form.scripture" label="Scripture Reference" placeholder="e.g. 1 Timothy 3:6" />

    <!-- Description -->
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-ink">
        Brief Description<span class="ml-0.5 text-error" aria-hidden="true">*</span>
      </label>
      <textarea
        v-model="form.description"
        rows="3"
        placeholder="Enter a brief description of the topic you are uploading..."
        :class="[
          'w-full resize-none rounded-md border bg-surface px-3 py-2 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15',
          errors.description
            ? 'border-error hover:border-error focus:border-error focus:ring-error/15'
            : 'border-rule-strong',
        ]"
        aria-label="Brief description"
      ></textarea>
      <p v-if="errors.description" class="text-xs font-medium text-error">
        {{ errors.description }}
      </p>
    </div>

    <!-- Thumbnail -->
    <h3 class="t-label border-t border-rule pt-5 text-ink-muted">Media</h3>
    <ImageUpload
      v-model="thumbnailUrl"
      label="Thumbnail Image"
      folder="congregation/sermons"
      helper="JPG, PNG, GIF or WebP — max 5MB."
    />

    <Input
      v-model="form.videoUrl"
      label="Video link"
      placeholder="https://www.youtube.com/watch?v=…"
      :error="
        errors.videoUrl ||
        (videoLinkInvalid ? 'Paste a YouTube, Facebook or Vimeo link to the recording' : '')
      "
    />
    <p class="-mt-3 text-xs text-ink-subtle">
      Optional. YouTube, Facebook or Vimeo. Teachings with a video also appear under Live Streams →
      Recorded.
    </p>

    <!-- Document Upload -->
    <div class="border-t border-rule pt-5">
      <label class="mb-1.5 block text-sm font-medium text-ink">Upload Document File</label>
      <div
        :class="[
          'cursor-pointer rounded-md border-2 border-dashed p-6 text-center transition-colors duration-150',
          docDragging
            ? 'border-primary bg-primary-soft'
            : 'border-rule-strong bg-surface-muted hover:border-ink-subtle',
        ]"
        @dragover.prevent="docDragging = true"
        @dragleave="docDragging = false"
        @drop.prevent="onDocDrop"
      >
        <Icon
          icon="mdi:file-upload-outline"
          class="mx-auto mb-2 block text-3xl text-ink-subtle"
          aria-hidden="true"
        />
        <p v-if="documentFile" class="text-sm font-medium text-ink">{{ documentFile.name }}</p>
        <p v-else class="text-sm text-ink-muted">
          <span class="font-medium text-primary-ink">Click to upload</span> or drag and drop
        </p>
        <p class="mt-1 text-xs text-ink-subtle">Optional handout. PDF, DOC, DOCX (max 20MB)</p>
      </div>
      <div class="text-center mt-3">
        <label class="cursor-pointer">
          <input
            ref="docInput"
            type="file"
            accept=".pdf,.doc,.docx"
            class="hidden"
            @change="onDocChange"
          />
          <Button
            variant="secondary"
            size="sm"
            type="button"
            @click="($refs.docInput as HTMLInputElement)?.click()"
          >
            <template #icon-left><Icon icon="mdi:folder-open-outline" /></template>
            Browse Files
          </Button>
        </label>
      </div>
    </div>
    <!-- Upload Sermon Button -->
    <Button
      :loading="busy"
      :disabled="!isValid || busy"
      type="submit"
      size="lg"
      class="w-full"
      @click="submit"
    >
      <template #icon-left><Icon icon="mdi:upload" /></template>
      {{
        docUploading
          ? 'Uploading document…'
          : teachingsStore.uploading
            ? 'Uploading…'
            : 'Upload Sermon'
      }}
    </Button>
  </div>
</template>
