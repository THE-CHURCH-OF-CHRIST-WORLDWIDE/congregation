/**
 * Uploads images to Cloudinary using an unsigned upload preset.
 *
 * Flow: pick file → compress in-browser → POST to Cloudinary → receive
 * `secure_url` → caller persists that URL to Firestore. The raw file never
 * reaches Firebase, and the uncompressed original never leaves the device.
 */

import type { CompressOptions, CompressedImage } from '~/utils/compressImage'

export interface CloudinaryUploadResult {
  url: string
  publicId: string
  width: number
  height: number
  format: string
  bytes: number
  /** What the in-browser compressor did to this file before uploading. */
  compression: CompressedImage
}

export interface UploadOptions {
  /** Override the default folder from runtime config (e.g. "congregation/leaders"). */
  folder?: string
  /** Max file size in bytes, checked *after* compression. Defaults to 5MB. */
  maxBytes?: number
  /**
   * Compress before uploading. `true` (default) uses the standard settings;
   * pass an object to tune them, or `false` to upload the file as-is.
   */
  compress?: boolean | CompressOptions
}

interface CloudinaryResponse {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
  bytes: number
  error?: { message: string }
}

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024
/**
 * Hard cap on what we'll even attempt to decode. Beyond this the browser tends
 * to run out of memory mid-compression, so reject it up front with a clear
 * message instead.
 */
const MAX_INPUT_BYTES = 25 * 1024 * 1024

function mb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')}MB`
}

export function useCloudinaryUpload() {
  const config = useRuntimeConfig()
  const cloudName = config.public.cloudinaryCloudName as string | undefined
  const uploadPreset = config.public.cloudinaryUploadPreset as string | undefined
  const defaultFolder = config.public.cloudinaryFolder as string | undefined

  const uploading = ref(false)
  /** True while the file is being re-encoded, before the network request starts. */
  const compressing = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)
  /** Stats from the most recent compression pass, for UI that wants to show them. */
  const compression = ref<CompressedImage | null>(null)

  /** Checks that don't depend on the compressed output, run before decoding. */
  function validateInput(file: File) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed.')
    }
    if (file.size > MAX_INPUT_BYTES) {
      throw new Error(`Image is too large to process. Pick one under ${mb(MAX_INPUT_BYTES)}.`)
    }
    if (!cloudName || !uploadPreset) {
      throw new Error(
        'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.'
      )
    }
  }

  function uploadWithProgress(file: File, folder: string): Promise<CloudinaryResponse> {
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset!)
    if (folder) formData.append('folder', folder)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', endpoint)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          progress.value = Math.round((e.loaded / e.total) * 100)
        }
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText) as CloudinaryResponse
          if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
            resolve(data)
          } else {
            reject(new Error(data.error?.message || `Upload failed (${xhr.status})`))
          }
        } catch {
          reject(new Error('Unexpected response from image host.'))
        }
      }

      xhr.onerror = () => reject(new Error('Network error while uploading image.'))
      xhr.onabort = () => reject(new Error('Upload was cancelled.'))

      xhr.send(formData)
    })
  }

  async function upload(file: File, options: UploadOptions = {}): Promise<CloudinaryUploadResult> {
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
    const folder = options.folder ?? defaultFolder ?? ''
    const compressOption = options.compress ?? true

    uploading.value = true
    progress.value = 0
    error.value = null
    compression.value = null

    try {
      validateInput(file)

      let result: CompressedImage
      if (compressOption === false) {
        result = {
          file,
          originalBytes: file.size,
          bytes: file.size,
          width: 0,
          height: 0,
          skipped: true,
          reason: 'disabled',
        }
      } else {
        compressing.value = true
        try {
          result = await compressImage(file, compressOption === true ? {} : compressOption)
        } finally {
          compressing.value = false
        }
      }
      compression.value = result

      // The size limit applies to what actually gets uploaded, so a large photo
      // that compresses under the limit is accepted rather than rejected.
      if (result.file.size > maxBytes) {
        const limit = `must be under ${mb(maxBytes)}`
        // Don't claim it was compressed when it wasn't — GIFs and vectors are
        // passed through deliberately, and blaming the compressor would send
        // the user looking for a setting that doesn't exist.
        if (result.reason === 'animated') {
          throw new Error(
            `Animated GIFs are uploaded as-is, and this one is ${mb(result.file.size)}; ${limit}.`
          )
        }
        throw new Error(
          result.skipped
            ? `Image is ${mb(result.file.size)}; ${limit}.`
            : `Image is ${mb(result.file.size)} after compression; ${limit}.`
        )
      }

      const data = await uploadWithProgress(result.file, folder)
      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
        compression: result,
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Image upload failed.'
      throw e
    } finally {
      uploading.value = false
      compressing.value = false
    }
  }

  function reset() {
    uploading.value = false
    compressing.value = false
    progress.value = 0
    error.value = null
    compression.value = null
  }

  return { upload, reset, uploading, compressing, progress, error, compression }
}
