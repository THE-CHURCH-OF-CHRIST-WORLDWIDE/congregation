/**
 * Uploads images to Cloudinary using an unsigned upload preset.
 *
 * Flow: pick file → POST to Cloudinary → receive `secure_url` → caller persists
 * that URL to Firestore. The raw file never reaches Firebase.
 */

export interface CloudinaryUploadResult {
  url: string
  publicId: string
  width: number
  height: number
  format: string
  bytes: number
}

export interface UploadOptions {
  /** Override the default folder from runtime config (e.g. "congregation/leaders"). */
  folder?: string
  /** Max file size in bytes. Defaults to 5MB. */
  maxBytes?: number
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

export function useCloudinaryUpload() {
  const config = useRuntimeConfig()
  const cloudName = config.public.cloudinaryCloudName as string | undefined
  const uploadPreset = config.public.cloudinaryUploadPreset as string | undefined
  const defaultFolder = config.public.cloudinaryFolder as string | undefined

  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  function validate(file: File, maxBytes: number) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed.')
    }
    if (file.size > maxBytes) {
      const mb = Math.round(maxBytes / (1024 * 1024))
      throw new Error(`Image must be under ${mb}MB.`)
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

    uploading.value = true
    progress.value = 0
    error.value = null

    try {
      validate(file, maxBytes)
      const data = await uploadWithProgress(file, folder)
      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Image upload failed.'
      throw e
    } finally {
      uploading.value = false
    }
  }

  function reset() {
    uploading.value = false
    progress.value = 0
    error.value = null
  }

  return { upload, reset, uploading, progress, error }
}
