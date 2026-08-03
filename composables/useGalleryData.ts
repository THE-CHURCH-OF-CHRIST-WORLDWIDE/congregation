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

/**
 * Gallery categories shown under /gallery/<slug>.
 *
 * The category list is structural — the photos in each are church content and
 * are managed from the admin Settings page, so they start empty rather than
 * shipping placeholder images.
 */
const GALLERIES: Record<string, Gallery> = {
  'sunday-service': { title: 'Sunday Service', images: [] },
  'gospel-meeting': { title: 'Gospel Meeting', images: [] },
  'bible-class': { title: 'Bible Class', images: [] },
  evangelism: { title: 'Evangelism', images: [] },
}

export function useGalleryData(slug: string) {
  const gallery = GALLERIES[slug] ?? null
  return { gallery, galleries: GALLERIES }
}
