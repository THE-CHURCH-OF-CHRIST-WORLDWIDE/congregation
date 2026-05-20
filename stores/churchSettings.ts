import { defineStore } from 'pinia'
import {
  useChurchSettingsRepository,
  type ChurchSettings,
} from '~/repositories/churchSettingsRepository'

export const DEFAULT_SETTINGS: ChurchSettings = {
  // General
  name: 'The Church of Christ',
  address: '7B Esa Atan Ext. Ikot Ekpene, Akwa Ibom State',
  phone: '(+234) 900 197 0700',
  email: 'churchofchristesa_atan@gmail.com',

  // Hero
  heroImageUrl: '',
  heroEyebrow: 'Welcome to',
  heroTagline: '"Believe God. Read Silence. Above Every State."',
  heroPrimaryCtaLabel: 'Visit Sunday Worship',
  heroPrimaryCtaHref: '#welcome',
  heroSecondaryCtaLabel: 'Service Times',
  heroSecondaryCtaHref: '#events',
  activities: [
    {
      name: 'Sunday Worship Service',
      timeRange: '9:00 am - 12:00 noon',
      frequency: 'Every Sunday',
    },
    { name: 'Bible Class', timeRange: '5:00 pm - 6:30 pm', frequency: 'Every Wednesday' },
  ],

  // Minister Welcome
  ministerName: 'Min. Friday Asuquo',
  ministerTitle: 'Resident Minister',
  ministerPhoto: 'https://picsum.photos/seed/minister-portrait/400/520',
  congregationPhotos: [
    'https://picsum.photos/seed/congregation1/400/520',
    'https://picsum.photos/seed/congregation2/400/520',
  ],
  ministerLetterHeading: 'A Welcome Letter From Our Minister',
  ministerLetterGreeting: 'Dear Friend,',
  ministerLetterP1:
    'We are delighted to welcome you to the online home of the Church of Christ, located at No. 7B Esa Atan Road Extension, Ikot Ekpene, Akwa Ibom State.',
  ministerLetterP2:
    'As a congregation, we are firmly rooted in the teachings of the Bible, which serves as our sole and authoritative guide. We believe in baptism by immersion and are committed to worshipping God in spirit and in truth. Guided by the simple pattern of the New Testament, we worship through teaching, singing, prayer, giving, and communion.',
  ministerLetterP3:
    'Feel free to explore our sermons and Sunday School teachings, and join us live every Sunday. You can also reach out to us anytime for enquiries, support, or Bible study.',
  ministerLetterP4:
    'We warmly encourage you to worship with the Church of Christ congregation nearest to you.',

  // Live Worship Teaser
  liveWorship: {
    heading: 'Join Our Live Worship',
    subheading:
      'Join us for live sessions to explore the teachings of God, or catch up by watching recordings of previous sessions.',
    nextTitle: 'Sunday Morning Worship',
    nextSchedule: 'Every Sunday · 9:00 AM',
    moderatorLabel: 'Moderator: Minister Friday Asuquo',
    recentHeading: 'Recent Streams',
    watchCtaLabel: 'Watch live Now',
    reminderCtaLabel: 'Set Reminder',
  },

  // About: Hero
  aboutHero: {
    scriptureRef: 'Romans 16:16',
    title: 'About Us',
    subtitle: 'Church Of Christ, 7b Esa Atan Extension',
    backgroundImage: 'https://picsum.photos/seed/church-building/1600/700',
  },

  // About: Church History
  aboutHistory: {
    eyebrow: 'History',
    heading: 'A BRIEF HISTORY OF THE CHURCH OF CHRIST, 7B ESA ATAN EXTENSION.',
    openingParagraph:
      "The Church of Christ at 7b Esa Atan Extension, Ikot Ekpene, Akwa Ibom State, was established in the year 2003 by a group of faithful brethren committed to the restoration of New Testament Christianity. Beginning with a small nucleus of seven members who gathered for worship before the construction of the current auditorium, the congregation has grown steadily under the guidance of God's word. The church is identified by the authority of the Scriptures alone, observing the New Testament pattern of worship and organisation as established by the apostles in the first century.",
    foundersHeading: 'Founding members and early leaders include:',
    founders: [
      { id: 'f1', name: 'Bro. Akpan Ekom — Elder (Founding overseer)' },
      { id: 'f2', name: 'Bro. Emmanuel Okon — Minister (Inaugural preacher)' },
      { id: 'f3', name: 'Bro. Chris Ikutte — Deacon' },
      { id: 'f4', name: 'Bro. Chiedu Nwosu — Deacon' },
      { id: 'f5', name: 'Bro. Tunde Adikwu — Deacon' },
      { id: 'f6', name: "Sis. Grace Okon — Women's Class Co-ordinator" },
    ],
    growthParagraph:
      'Through the faithful preaching of the gospel, the congregation grew from its seven founding members to an active membership of over two hundred and forty souls. A permanent worship building was completed and dedicated in 2010, and a parsonage was added in 2017. The congregation supports domestic and international evangelism, funds several gospel meetings annually, and maintains a thriving Bible school programme for both youth and adults.',
    scheduleHeading: 'Regular Meeting Schedule:',
    schedule: [
      { label: 'Bible Class — Every Sunday', time: '7:30 AM' },
      { label: "Lord's Supper / Communion — Every Sunday", time: '9:00 AM' },
      { label: 'Morning Worship — Every Sunday', time: '10:00 AM' },
      { label: 'Evening Service — Every Sunday', time: '5:00 PM' },
      { label: 'Bible Study — Every Wednesday', time: '5:00 PM' },
      { label: 'Evangelism — Every Friday', time: '4:00 PM' },
    ],
    closingParagraph:
      'We extend a warm and open invitation to all who seek to worship God in spirit and in truth. Whether you are a member of the Churches of Christ, a visitor to Ikot Ekpene, or someone searching for a congregation rooted in the New Testament pattern, you are most welcome to worship with us. Come, let us reason together from the Scriptures.',
    signatureName: 'Bro. Basiri Goody',
    signatureRole: 'Minister — Church of Christ, 7b Esa Atan Extension',
    cornerImages: [
      'https://picsum.photos/seed/history-tl/200/200',
      'https://picsum.photos/seed/history-tr/200/200',
      'https://picsum.photos/seed/history-bl/200/200',
      'https://picsum.photos/seed/history-br/200/200',
    ],
  },

  // About: Worship Activities
  worshipActivities: {
    eyebrow: 'Form of Worship',
    heading: 'Our Worship Activities',
    subtitle: 'Our worship follows the New Testament pattern — simple, scriptural, and sincere.',
    items: [
      { id: 'wa1', name: 'Prayer', icon: 'mdi:hands-pray', scripture: '1 Thessalonians 5:17' },
      { id: 'wa2', name: 'Singing', icon: 'mdi:music', scripture: 'Ephesians 5:19' },
      { id: 'wa3', name: 'Teaching', icon: 'mdi:book-open-variant', scripture: 'Acts 2:42' },
      { id: 'wa4', name: 'Giving', icon: 'mdi:hand-heart', scripture: '1 Corinthians 16:2' },
      { id: 'wa5', name: 'Communion', icon: 'mdi:cup-outline', scripture: 'Acts 20:7' },
    ],
  },

  // About: Activity Calendar
  activityCalendar: {
    eyebrow: 'Schedule',
    heading: 'Our Activity Calendar',
    subtitle: 'All activities are held at the church auditorium unless otherwise announced.',
    rows: [
      { id: 'ac1', day: 'Every Sunday', activity: 'Bible Class', time: '7:30 AM' },
      { id: 'ac2', day: 'Every Sunday', activity: "Lord's Supper", time: '9:00 AM' },
      { id: 'ac3', day: 'Every Sunday', activity: 'Morning Worship', time: '10:00 AM' },
      { id: 'ac4', day: 'Every Sunday', activity: 'Evening Service', time: '5:00 PM' },
      { id: 'ac5', day: 'Every Wednesday', activity: 'Bible Study', time: '5:00 PM' },
      { id: 'ac6', day: 'Every Friday', activity: 'Evangelism', time: '4:00 PM' },
      { id: 'ac7', day: 'Every Friday', activity: 'Prayer Meeting', time: '6:00 PM' },
      { id: 'ac8', day: 'First Saturday', activity: "Women's Class", time: '10:00 AM' },
    ],
  },

  // About: Worship This Sunday
  worshipThisSunday: {
    eyebrow: 'Join Us',
    heading: 'Worship With Us This Sunday',
    cardChurchName: 'Church of Christ',
    cardChurchSubtitle: '7b Esa Atan Extension',
    details: [
      {
        id: 'wts1',
        icon: 'mdi:calendar-outline',
        primary: 'Every Sunday Morning',
        secondary: 'Weekly worship service',
      },
      {
        id: 'wts2',
        icon: 'mdi:clock-outline',
        primary: '9:00 AM – 12:00 PM',
        secondary: 'Bible class starts at 7:30 AM',
      },
      {
        id: 'wts3',
        icon: 'mdi:map-marker-outline',
        primary: '7b Esa Atan, Ext. Ikot Ekpene',
        secondary: 'Akwa Ibom State, Nigeria',
      },
      {
        id: 'wts4',
        icon: 'mdi:phone-outline',
        primary: '+234 803 000 0000',
        secondary: 'Mon – Sat, 8:00 AM – 6:00 PM',
      },
    ],
    directionsUrl: 'https://maps.google.com/maps?q=7b+Esa+Atan,+Ikot+Ekpene,+Akwa+Ibom,+Nigeria',
    mapAddress: '7b Esa Atan, Ikot Ekpene, Akwa Ibom State, Nigeria',
  },

  // Leaders
  leaders: [
    {
      id: 'l1',
      name: 'Akpan Lincoln',
      role: 'Elder',
      avatar: 'https://picsum.photos/seed/ldr-al1/300/300',
    },
    {
      id: 'l2',
      name: 'Chidi Okafor',
      role: 'Elder',
      avatar: 'https://picsum.photos/seed/ldr-co/300/300',
    },
    {
      id: 'l3',
      name: 'Obinna Nwosu',
      role: 'Elder',
      avatar: 'https://picsum.photos/seed/ldr-on/300/300',
    },
    {
      id: 'l4',
      name: 'Tunde Adebayo',
      role: 'Elder',
      avatar: 'https://picsum.photos/seed/ldr-ta/300/300',
    },
    {
      id: 'l5',
      name: 'Bola Mikhail',
      role: 'Deacon',
      avatar: 'https://picsum.photos/seed/ldr-bm/300/300',
    },
    {
      id: 'l6',
      name: 'Chijioke Emmanuel',
      role: 'Deacon',
      avatar: 'https://picsum.photos/seed/ldr-ce/300/300',
    },
    {
      id: 'l7',
      name: 'Peter Eze',
      role: 'Deacon',
      avatar: 'https://picsum.photos/seed/ldr-pe/300/300',
    },
    {
      id: 'l8',
      name: 'Friday Asuquo',
      role: 'Minister',
      avatar: 'https://picsum.photos/seed/ldr-al3/300/300',
    },
  ],

  // Gallery
  galleryPhotos: [
    {
      id: 'g1',
      src: 'https://picsum.photos/seed/gallery1/600/800',
      alt: 'Church congregation gathered for worship',
    },
    {
      id: 'g2',
      src: 'https://picsum.photos/seed/gallery2/800/500',
      alt: 'Sunday morning worship service',
    },
    { id: 'g3', src: 'https://picsum.photos/seed/gallery3/600/600', alt: 'Bible study session' },
    {
      id: 'g4',
      src: 'https://picsum.photos/seed/gallery4/800/600',
      alt: 'Youth convention gathering',
    },
    { id: 'g5', src: 'https://picsum.photos/seed/gallery5/600/700', alt: 'Baptism ceremony' },
    {
      id: 'g6',
      src: 'https://picsum.photos/seed/gallery6/800/450',
      alt: 'Church choir performance',
    },
    {
      id: 'g7',
      src: 'https://picsum.photos/seed/gallery7/600/600',
      alt: 'Community outreach event',
    },
    {
      id: 'g8',
      src: 'https://picsum.photos/seed/gallery8/800/500',
      alt: 'Congregation fellowship',
    },
  ],
}

export const useChurchSettingsStore = defineStore('churchSettings', () => {
  const settings = ref<ChurchSettings>(structuredClone(DEFAULT_SETTINGS))
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function load() {
    if (loaded.value) return
    loading.value = true
    error.value = null
    try {
      const repo = useChurchSettingsRepository()
      const data = await repo.fetchSettings()
      if (data) settings.value = { ...DEFAULT_SETTINGS, ...data }
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load church settings'
    } finally {
      loading.value = false
    }
  }

  async function save(updates: Partial<ChurchSettings>) {
    saving.value = true
    error.value = null
    settings.value = { ...settings.value, ...updates }
    try {
      const repo = useChurchSettingsRepository()
      await repo.saveSettings(settings.value)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save church settings'
      throw e
    } finally {
      saving.value = false
    }
  }

  return { settings, loading, saving, error, loaded, load, save }
})
