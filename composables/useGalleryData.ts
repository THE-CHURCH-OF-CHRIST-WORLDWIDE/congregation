import { GALLERY_CATEGORIES } from '~/constants'
import type { GalleryPhoto } from '~/repositories/churchSettingsRepository'

export interface GalleryImage {
  id: string
  src: string
  alt: string
  width: number
  height: number
}

export interface Gallery {
  title: string
  images: GalleryImage[]
}

/** The category a stored photo belongs to; untagged photos fall under the first category. */
export function photoCategory(photo: GalleryPhoto): string {
  return photo.category || GALLERY_CATEGORIES[0].slug
}

/**
 * Builds every gallery from the photos staff add in Settings → Gallery, grouped by category.
 * Pure, so it can be tested without a store.
 */
export function buildGalleries(photos: GalleryPhoto[]): Record<string, Gallery> {
  const out: Record<string, Gallery> = {}
  for (const cat of GALLERY_CATEGORIES) out[cat.slug] = { title: cat.title, images: [] }
  for (const p of photos) {
    if (!p.src) continue
    const gallery = out[photoCategory(p)]
    if (!gallery) continue
    // Dimensions aren't stored with the photo; the masonry lays images out at their natural size.
    gallery.images.push({ id: p.id, src: p.src, alt: p.alt || gallery.title, width: 0, height: 0 })
  }
  return out
}

/**
 * Gallery categories shown under /gallery/<slug>, filled from Settings → Gallery.
 *
 * `slug` may be a getter so the page follows client-side navigation between categories.
 */
export function useGalleryData(slug: string | (() => string)) {
  const settingsStore = useChurchSettingsStore()
  onMounted(() => settingsStore.load())

  const galleries = computed(() => buildGalleries(settingsStore.settings.galleryPhotos ?? []))
  const gallery = computed<Gallery | null>(
    () => galleries.value[typeof slug === 'function' ? slug() : slug] ?? null
  )
  const loading = computed(() => settingsStore.loading)

  return { gallery, galleries, loading }
}
