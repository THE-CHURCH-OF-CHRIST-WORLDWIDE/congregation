<script setup lang="ts">
import type { UploadOptions } from '~/composables/useCloudinaryUpload'

interface Props {
  /** Array of Cloudinary secure URLs already saved. */
  modelValue?: string[]
  label?: string
  helper?: string
  /** Subfolder under the configured Cloudinary root. */
  folder?: string
  /** Override the 5MB default per file. */
  maxBytes?: number
  /** Hard cap on the number of images (0 = no cap). */
  max?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  folder: 'congregation/events',
  max: 0,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [urls: string[]]
  error: [message: string]
}>()

const { upload, uploading, progress, error } = useCloudinaryUpload()
const dragging = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const queueLength = ref(0)
const queueDone = ref(0)

const images = computed(() => props.modelValue)
const canAddMore = computed(() => props.max === 0 || images.value.length < props.max)

async function handleFiles(files: FileList | File[]) {
  const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
  if (!list.length) return

  // Enforce the cap before kicking off uploads.
  const remaining = props.max === 0 ? list.length : Math.max(0, props.max - images.value.length)
  const toUpload = list.slice(0, remaining)
  if (toUpload.length < list.length) {
    emit('error', `Only ${remaining} more image(s) allowed; extras were skipped.`)
  }
  if (!toUpload.length) return

  const opts: UploadOptions = { folder: props.folder }
  if (props.maxBytes) opts.maxBytes = props.maxBytes

  queueLength.value = toUpload.length
  queueDone.value = 0
  const next = [...images.value]
  for (const file of toUpload) {
    try {
      const result = await upload(file, opts)
      next.push(result.url)
      // Emit progressively so the gallery feels responsive on big batches.
      emit('update:modelValue', [...next])
    } catch (e) {
      emit('error', e instanceof Error ? e.message : 'Upload failed')
    } finally {
      queueDone.value += 1
    }
  }
  queueLength.value = 0
  queueDone.value = 0
}

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) handleFiles(files)
  if (inputRef.value) inputRef.value.value = ''
}

function onDrop(e: DragEvent) {
  dragging.value = false
  if (props.disabled || uploading.value) return
  const files = e.dataTransfer?.files
  if (files?.length) handleFiles(files)
}

function openPicker() {
  if (props.disabled || uploading.value || !canAddMore.value) return
  inputRef.value?.click()
}

function removeAt(index: number) {
  const next = images.value.filter((_, i) => i !== index)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div v-if="label || max" class="flex items-baseline justify-between">
      <label v-if="label" class="text-sm font-medium text-gray-700">{{ label }}</label>
      <span v-if="max" class="text-xs text-gray-400">{{ images.length }} / {{ max }}</span>
    </div>

    <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
      <!-- Existing thumbnails -->
      <div
        v-for="(src, i) in images"
        :key="`${src}-${i}`"
        class="relative aspect-square overflow-hidden rounded-lg border border-gray-200 group"
      >
        <img :src="src" :alt="`Gallery image ${i + 1}`" class="h-full w-full object-cover" />
        <button
          type="button"
          class="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-gray-700 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500 hover:text-white"
          :aria-label="`Remove image ${i + 1}`"
          @click="removeAt(i)"
        >
          <Icon icon="mdi:close" class="text-sm" />
        </button>
      </div>

      <!-- Upload slot -->
      <div
        v-if="canAddMore"
        :class="[
          'relative aspect-square border-2 border-dashed rounded-lg transition-colors flex flex-col items-center justify-center text-center px-2',
          dragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50',
          disabled || uploading ? 'cursor-wait' : 'cursor-pointer',
        ]"
        :aria-busy="uploading"
        @dragover.prevent="!disabled && !uploading && (dragging = true)"
        @dragleave="dragging = false"
        @drop.prevent="onDrop"
        @click="openPicker"
      >
        <template v-if="uploading">
          <Icon icon="mdi:loading" class="animate-spin text-2xl text-blue-600" />
          <p class="mt-1 text-[11px] font-medium text-blue-600">
            {{ progress }}%<span v-if="queueLength > 1">
              · {{ queueDone }} / {{ queueLength }}</span
            >
          </p>
        </template>
        <template v-else>
          <Icon icon="mdi:cloud-upload-outline" class="text-2xl text-gray-400" />
          <p class="mt-1 text-[11px] text-gray-500 leading-tight">
            <span class="font-medium text-blue-600">Click</span> or drop
          </p>
        </template>
        <input
          ref="inputRef"
          type="file"
          accept="image/*"
          class="hidden"
          multiple
          :disabled="disabled || uploading"
          @change="onFileChange"
        />
      </div>
    </div>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-else-if="helper" class="text-xs text-gray-400">{{ helper }}</p>
  </div>
</template>
