<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Settings', description: 'Church admin settings.' })

const { setHeader } = usePageHeader()
const authStore = useAuthStore()
const store = useChurchSettingsStore()

onMounted(async () => {
  setHeader('Settings', 'Manage church configuration and preferences')
  await store.load()
})

type Tab =
  | 'general'
  | 'homepage'
  | 'minister'
  | 'live'
  | 'about'
  | 'history'
  | 'worship'
  | 'calendar'
  | 'sunday'
  | 'leaders'
  | 'gallery'
  | 'roles'
const activeTab = ref<Tab>('general')
const tabs = [
  { label: 'General', value: 'general' },
  { label: 'Homepage', value: 'homepage' },
  { label: 'Minister', value: 'minister' },
  { label: 'Live Worship', value: 'live' },
  { label: 'About Hero', value: 'about' },
  { label: 'History', value: 'history' },
  { label: 'Worship Activities', value: 'worship' },
  { label: 'Activity Calendar', value: 'calendar' },
  { label: 'Worship This Sunday', value: 'sunday' },
  { label: 'Leaders', value: 'leaders' },
  { label: 'Gallery', value: 'gallery' },
  { label: 'Roles & Permissions', value: 'roles' },
]

// ── Local draft (deep-cloned from store so edits don't live-update public pages until saved) ──
function cloneSettings<T>(s: T): T {
  return JSON.parse(JSON.stringify(s)) as T
}
const draft = ref(cloneSettings(store.settings))
watch(
  () => store.settings,
  (s) => {
    draft.value = cloneSettings(s)
  },
  { deep: true }
)

const saved = ref(false)
const saveError = ref('')

async function save() {
  saveError.value = ''
  try {
    await store.save({ ...draft.value })
    saved.value = true
    setTimeout(() => {
      saved.value = false
    }, 2500)
  } catch {
    saveError.value = 'Failed to save. Please try again.'
  }
}

// ── Activities helpers ────────────────────────────────────────────────────
function addActivity() {
  draft.value.activities.push({ name: '', timeRange: '', frequency: '' })
}
function removeActivity(i: number) {
  draft.value.activities.splice(i, 1)
}

// ── Leaders helpers ───────────────────────────────────────────────────────
function addLeader() {
  draft.value.leaders.push({ id: `l${Date.now()}`, name: '', role: 'Elder', avatar: '' })
}
function removeLeader(i: number) {
  draft.value.leaders.splice(i, 1)
}

// ── Gallery helpers ───────────────────────────────────────────────────────
function addPhoto() {
  draft.value.galleryPhotos.push({ id: `g${Date.now()}`, src: '', alt: '' })
}
function removePhoto(i: number) {
  draft.value.galleryPhotos.splice(i, 1)
}

// ── History helpers ───────────────────────────────────────────────────────
function addFounder() {
  draft.value.aboutHistory.founders.push({ id: `f${Date.now()}`, name: '' })
}
function removeFounder(i: number) {
  draft.value.aboutHistory.founders.splice(i, 1)
}
function addHistoryScheduleRow() {
  draft.value.aboutHistory.schedule.push({ label: '', time: '' })
}
function removeHistoryScheduleRow(i: number) {
  draft.value.aboutHistory.schedule.splice(i, 1)
}

// ── Worship Activities helpers ────────────────────────────────────────────
function addWorshipActivity() {
  draft.value.worshipActivities.items.push({
    id: `wa${Date.now()}`,
    name: '',
    icon: 'mdi:hands-pray',
    scripture: '',
  })
}
function removeWorshipActivity(i: number) {
  draft.value.worshipActivities.items.splice(i, 1)
}

// ── Activity Calendar helpers ─────────────────────────────────────────────
function addCalendarRow() {
  draft.value.activityCalendar.rows.push({
    id: `ac${Date.now()}`,
    day: '',
    activity: '',
    time: '',
  })
}
function removeCalendarRow(i: number) {
  draft.value.activityCalendar.rows.splice(i, 1)
}

