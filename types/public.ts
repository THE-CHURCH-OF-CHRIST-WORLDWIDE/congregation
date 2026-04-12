export interface LiveStream {
  id: string
  title: string
  congregation: string
  city: string
  viewerCount: number
  thumbnailSrc: string
  startedAt: string
}

export interface RecordedStream {
  id: string
  title: string
  serviceType: string
  preacher: string
  date: string
  duration: string
  views: number
  thumbnailSrc: string
  slug: string
}

export interface PublicSermon {
  id: string
  slug: string
  title: string
  preacher: string
  date: string
  tags: string[]
  thumbnailSrc: string
  videoSrc: string
  description: string
  lessonPoints: string[]
  soulWinnerPoints: string[]
  relatedIds: string[]
}

export interface Lesson {
  id: string
  slug: string
  title: string
  preacher: string
  date: string
  tags: string[]
  thumbnailSrc: string
  overviewGoals: string[]
  churchDuties: string[]
  scripture: string
  relatedIds: string[]
}

export interface ChurchEvent {
  id: string
  title: string
  day: string
  month: string
  location: string
  time: string
  colorClass: string
}

export interface Congregation {
  id: string
  name: string
  address: string
  serviceTime: string
  city: string
}
