<script setup lang="ts">
import type { UploadOptions } from '~/composables/useCloudinaryUpload'

interface Props {
  /** Cloudinary secure URL already saved for this slot, if any. */
  modelValue?: string
  label?: string
  helper?: string
  /** Subfolder under the configured Cloudinary root (e.g. "leaders", "gallery"). */
  folder?: string
  /** Override the 5MB default. */
  maxBytes?: number
  /** Compact height (for inline grids like leader rows). */
  compact?: boolean
  /** Render as a small circular avatar slot. */
  shape?: 'rect' | 'circle'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shape: 'rect',
  compact: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [url: string]
  uploaded: [url: string]
  error: [message: string]
}>()

const { upload, uploading, progress, error } = useCloudinaryUpload()
const dragging = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

async function handleFile(file: File) {
  const opts: UploadOptions = {}
  if (props.folder) opts.folder = props.folder
  if (props.maxBytes) opts.maxBytes = props.maxBytes

  try {
    const result = await upload(file, opts)
    emit('update:modelValue', result.url)
    emit('uploaded', result.url)
  } catch (e) {
    emit('error', e instanceof Error ? e.message : 'Upload failed')
  }
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
  if (inputRef.value) inputRef.value.value = ''
}

function onDrop(e: DragEvent) {
  dragging.value = false
  if (props.disabled || uploading.value) return
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function openPicker() {
  if (props.disabled || uploading.value) return
  inputRef.value?.click()
}

function clear() {
  emit('update:modelValue', '')
}

const containerHeight = computed(() => {
  if (props.shape === 'circle') return 'h-24 w-24 rounded-full'
  return props.compact ? 'h-24' : 'h-40'
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium text-gray-700">{{ label }}</label>

    <div
      :class="[
        'relative border-2 border-dashed transition-colors overflow-hidden group',
        shape === 'circle' ? 'rounded-full' : 'rounded-xl',
        containerHeight,
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
      <!-- Existing image -->
      <img
        v-if="modelValue && !uploading"
        :src="modelValue"
        alt="Upload preview"
        class="h-full w-full object-cover"
      />

      <!-- Loading overlay -->
      <div
        v-if="uploading"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 text-blue-600"
      >
        <Icon icon="mdi:loading" class="animate-spin text-2xl" />
        <p class="text-xs font-medium">Uploading… {{ progress }}%</p>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!modelValue"
        class="flex h-full w-full flex-col items-center justify-center px-3 text-center"
      >
        <Icon icon="mdi:cloud-upload-outline" class="text-3xl text-gray-400" />
        <p v-if="shape !== 'circle'" class="mt-1 text-sm text-gray-500">
          <span class="font-medium text-blue-600">Click to upload</span> or drag and drop
        </p>
        <p v-if="shape !== 'circle' && !compact" class="mt-0.5 text-xs text-gray-400">
          JPG, PNG, GIF or WebP
        </p>
      </div>

      <!-- Hover overlay on existing image -->
      <div
        v-if="modelValue && !uploading"
        class="absolute inset-0 hidden items-center justify-center gap-2 bg-black/40 text-white group-hover:flex"
      >
        <span class="rounded-md bg-white/20 px-2 py-1 text-xs backdrop-blur-sm">
          <Icon icon="mdi:image-edit-outline" class="mr-1 inline-block align-text-bottom" />
          Replace
        </span>
        <button
          type="button"
          class="rounded-md bg-white/20 px-2 py-1 text-xs backdrop-blur-sm hover:bg-red-500/80"
          aria-label="Remove image"
          @click.stop="clear"
        >
          <Icon icon="mdi:trash-can-outline" class="mr-1 inline-block align-text-bottom" />
          Remove
        </button>
      </div>

      <input
        ref="inputRef"
        type="file"
        accept="image/*"
        class="hidden"
        :disabled="disabled || uploading"
        @change="onFileChange"
      />
    </div>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-else-if="helper" class="text-xs text-gray-400">{{ helper }}</p>
  </div>
</template>
