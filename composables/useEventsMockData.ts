import type { UpcomingEvent, PastEvent } from '~/types/events'

const GALLERY_12 = (prefix: string) =>
  Array.from({ length: 12 }, (_, i) => `https://picsum.photos/seed/${prefix}-${i + 1}/800/450`)

const GALLERY_8 = (prefix: string) =>
  Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/${prefix}-${i + 1}/800/450`)

const GALLERY_6 = (prefix: string) =>
  Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/${prefix}-${i + 1}/800/450`)

const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: 'ue-1',
    title: 'Equipping for Evangelism',
    date: '2024-03-10',
    time: '7:00 PM',
    venue: 'Church Hall',
    galleryImages: GALLERY_12('ev1'),
  },
  {
    id: 'ue-2',
    title: 'Deeper Dive Bible Study',
    date: '2024-04-02',
    time: '7:30 PM',
    venue: 'Church Hall',
    galleryImages: [],
  },
  {
    id: 'ue-3',
    title: 'Evening Prayer Meeting',
    date: '2024-04-15',
    time: '6:00 PM',
    venue: 'Church Hall',
    galleryImages: [],
  },
  {
    id: 'ue-4',
    title: 'Annual Gospel Meeting',
    date: '2024-05-01',
    time: '7:00 PM',
    venue: 'Church Hall',
    galleryImages: GALLERY_8('ev4'),
  },
  {
    id: 'ue-5',
    title: "Sister's Lectureship",
    date: '2024-05-15',
    time: '10:00 AM',
    venue: 'Church Hall',
    galleryImages: [],
  },
  {
    id: 'ue-6',
    title: 'Equipping for Evangelism',
    date: '2024-06-10',
    time: '7:00 PM',
    venue: 'Church Hall',
    galleryImages: GALLERY_6('ev6'),
  },
]

const PAST_EVENTS: PastEvent[] = [
  {
    id: 'pe-1',
    title: 'Exploring the Scriptures',
    date: '2026-04-10',
    time: '6:30 PM',
    venue: 'Church Hall',
    category: 'Bible Study',
    thumbnail: 'https://picsum.photos/seed/pe1-thumb/320/240',
    featuredImage: 'https://picsum.photos/seed/pe1-feat/1200/800',
    moderator: { name: 'Akpan Ekom', avatar: 'https://picsum.photos/seed/mod1/100/100' },
    speakers: [
      { name: 'Chinedu Nwosu', avatar: 'https://picsum.photos/seed/spk1/100/100' },
      { name: 'Tunde Balogun', avatar: 'https://picsum.photos/seed/spk2/100/100' },
      { name: 'Emeika Okafor', avatar: 'https://picsum.photos/seed/spk3/100/100' },
    ],
  },
  {
    id: 'pe-2',
    title: 'Faith in Action',
    date: '2026-04-18',
    time: '5:00 PM',
    venue: 'Church Hall',
    category: 'Gospel Meeting',
    thumbnail: 'https://picsum.photos/seed/pe2-thumb/320/240',
    featuredImage: 'https://picsum.photos/seed/pe2-feat/1200/800',
    moderator: { name: 'Chukwudi Eze', avatar: 'https://picsum.photos/seed/mod2/100/100' },
    speakers: [
      { name: 'Emeka Obi', avatar: 'https://picsum.photos/seed/spk4/100/100' },
      { name: 'Segun Adeyemi', avatar: 'https://picsum.photos/seed/spk5/100/100' },
      { name: 'Bulus Musa', avatar: 'https://picsum.photos/seed/spk6/100/100' },
    ],
  },
  {
    id: 'pe-3',
    title: "Women of Faith: Building Stronger Bonds",
    date: '2023-11-15',
    time: '10:00 AM',
    venue: 'Church Hall',
    category: "Women's Seminar",
    thumbnail: 'https://picsum.photos/seed/pe3-thumb/320/240',
    featuredImage: 'https://picsum.photos/seed/pe3-feat/1200/800',
    moderator: { name: 'Grace Okon', avatar: 'https://picsum.photos/seed/mod3/100/100' },
    speakers: [
      { name: 'Ngozi Adaeze', avatar: 'https://picsum.photos/seed/spk7/100/100' },
      { name: 'Bimpe Fashola', avatar: 'https://picsum.photos/seed/spk8/100/100' },
      { name: 'Ruth Okafor', avatar: 'https://picsum.photos/seed/spk9/100/100' },
    ],
  },
]

export const useEventsMockData = () => {
  const eventsStore = useEventsStore()

  function seedEvents() {
    if (eventsStore.upcomingEvents.length > 0) return
    eventsStore.setUpcomingEvents(UPCOMING_EVENTS)
    eventsStore.setPastEvents(PAST_EVENTS)
    // Default selected: 4th upcoming event & first past event
    if (UPCOMING_EVENTS[3]) eventsStore.selectUpcomingEvent(UPCOMING_EVENTS[3])
    if (PAST_EVENTS[0]) eventsStore.selectPastEvent(PAST_EVENTS[0])
  }

  return { seedEvents }
}