// ── Worship This Sunday helpers ───────────────────────────────────────────
function addSundayDetail() {
  draft.value.worshipThisSunday.details.push({
    id: `wts${Date.now()}`,
    icon: 'mdi:calendar-outline',
    primary: '',
    secondary: '',
  })
}
function removeSundayDetail(i: number) {
  draft.value.worshipThisSunday.details.splice(i, 1)
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <Tabs v-model="activeTab" :tabs="tabs" />

    <!-- Toast -->
    <Transition name="fade">
      <div
        v-if="saved"
        class="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
      >
        <Icon icon="mdi:check-circle-outline" />
        Settings saved successfully!
      </div>
    </Transition>
    <Transition name="fade">
      <div
        v-if="saveError"
        class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <Icon icon="mdi:alert-circle-outline" />
        {{ saveError }}
      </div>
    </Transition>

    <Transition name="fade" mode="out-in">
      <!-- ── General ──────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'general'" key="general" class="flex max-w-2xl flex-col gap-5">
        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Church Information</h3>
          <div class="flex flex-col gap-4">
            <Input v-model="draft.name" label="Church Name" placeholder="The Church of Christ" />
            <Input
              v-model="draft.address"
              label="Address"
              placeholder="7B Esa Atan Ext. Ikot Ekpene"
            />
            <Input v-model="draft.phone" label="Phone Number" placeholder="(+234) 900 000 0000" />
            <Input
              v-model="draft.email"
              label="Email Address"
              placeholder="info@churchofchrist.org"
            />
          </div>
        </Card>

        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Account</h3>
          <div class="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <Avatar :name="authStore.user?.email ?? 'Admin'" size="lg" />
            <div>
              <p class="text-sm font-medium text-gray-900">
                {{ authStore.user?.email ?? 'admin@church.org' }}
              </p>
              <p class="text-xs text-gray-500">Church Administrator</p>
            </div>
          </div>
        </Card>

        <div class="flex justify-end">
          <Button :loading="store.saving" @click="save">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save Settings
          </Button>
        </div>
      </div>

      <!-- ── Homepage (Hero + Activities) ────────────────────────────── -->
      <div
        v-else-if="activeTab === 'homepage'"
        key="homepage"
        class="flex max-w-2xl flex-col gap-5"
      >
        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Hero Section</h3>
          <div class="flex flex-col gap-4">
            <ImageUpload
              v-model="draft.heroImageUrl"
              label="Building Photo"
              folder="congregation/hero"
              helper="Shown as the full-width background image in the hero card."
            />
            <Input v-model="draft.heroEyebrow" label="Eyebrow" placeholder="Welcome to" />
            <div>
              <label for="hero-tagline" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Tagline / Scripture</label
              >
              <textarea
                id="hero-tagline"
                v-model="draft.heroTagline"
                rows="2"
                class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <Input
                v-model="draft.heroPrimaryCtaLabel"
                label="Primary CTA Label"
                placeholder="Visit Sunday Worship"
              />
              <Input
                v-model="draft.heroPrimaryCtaHref"
                label="Primary CTA Link"
                placeholder="#welcome"
              />
              <Input
                v-model="draft.heroSecondaryCtaLabel"
                label="Secondary CTA Label"
                placeholder="Service Times"
              />
              <Input
                v-model="draft.heroSecondaryCtaHref"
                label="Secondary CTA Link"
                placeholder="#events"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Church Activities</h3>
            <Button variant="secondary" size="sm" @click="addActivity">
              <template #icon-left><Icon icon="mdi:plus" /></template>
              Add Activity
            </Button>
          </div>
          <div class="flex flex-col gap-4">
            <div
              v-for="(act, i) in draft.activities"
              :key="i"
              class="relative grid grid-cols-3 gap-3 rounded-lg border border-gray-200 p-3"
            >
              <Input
                v-model="act.name"
                label="Activity Name"
                placeholder="Sunday Worship Service"
              />
              <Input
                v-model="act.timeRange"
                label="Time Range"
                placeholder="9:00 am - 12:00 noon"
              />
              <Input v-model="act.frequency" label="Frequency" placeholder="Every Sunday" />
              <button
                class="absolute right-2 top-2 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                :aria-label="`Remove activity ${i + 1}`"
                @click="removeActivity(i)"
              >
                <Icon icon="mdi:close" class="text-sm" />
              </button>
            </div>
            <p v-if="!draft.activities.length" class="text-center text-sm text-gray-400">
              No activities added yet.
            </p>
          </div>
        </Card>

        <div class="flex justify-end">
          <Button :loading="store.saving" @click="save">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save Settings
          </Button>
        </div>
      </div>

      <!-- ── Minister Welcome ─────────────────────────────────────────── -->
      <div
        v-else-if="activeTab === 'minister'"
        key="minister"
        class="flex max-w-2xl flex-col gap-5"
      >
        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Minister Details</h3>
          <div class="flex flex-col gap-4">
            <Input
              v-model="draft.ministerName"
              label="Minister Name"
              placeholder="Min. Friday Asuquo"
            />
            <Input
              v-model="draft.ministerTitle"
              label="Title / Role"
              placeholder="Resident Minister"
            />
            <ImageUpload
              v-model="draft.ministerPhoto"
              label="Minister Photo"
              folder="congregation/minister"
              shape="circle"
            />
          </div>
        </Card>

        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Congregation Background Photos</h3>
          <p class="mb-3 text-xs text-gray-400">
            These appear as the stacked "fan" cards behind the minister portrait.
          </p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ImageUpload
              v-model="draft.congregationPhotos[0]"
              label="Back Card Photo"
              folder="congregation/minister"
              compact
            />
            <ImageUpload
              v-model="draft.congregationPhotos[1]"
              label="Mid Card Photo"
              folder="congregation/minister"
              compact
            />
          </div>
        </Card>

        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Welcome Letter</h3>
          <div class="flex flex-col gap-4">
            <Input
              v-model="draft.ministerLetterHeading"
              label="Letter Heading"
              placeholder="A Welcome Letter From Our Minister"
            />
            <Input
              v-model="draft.ministerLetterGreeting"
              label="Greeting"
              placeholder="Dear Friend,"
            />
            <div>
              <label for="letter-p1" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Paragraph 1 (opening, with drop-cap)</label
              >
              <textarea
                id="letter-p1"
                v-model="draft.ministerLetterP1"
                rows="3"
                class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
            <div>
              <label for="letter-p2" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Paragraph 2</label
              >
              <textarea
                id="letter-p2"
                v-model="draft.ministerLetterP2"
                rows="4"
                class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
            <div>
              <label for="letter-p3" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Paragraph 3</label
              >
              <textarea
                id="letter-p3"
                v-model="draft.ministerLetterP3"
                rows="3"
                class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
            <div>
              <label for="letter-p4" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Paragraph 4 (closing)</label
              >
              <textarea
                id="letter-p4"
                v-model="draft.ministerLetterP4"
                rows="2"
                class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
          </div>
        </Card>

        <div class="flex justify-end">
          <Button :loading="store.saving" @click="save">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save Settings
          </Button>
        </div>
      </div>

      <!-- ── Live Worship ─────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'live'" key="live" class="flex max-w-2xl flex-col gap-5">
        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Live Worship Section</h3>
          <div class="flex flex-col gap-4">
            <Input
              v-model="draft.liveWorship.heading"
              label="Heading"
              placeholder="Join Our Live Worship"
            />
            <div>
              <label for="lw-sub" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Subheading</label
              >
              <textarea
                id="lw-sub"
                v-model="draft.liveWorship.subheading"
                rows="2"
                class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <Input
                v-model="draft.liveWorship.nextTitle"
                label="Next Service Title"
                placeholder="Sunday Morning Worship"
              />
              <Input
                v-model="draft.liveWorship.nextSchedule"
                label="Schedule Label"
                placeholder="Every Sunday · 9:00 AM"
              />
              <Input
                v-model="draft.liveWorship.moderatorLabel"
                label="Moderator Label"
                placeholder="Moderator: Min. Friday Asuquo"
              />
              <Input
                v-model="draft.liveWorship.recentHeading"
                label="Recent Streams Heading"
                placeholder="Recent Streams"
              />
              <Input
                v-model="draft.liveWorship.watchCtaLabel"
                label="Watch Now CTA"
                placeholder="Watch live Now"
              />
              <Input
                v-model="draft.liveWorship.reminderCtaLabel"
                label="Reminder CTA"
                placeholder="Set Reminder"
              />
            </div>
          </div>
        </Card>

        <div class="flex justify-end">
          <Button :loading="store.saving" @click="save">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save Settings
          </Button>
        </div>
      </div>

      <!-- ── About Hero ───────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'about'" key="about" class="flex max-w-2xl flex-col gap-5">
        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">About Page Hero</h3>
          <div class="flex flex-col gap-4">
            <ImageUpload
              v-model="draft.aboutHero.backgroundImage"
              label="Background Image"
              folder="congregation/about"
              helper="Full-width banner image on the About page."
            />
            <Input
              v-model="draft.aboutHero.scriptureRef"
              label="Scripture Reference"
              placeholder="Romans 16:16"
            />
            <Input v-model="draft.aboutHero.title" label="Title" placeholder="About Us" />
            <Input
              v-model="draft.aboutHero.subtitle"
              label="Subtitle"
              placeholder="Church Of Christ, 7b Esa Atan Extension"
            />
          </div>
        </Card>

        <div class="flex justify-end">
          <Button :loading="store.saving" @click="save">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save Settings
          </Button>
        </div>
      </div>

      <!-- ── History ──────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'history'" key="history" class="flex max-w-3xl flex-col gap-5">
        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Headings</h3>
          <div class="flex flex-col gap-4">
            <Input v-model="draft.aboutHistory.eyebrow" label="Eyebrow" placeholder="History" />
            <div>
              <label for="hist-heading" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Main Heading</label
              >
              <textarea
                id="hist-heading"
                v-model="draft.aboutHistory.heading"
                rows="2"
                class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
          </div>
        </Card>

        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Narrative</h3>
          <div class="flex flex-col gap-4">
            <div>
              <label for="hist-p1" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Opening Paragraph</label
              >
              <textarea
                id="hist-p1"
                v-model="draft.aboutHistory.openingParagraph"
                rows="5"
                class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
            <div>
              <label for="hist-p2" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Growth Paragraph</label
              >
              <textarea
                id="hist-p2"
                v-model="draft.aboutHistory.growthParagraph"
                rows="4"
                class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
            <div>
              <label for="hist-p3" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Closing Paragraph</label
              >
              <textarea
                id="hist-p3"
                v-model="draft.aboutHistory.closingParagraph"
                rows="4"
                class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
          </div>
        </Card>

        <Card>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Founders / Early Leaders</h3>
            <Button variant="secondary" size="sm" @click="addFounder">
              <template #icon-left><Icon icon="mdi:plus" /></template>
              Add Founder
            </Button>
          </div>
          <Input
            v-model="draft.aboutHistory.foundersHeading"
            label="Section Heading"
            placeholder="Founding members and early leaders include:"
          />
          <div class="mt-4 flex flex-col gap-2">
            <div
              v-for="(founder, i) in draft.aboutHistory.founders"
              :key="founder.id"
              class="relative flex items-center gap-2 rounded-lg border border-gray-200 p-2"
            >
              <Input v-model="founder.name" class="flex-1" placeholder="Bro. Akpan Ekom — Elder" />
              <button
                class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                :aria-label="`Remove founder ${i + 1}`"
                @click="removeFounder(i)"
              >
                <Icon icon="mdi:close" class="text-sm" />
              </button>
            </div>
            <p v-if="!draft.aboutHistory.founders.length" class="text-center text-sm text-gray-400">
              No founders added yet.
            </p>
          </div>
        </Card>

        <Card>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Meeting Schedule</h3>
            <Button variant="secondary" size="sm" @click="addHistoryScheduleRow">
              <template #icon-left><Icon icon="mdi:plus" /></template>
              Add Row
            </Button>
          </div>
          <Input
            v-model="draft.aboutHistory.scheduleHeading"
            label="Section Heading"
            placeholder="Regular Meeting Schedule:"
          />
          <div class="mt-4 flex flex-col gap-2">
            <div
              v-for="(row, i) in draft.aboutHistory.schedule"
              :key="i"
              class="relative grid grid-cols-[2fr_1fr_auto] gap-2 rounded-lg border border-gray-200 p-2"
            >
              <Input v-model="row.label" placeholder="Bible Class — Every Sunday" />
              <Input v-model="row.time" placeholder="7:30 AM" />
              <button
                class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                :aria-label="`Remove schedule row ${i + 1}`"
                @click="removeHistoryScheduleRow(i)"
              >
                <Icon icon="mdi:close" class="text-sm" />
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Signature</h3>
          <div class="grid grid-cols-2 gap-3">
            <Input
              v-model="draft.aboutHistory.signatureName"
              label="Signed By"
              placeholder="Bro. Basiri Goody"
            />
            <Input
              v-model="draft.aboutHistory.signatureRole"
              label="Role"
              placeholder="Minister — Church of Christ"
            />
          </div>
        </Card>

        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Corner Decorative Images</h3>
          <div class="grid grid-cols-2 gap-3">
            <ImageUpload
              v-model="draft.aboutHistory.cornerImages[0]"
              label="Top Left"
              folder="congregation/history"
              shape="circle"
              compact
            />
            <ImageUpload
              v-model="draft.aboutHistory.cornerImages[1]"
              label="Top Right"
              folder="congregation/history"
              shape="circle"
              compact
            />
            <ImageUpload
              v-model="draft.aboutHistory.cornerImages[2]"
              label="Bottom Left"
              folder="congregation/history"
              shape="circle"
              compact
            />
            <ImageUpload
              v-model="draft.aboutHistory.cornerImages[3]"
              label="Bottom Right"
              folder="congregation/history"
              shape="circle"
              compact
            />
          </div>
        </Card>

        <div class="flex justify-end">
          <Button :loading="store.saving" @click="save">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save Settings
          </Button>
        </div>
      </div>

      <!-- ── Worship Activities ───────────────────────────────────────── -->
      <div v-else-if="activeTab === 'worship'" key="worship" class="flex max-w-3xl flex-col gap-5">
        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Section Header</h3>
          <div class="flex flex-col gap-4">
            <Input
              v-model="draft.worshipActivities.eyebrow"
              label="Eyebrow"
              placeholder="Form of Worship"
            />
            <Input
              v-model="draft.worshipActivities.heading"
              label="Heading"
              placeholder="Our Worship Activities"
            />
            <div>
              <label for="wa-sub" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Subtitle</label
              >
              <textarea
                id="wa-sub"
                v-model="draft.worshipActivities.subtitle"
                rows="2"
                class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
          </div>
        </Card>

        <Card>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Activities</h3>
            <Button variant="secondary" size="sm" @click="addWorshipActivity">
              <template #icon-left><Icon icon="mdi:plus" /></template>
              Add Activity
            </Button>
          </div>
          <div class="flex flex-col gap-3">
            <div
              v-for="(item, i) in draft.worshipActivities.items"
              :key="item.id"
              class="relative grid grid-cols-3 gap-3 rounded-lg border border-gray-200 p-3"
            >
              <Input v-model="item.name" label="Name" placeholder="Prayer" />
              <Input v-model="item.icon" label="Icon (Iconify name)" placeholder="mdi:hands-pray" />
              <Input
                v-model="item.scripture"
                label="Scripture"
                placeholder="1 Thessalonians 5:17"
              />
              <button
                class="absolute right-2 top-2 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                :aria-label="`Remove activity ${i + 1}`"
                @click="removeWorshipActivity(i)"
              >
                <Icon icon="mdi:close" class="text-sm" />
              </button>
            </div>
            <p
              v-if="!draft.worshipActivities.items.length"
              class="text-center text-sm text-gray-400"
            >
              No worship activities added yet.
            </p>
          </div>
        </Card>

        <div class="flex justify-end">
          <Button :loading="store.saving" @click="save">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save Settings
          </Button>
        </div>
      </div>

      <!-- ── Activity Calendar ────────────────────────────────────────── -->
      <div
        v-else-if="activeTab === 'calendar'"
        key="calendar"
        class="flex max-w-3xl flex-col gap-5"
      >
        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Section Header</h3>
          <div class="flex flex-col gap-4">
            <Input
              v-model="draft.activityCalendar.eyebrow"
              label="Eyebrow"
              placeholder="Schedule"
            />
            <Input
              v-model="draft.activityCalendar.heading"
              label="Heading"
              placeholder="Our Activity Calendar"
            />
            <div>
              <label for="ac-sub" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Subtitle</label
              >
              <textarea
                id="ac-sub"
                v-model="draft.activityCalendar.subtitle"
                rows="2"
                class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
          </div>
        </Card>

        <Card>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Calendar Rows</h3>
            <Button variant="secondary" size="sm" @click="addCalendarRow">
              <template #icon-left><Icon icon="mdi:plus" /></template>
              Add Row
            </Button>
          </div>
          <div class="flex flex-col gap-3">
            <div
              v-for="(row, i) in draft.activityCalendar.rows"
              :key="row.id"
              class="relative grid grid-cols-3 gap-3 rounded-lg border border-gray-200 p-3"
            >
              <Input v-model="row.day" label="Day" placeholder="Every Sunday" />
              <Input v-model="row.activity" label="Activity" placeholder="Bible Class" />
              <Input v-model="row.time" label="Time" placeholder="7:30 AM" />
              <button
                class="absolute right-2 top-2 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                :aria-label="`Remove calendar row ${i + 1}`"
                @click="removeCalendarRow(i)"
              >
                <Icon icon="mdi:close" class="text-sm" />
              </button>
            </div>
            <p v-if="!draft.activityCalendar.rows.length" class="text-center text-sm text-gray-400">
              No calendar rows added yet.
            </p>
          </div>
        </Card>

        <div class="flex justify-end">
          <Button :loading="store.saving" @click="save">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save Settings
          </Button>
        </div>
      </div>

      <!-- ── Worship This Sunday ──────────────────────────────────────── -->
      <div v-else-if="activeTab === 'sunday'" key="sunday" class="flex max-w-3xl flex-col gap-5">
        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Section Header</h3>
          <div class="flex flex-col gap-4">
            <Input
              v-model="draft.worshipThisSunday.eyebrow"
              label="Eyebrow"
              placeholder="Join Us"
            />
            <Input
              v-model="draft.worshipThisSunday.heading"
              label="Heading"
              placeholder="Worship With Us This Sunday"
            />
          </div>
        </Card>

        <Card>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Service Card</h3>
          <div class="flex flex-col gap-4">
            <Input
              v-model="draft.worshipThisSunday.cardChurchName"
              label="Church Name"
              placeholder="Church of Christ"
            />
            <Input
              v-model="draft.worshipThisSunday.cardChurchSubtitle"
              label="Subtitle"
              placeholder="7b Esa Atan Extension"
            />
            <Input
              v-model="draft.worshipThisSunday.mapAddress"
              label="Map Address"
              placeholder="7b Esa Atan, Ikot Ekpene, Akwa Ibom State, Nigeria"
            />
            <Input
              v-model="draft.worshipThisSunday.directionsUrl"
              label="Directions URL"
              placeholder="https://maps.google.com/maps?q=..."
            />
          </div>
        </Card>

        <Card>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Service Details</h3>
            <Button variant="secondary" size="sm" @click="addSundayDetail">
              <template #icon-left><Icon icon="mdi:plus" /></template>
              Add Detail
            </Button>
          </div>
          <div class="flex flex-col gap-3">
            <div
              v-for="(detail, i) in draft.worshipThisSunday.details"
              :key="detail.id"
              class="relative grid grid-cols-3 gap-3 rounded-lg border border-gray-200 p-3"
            >
              <Input
                v-model="detail.icon"
                label="Icon (Iconify name)"
                placeholder="mdi:calendar-outline"
              />
              <Input
                v-model="detail.primary"
                label="Primary Text"
                placeholder="Every Sunday Morning"
              />
              <Input
                v-model="detail.secondary"
                label="Secondary Text"
                placeholder="Weekly worship service"
              />
              <button
                class="absolute right-2 top-2 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                :aria-label="`Remove detail ${i + 1}`"
                @click="removeSundayDetail(i)"
              >
                <Icon icon="mdi:close" class="text-sm" />
              </button>
            </div>
            <p
              v-if="!draft.worshipThisSunday.details.length"
              class="text-center text-sm text-gray-400"
            >
              No service details added yet.
            </p>
          </div>
        </Card>

        <div class="flex justify-end">
          <Button :loading="store.saving" @click="save">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save Settings
          </Button>
        </div>
      </div>

      <!-- ── Leaders ──────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'leaders'" key="leaders" class="flex max-w-3xl flex-col gap-5">
        <Card>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Church Leaders</h3>
            <Button variant="secondary" size="sm" @click="addLeader">
              <template #icon-left><Icon icon="mdi:plus" /></template>
              Add Leader
            </Button>
          </div>

          <div class="flex flex-col gap-3">
            <div
              v-for="(leader, i) in draft.leaders"
              :key="leader.id"
              class="relative grid grid-cols-[auto_1fr_1fr] items-start gap-3 rounded-lg border border-gray-200 p-3"
            >
              <ImageUpload v-model="leader.avatar" folder="congregation/leaders" shape="circle" />
              <Input v-model="leader.name" label="Name" placeholder="Akpan Lincoln" />
              <div>
                <label
                  :for="`role-${leader.id}`"
                  class="mb-1.5 block text-sm font-medium text-gray-700"
                  >Role</label
                >
                <select
                  :id="`role-${leader.id}`"
                  v-model="leader.role"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>Elder</option>
                  <option>Deacon</option>
                  <option>Minister</option>
                  <option>Evangelist</option>
                  <option>Youth Leader</option>
                </select>
              </div>
              <button
                class="absolute right-2 top-2 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                :aria-label="`Remove ${leader.name || 'leader'}`"
                @click="removeLeader(i)"
              >
                <Icon icon="mdi:close" class="text-sm" />
              </button>
            </div>
            <p v-if="!draft.leaders.length" class="py-4 text-center text-sm text-gray-400">
              No leaders added yet.
            </p>
          </div>
        </Card>

        <div class="flex justify-end">
          <Button :loading="store.saving" @click="save">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save Settings
          </Button>
        </div>
      </div>

      <!-- ── Gallery ──────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'gallery'" key="gallery" class="flex max-w-3xl flex-col gap-5">
        <Card>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Photo Gallery</h3>
            <Button variant="secondary" size="sm" @click="addPhoto">
              <template #icon-left><Icon icon="mdi:plus" /></template>
              Add Photo
            </Button>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div
              v-for="(img, i) in draft.galleryPhotos"
              :key="img.id"
              class="relative flex flex-col gap-2 rounded-lg border border-gray-200 p-3"
            >
              <ImageUpload v-model="img.src" folder="congregation/gallery" compact />
              <Input
                v-model="img.alt"
                label="Caption / Alt text"
                placeholder="Sunday worship service"
              />
              <button
                class="absolute right-2 top-2 rounded bg-white/80 p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                :aria-label="`Remove gallery item ${i + 1}`"
                @click="removePhoto(i)"
              >
                <Icon icon="mdi:close" class="text-sm" />
              </button>
            </div>
          </div>
          <p v-if="!draft.galleryPhotos.length" class="py-4 text-center text-sm text-gray-400">
            No photos added yet.
          </p>
        </Card>

        <div class="flex justify-end">
          <Button :loading="store.saving" @click="save">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save Settings
          </Button>
        </div>
      </div>

      <!-- ── Roles ────────────────────────────────────────────────────── -->
      <div v-else key="roles">
        <RolesPanel />
      </div>
    </Transition>
  </div>
</template>
