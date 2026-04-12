export interface Speaker {
  name: string
  avatar: string
}

export interface UpcomingEvent {
  id: string
  title: string
  date: string        // "YYYY-MM-DD"
  time: string        // "7:00 PM"
  venue: string
  galleryImages: string[]
}

export interface PastEvent {
  id: string
  title: string
  date: string
  time: string
  venue: string
  category: string
  thumbnail: string
  featuredImage: string
  moderator: Speaker
  speakers: Speaker[]
}
