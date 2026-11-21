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

const { upload, uploading, compressing, progress, error } = useCloudinaryUpload()
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
      <label v-if="label" class="text-sm font-medium text-ink">{{ label }}</label>
      <span v-if="max" class="num text-xs text-ink-subtle">{{ images.length }} / {{ max }}</span>
    </div>

    <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
      <!-- Existing thumbnails -->
      <div
        v-for="(src, i) in images"
        :key="`${src}-${i}`"
        class="group relative aspect-square overflow-hidden rounded-md border border-rule bg-surface-muted"
      >
        <img
          :src="displayableImageUrl(src)"
          :alt="`Gallery image ${i + 1}`"
          class="h-full w-full object-cover"
        />
        <button
          type="button"
          class="absolute top-1 right-1 inline-flex size-7 items-center justify-center rounded-md bg-night/60 text-on-night opacity-0 ring-1 ring-on-night/25 transition-[opacity,background-color] duration-150 group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-error"
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
          'relative flex aspect-square flex-col items-center justify-center rounded-md border-2 border-dashed px-2 text-center transition-colors duration-150',
          dragging
            ? 'border-primary bg-primary-soft'
            : error
              ? 'border-error/60 bg-error-soft hover:border-error'
              : 'border-rule-strong bg-surface-muted hover:border-ink-subtle',
          disabled || uploading ? 'cursor-wait' : 'cursor-pointer',
        ]"
        :aria-busy="uploading"
        @dragover.prevent="!disabled && !uploading && (dragging = true)"
        @dragleave="dragging = false"
        @drop.prevent="onDrop"
        @click="openPicker"
      >
        <template v-if="uploading">
          <Icon
            icon="mdi:loading"
            class="animate-spin text-2xl text-primary-ink"
            aria-hidden="true"
          />
          <p class="num mt-1 text-[11px] font-medium text-primary-ink" aria-live="polite">
            <template v-if="compressing">Compressing…</template>
            <template v-else>{{ progress }}%</template>
            <span v-if="queueLength > 1"> · {{ queueDone }} / {{ queueLength }}</span>
          </p>
          <div
            class="progress-bar mt-1.5 w-4/5"
            role="progressbar"
            aria-label="Upload progress"
            :aria-valuenow="compressing ? undefined : progress"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="progress-bar-fill"
              :style="{ width: `${compressing ? 0 : progress}%` }"
            ></div>
          </div>
        </template>
        <template v-else>
          <Icon
            icon="mdi:cloud-upload-outline"
            class="text-2xl text-ink-subtle"
            aria-hidden="true"
          />
          <p class="mt-1 text-[11px] leading-tight text-ink-muted">
            <span class="font-medium text-primary-ink">Click</span> or drop
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

    <p v-if="error" class="flex items-start gap-1 text-xs font-medium text-error" role="alert">
      <Icon icon="mdi:alert-circle-outline" class="mt-px shrink-0 text-sm" aria-hidden="true" />
      {{ error }}
    </p>
    <p v-else-if="helper" class="text-xs text-ink-subtle">{{ helper }}</p>
  </div>
</template>
