<script setup lang="ts">
const teachingsStore = useTeachingsStore()

const form = reactive({
  type: '',
  date: '',
  preacher: '',
  topic: '',
  scripture: '',
  description: '',
  categories: [] as string[],
})

const thumbnailFile = ref<File | null>(null)
const thumbnailPreview = ref<string | null>(null)
const documentFile = ref<File | null>(null)
const thumbnailDragging = ref(false)
const docDragging = ref(false)
const success = ref(false)

const errors = reactive({
  type: '',
  date: '',
  preacher: '',
  description: '',
})

const typeOptions = [
  { label: 'Sunday School', value: 'Sunday School' },
  { label: 'Sermon', value: 'Sermon' },
  { label: 'Bible Class', value: 'Bible Class' },
  { label: 'Prayer Meeting', value: 'Prayer Meeting' },
  { label: 'Youth Class', value: 'Youth Class' },
]

const isValid = computed(
  () => form.type && form.preacher && form.description
)

function onThumbnailChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) setThumbnail(file)
}

function setThumbnail(file: File) {
  if (file.size > 5 * 1024 * 1024) {
    alert('Thumbnail must be under 5MB')
    return
  }
  thumbnailFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => { thumbnailPreview.value = e.target?.result as string }
  reader.readAsDataURL(file)
}

function onDocChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    if (file.size > 20 * 1024 * 1024) { alert('Document must be under 20MB'); return }
    documentFile.value = file
  }
}

function onThumbnailDrop(e: DragEvent) {
  thumbnailDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) setThumbnail(file)
}

function onDocDrop(e: DragEvent) {
  docDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) {
    if (file.size > 20 * 1024 * 1024) { alert('Document must be under 20MB'); return }
    documentFile.value = file
  }
}

async function submit() {
  errors.type = form.type ? '' : 'Upload type is required'
  errors.preacher = form.preacher ? '' : 'Preacher name is required'
  errors.description = form.description ? '' : 'Description is required'

  if (!isValid.value) return

  await teachingsStore.uploadSermon({
    ...form,
    thumbnail: thumbnailPreview.value ?? undefined,
    documentFile: documentFile.value?.name,
    videoAttendees: 0,
  })

  success.value = true
  Object.assign(form, { type: '', date: '', preacher: '', topic: '', scripture: '', description: '', categories: [] })
  thumbnailFile.value = null
  thumbnailPreview.value = null
  documentFile.value = null
  setTimeout(() => { success.value = false }, 3000)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <Transition name="fade">
      <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2 text-green-700 text-sm">
        <Icon icon="mdi:check-circle-outline" />
        Sermon uploaded successfully!
      </div>
    </Transition>

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
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-gray-700">Sermon</label>
      <input
        v-model="form.date"
        type="date"
        class="w-full rounded-lg border border-gray-300 text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        aria-label="Sermon date"
      />
    </div>

    <!-- Preacher -->
    <Input v-model="form.preacher" label="Preacher" placeholder="Enter Preacher's name" required :error="errors.preacher" />

    <!-- Topic -->
    <Input v-model="form.topic" label="Topic" placeholder="Enter the topic of the Sermon" />

    <!-- Scripture -->
    <Input v-model="form.scripture" label="Scripture Reference" placeholder="e.g. 1 Timothy 3:6" />

    <!-- Description -->
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-gray-700">
        Brief Description<span class="text-red-500 ml-0.5">*</span>
      </label>
      <textarea
        v-model="form.description"
        rows="3"
        placeholder="Enter a brief description of the topic you are uploading..."
        :class="['w-full rounded-lg border text-sm px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all', errors.description ? 'border-red-400' : 'border-gray-300']"
        aria-label="Brief description"
      />
      <p v-if="errors.description" class="text-xs text-red-500">{{ errors.description }}</p>
    </div>

    <!-- Thumbnail -->
    <div>
      <label class="text-sm font-medium text-gray-700 block mb-1.5">Thumbnail Image</label>
      <div
        :class="['border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer', thumbnailDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300']"
        @dragover.prevent="thumbnailDragging = true"
        @dragleave="thumbnailDragging = false"
        @drop.prevent="onThumbnailDrop"
        @click="($refs.thumbInput as HTMLInputElement)?.click()"
      >
        <div v-if="thumbnailPreview" class="relative">
          <img :src="thumbnailPreview" alt="Thumbnail preview" class="w-full h-32 object-cover rounded-lg" />
          <button
            class="absolute top-1 right-1 bg-white rounded-full p-0.5 text-gray-500 hover:text-red-500"
            @click.stop="thumbnailFile = null; thumbnailPreview = null"
            aria-label="Remove thumbnail"
          >
            <Icon icon="mdi:close-circle" />
          </button>
        </div>
        <div v-else>
          <Icon icon="mdi:cloud-upload-outline" class="text-3xl text-gray-400 mb-2 block mx-auto" />
          <p class="text-sm text-gray-500">
            <span class="text-blue-600 font-medium">Click to upload</span> or drag and drop
          </p>
          <p class="text-xs text-gray-400 mt-1">Supported formats: JPG, PNG, GIF, WebP (max 5MB)</p>
        </div>
        <input ref="thumbInput" type="file" accept="image/*" class="hidden" @change="onThumbnailChange" />
      </div>
    </div>

    <!-- Upload Sermon Button -->
    <Button
      :loading="teachingsStore.uploading"
      :disabled="!isValid || teachingsStore.uploading"
      type="submit"
      size="lg"
      class="w-full"
      @click="submit"
    >
      <template #icon-left><Icon icon="mdi:upload" /></template>
      {{ teachingsStore.uploading ? `Uploading… ${teachingsStore.uploadProgress}%` : 'Upload Sermon' }}
    </Button>

    <!-- Document Upload -->
    <div>
      <label class="text-sm font-medium text-gray-700 block mb-1.5">Upload Document File</label>
      <div
        :class="['border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer', docDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300']"
        @dragover.prevent="docDragging = true"
        @dragleave="docDragging = false"
        @drop.prevent="onDocDrop"
      >
        <Icon icon="mdi:file-upload-outline" class="text-3xl text-gray-400 mb-2 block mx-auto" />
        <p v-if="documentFile" class="text-sm text-gray-700 font-medium">{{ documentFile.name }}</p>
        <p v-else class="text-sm text-gray-500">
          <span class="text-blue-600 font-medium">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-gray-400 mt-1">Supported formats: PDF, DOC, DOCX (max 20MB)</p>
      </div>
      <div class="text-center mt-3">
        <label class="cursor-pointer">
          <input type="file" accept=".pdf,.doc,.docx" class="hidden" @change="onDocChange" />
          <Button variant="secondary" size="sm" type="button" @click="($refs.docInput as HTMLInputElement)?.click()">
            <template #icon-left><Icon icon="mdi:folder-open-outline" /></template>
            Browse Files
          </Button>
        </label>
      </div>
    </div>
  </div>
</template>
