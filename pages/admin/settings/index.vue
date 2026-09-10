<script setup lang="ts">
import { NAV_VISIBILITY_ITEMS } from '~/constants'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Settings', description: 'Church admin settings.' })

const { setHeader } = usePageHeader()
const authStore = useAuthStore()
const rolesStore = useRolesStore()
const store = useChurchSettingsStore()

/**
 * The account card used to print a hardcoded "Church Administrator" for everyone. Show the role
 * the account actually carries — it is what Firestore rules enforce, so it is the honest answer
 * to "what can I do here?".
 */
const accountRole = computed(() => {
  if (!authStore.roleLoaded) return 'Checking role…'
  if (!authStore.roleId) return 'No role assigned'
  return rolesStore.roleById(authStore.roleId)?.name ?? authStore.roleId
})

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
  | 'congregations'
  | 'events'
  | 'navigation'
  | 'roles'
  | 'audit'
const activeTab = ref<Tab>('general')

interface NavItem {
  label: string
  value: Tab
  icon: string
}

// Grouped by what each section actually configures — the congregation itself, then the
// two public pages that have editable content, then access control.
const baseNavGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Organisation',
    items: [
      { label: 'General', value: 'general', icon: 'mdi:office-building-outline' },
      { label: 'Congregations', value: 'congregations', icon: 'mdi:map-marker-multiple-outline' },
      { label: 'Leaders', value: 'leaders', icon: 'mdi:account-tie-outline' },
    ],
  },
  {
    label: 'Home Page',
    items: [
      { label: 'Hero & Sections', value: 'homepage', icon: 'mdi:home-outline' },
      { label: 'Minister', value: 'minister', icon: 'mdi:account-voice' },
      { label: 'Live Worship', value: 'live', icon: 'mdi:broadcast' },
      { label: 'Upcoming Events', value: 'events', icon: 'mdi:calendar-star' },
      { label: 'Gallery', value: 'gallery', icon: 'mdi:image-multiple-outline' },
    ],
  },
  {
    label: 'About Page',
    items: [
      { label: 'About Hero', value: 'about', icon: 'mdi:image-text' },
      { label: 'History', value: 'history', icon: 'mdi:history' },
      { label: 'Worship Activities', value: 'worship', icon: 'mdi:hands-pray' },
      { label: 'Activity Calendar', value: 'calendar', icon: 'mdi:calendar-month-outline' },
      { label: 'Worship This Sunday', value: 'sunday', icon: 'mdi:church' },
    ],
  },
  {
    label: 'Navigation',
    items: [{ label: 'Public Nav Menu', value: 'navigation', icon: 'mdi:menu-open' }],
  },
  {
    label: 'Access',
    items: [{ label: 'Roles & Permissions', value: 'roles', icon: 'mdi:shield-account-outline' }],
  },
]

/**
 * Roles, accounts and the audit log are Super-Admin-only, enforced by Firestore rules. Hiding the
 * whole Access group keeps the UI honest about that instead of offering panels that would fail to
 * load — every other group on this page is public site content, which is why a Content Editor can
 * be given Settings without being handed account management.
 */
const navGroups = computed(() =>
  baseNavGroups
    .filter((group) => group.label !== 'Access' || authStore.isSuperAdmin)
    .map((group) =>
      group.label === 'Access'
        ? {
            ...group,
            items: [
              ...group.items,
              { label: 'Audit Log', value: 'audit' as Tab, icon: 'mdi:history' },
            ],
          }
        : group
    )
)

// If a Super Admin loses that role while sitting on one of those panels, don't leave them on a
// dead tab.
watch(
  () => authStore.isSuperAdmin,
  (allowed) => {
    if (!allowed && (activeTab.value === 'audit' || activeTab.value === 'roles')) {
      activeTab.value = 'general'
    }
  }
)

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

/**
 * The draft is shared by every panel, so "is anything unsaved?" is a page-level question.
 * Comparing serialised copies is cheap next to a Firestore write and avoids hand-maintaining a
 * dirty flag across fourteen panels' worth of fields.
 */
const isDirty = computed(() => JSON.stringify(draft.value) !== JSON.stringify(store.settings))

const errors = ref<{ name?: string; email?: string }>({})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Only fields with a real constraint. Everything else is free text by design. */
function validate(): boolean {
  const next: typeof errors.value = {}
  if (!draft.value.name?.trim()) next.name = 'The church name appears across the public site'
  const email = draft.value.email?.trim()
  if (email && !EMAIL_RE.test(email)) next.email = 'Enter a valid email address'
  errors.value = next
  if (Object.keys(next).length) {
    useToast().error('Check the highlighted fields')
    activeTab.value = 'general'
    return false
  }
  return true
}

async function save() {
  if (!validate()) return
  try {
    await store.save({ ...draft.value })
  } catch {
    // Store already surfaces an error toast.
  }
}

function discardChanges() {
  draft.value = cloneSettings(store.settings)
  errors.value = {}
}

// ⌘S / Ctrl+S is what people reach for in a form this long.
function onSaveShortcut(event: KeyboardEvent) {
  if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 's') return
  event.preventDefault()
  if (isDirty.value && !store.saving) void save()
}

/** Closing the tab mid-edit should cost a browser prompt, not the work. */
function onBeforeUnload(event: BeforeUnloadEvent) {
  if (!isDirty.value) return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  window.addEventListener('keydown', onSaveShortcut)
  window.addEventListener('beforeunload', onBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onSaveShortcut)
  window.removeEventListener('beforeunload', onBeforeUnload)
})

// Navigating away inside the SPA does not trigger beforeunload, so guard that too.
onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  return window.confirm('You have unsaved settings. Leave without saving?')
})

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

// ── Congregations helpers (landing page "Find a Congregation") ────────────
function addCongregation() {
  draft.value.congregations.push({
    id: `cg${Date.now()}`,
    name: '',
    address: '',
    serviceTime: '',
    city: '',
  })
}
function removeCongregation(i: number) {
  draft.value.congregations.splice(i, 1)
}

// ── Homepage events helpers ───────────────────────────────────────────────
const EVENT_COLORS = [
  { label: 'Blue', value: 'bg-blue-500' },
  { label: 'Green', value: 'bg-green-500' },
  { label: 'Purple', value: 'bg-purple-500' },
  { label: 'Amber', value: 'bg-amber-500' },
  { label: 'Red', value: 'bg-red-500' },
]
function addHomepageEvent() {
  draft.value.homepageEvents.push({
    id: `ev${Date.now()}`,
    title: '',
    day: '',
    month: '',
    location: '',
    time: '',
    colorClass: 'bg-blue-500',
  })
}
function removeHomepageEvent(i: number) {
  draft.value.homepageEvents.splice(i, 1)
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
  <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
    <SettingsNav v-model="activeTab" :groups="navGroups" />

    <div class="min-w-0 flex-1">
      <Transition name="fade" mode="out-in">
        <!-- ── General ──────────────────────────────────────────────────── -->
        <div v-if="activeTab === 'general'" key="general" class="flex max-w-3xl flex-col gap-5">
          <SettingsSection
            title="Church information"
            description="Used across the public site — the footer, the contact section, the embedded map, and the admin sidebar."
          >
            <!-- Short fields pair up; long ones span, so no input is wider than its content needs. -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <Input
                  v-model="draft.name"
                  label="Church name"
                  required
                  :error="errors.name"
                  placeholder="The Church of Christ"
                />
              </div>
              <div class="sm:col-span-2">
                <Input
                  v-model="draft.address"
                  label="Address"
                  placeholder="7B Esa Atan Ext. Ikot Ekpene"
                  helper="Also drives the map on the About page and the contact section."
                />
              </div>
              <Input
                v-model="draft.phone"
                label="Phone number"
                type="tel"
                placeholder="(+234) 900 000 0000"
              />
              <Input
                v-model="draft.email"
                label="Email address"
                type="email"
                :error="errors.email"
                placeholder="info@churchofchrist.org"
              />
            </div>
          </SettingsSection>

          <SettingsSection
            title="Your account"
            description="The signed-in account and the role it carries. Roles are managed under Access."
          >
            <div class="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <Avatar :name="authStore.user?.email ?? 'Admin'" size="lg" />
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-gray-900">
                  {{ authStore.user?.email ?? '—' }}
                </p>
                <p class="text-xs text-gray-500">{{ accountRole }}</p>
              </div>
              <span
                v-if="authStore.roleLoaded && !authStore.isStaff"
                class="ml-auto shrink-0 rounded bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700"
              >
                Cannot save changes
              </span>
            </div>
          </SettingsSection>
        </div>

        <!-- ── Homepage (Hero + Activities) ────────────────────────────── -->
        <div
          v-else-if="activeTab === 'homepage'"
          key="homepage"
          class="flex max-w-2xl flex-col gap-5"
        >
          <SettingsSection
            title="Hero Section"
            description="The first thing visitors see on the landing page — background photo, headline and call-to-action buttons."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Church Activities"
            description="Service times listed inside the hero card on the landing page."
            density="sm"
          >
            <template #actions>
              <Button variant="secondary" size="sm" @click="addActivity">
                <template #icon-left><Icon icon="mdi:plus" /></template>
                Add Activity
              </Button>
            </template>
            <SettingsRepeater
              :items="draft.activities"
              :columns="['Activity name', 'Time range', 'Frequency']"
              grid-class="grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto]"
              empty="No activities added yet."
              noun="activity"
              @remove="removeActivity"
            >
              <template #default="{ item: act }">
                <Input
                  v-model="act.name"
                  label="Activity name"
                  label-class="sm:sr-only"
                  placeholder="Sunday Worship Service"
                />
                <Input
                  v-model="act.timeRange"
                  label="Time range"
                  label-class="sm:sr-only"
                  placeholder="9:00 am - 12:00 noon"
                />
                <Input
                  v-model="act.frequency"
                  label="Frequency"
                  label-class="sm:sr-only"
                  placeholder="Every Sunday"
                />
              </template>
            </SettingsRepeater>
          </SettingsSection>
        </div>

        <!-- ── Minister Welcome ─────────────────────────────────────────── -->
        <div
          v-else-if="activeTab === 'minister'"
          key="minister"
          class="flex max-w-2xl flex-col gap-5"
        >
          <SettingsSection
            title="Minister Details"
            description="The minister's name, title and photo in the welcome section of the landing page."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Congregation Background Photos"
            description="Shown behind the minister's welcome letter on the landing page."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Welcome Letter"
            description="The letter beside the minister's photo on the landing page."
          >
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
          </SettingsSection>
        </div>

        <!-- ── Live Worship ─────────────────────────────────────────────── -->
        <div v-else-if="activeTab === 'live'" key="live" class="flex max-w-2xl flex-col gap-5">
          <SettingsSection
            title="Live Worship Section"
            description="The live-stream teaser on the landing page, above the sermons."
          >
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
          </SettingsSection>
        </div>

        <!-- ── About Hero ───────────────────────────────────────────────── -->
        <div v-else-if="activeTab === 'about'" key="about" class="flex max-w-2xl flex-col gap-5">
          <SettingsSection
            title="About Page Hero"
            description="The banner across the top of the About page."
          >
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
          </SettingsSection>
        </div>

        <!-- ── History ──────────────────────────────────────────────────── -->
        <div
          v-else-if="activeTab === 'history'"
          key="history"
          class="flex max-w-3xl flex-col gap-5"
        >
          <SettingsSection
            title="Headings"
            description="Eyebrow and heading for the history card on the About page."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Narrative"
            description="The opening paragraphs of the congregation's history on the About page."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Founders / Early Leaders"
            description="Listed beneath the history narrative on the About page."
            density="sm"
          >
            <template #actions>
              <Button variant="secondary" size="sm" @click="addFounder">
                <template #icon-left><Icon icon="mdi:plus" /></template>
                Add Founder
              </Button>
            </template>
            <Input
              v-model="draft.aboutHistory.foundersHeading"
              label="Section Heading"
              placeholder="Founding members and early leaders include:"
            />
            <div class="mt-4 flex flex-col gap-2">
              <div
                v-for="(founder, i) in draft.aboutHistory.founders"
                :key="founder.id"
                class="relative flex items-center gap-2 rounded-lg border border-gray-200 p-2 pr-9"
              >
                <Input
                  v-model="founder.name"
                  class="flex-1"
                  placeholder="Bro. Akpan Ekom — Elder"
                />
                <button
                  class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  :aria-label="`Remove founder ${i + 1}`"
                  @click="removeFounder(i)"
                >
                  <Icon icon="mdi:close" class="text-sm" />
                </button>
              </div>
              <p
                v-if="!draft.aboutHistory.founders.length"
                class="text-center text-sm text-gray-400"
              >
                No founders added yet.
              </p>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Meeting Schedule"
            description="The service times table inside the history card."
            density="sm"
          >
            <template #actions>
              <Button variant="secondary" size="sm" @click="addHistoryScheduleRow">
                <template #icon-left><Icon icon="mdi:plus" /></template>
                Add Row
              </Button>
            </template>
            <Input
              v-model="draft.aboutHistory.scheduleHeading"
              label="Section Heading"
              placeholder="Regular Meeting Schedule:"
            />
            <div class="mt-4 flex flex-col gap-2">
              <div
                v-for="(row, i) in draft.aboutHistory.schedule"
                :key="i"
                class="relative grid grid-cols-[2fr_1fr_auto] gap-2 rounded-lg border border-gray-200 p-2 pr-9"
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
          </SettingsSection>

          <SettingsSection
            title="Signature"
            description="The sign-off at the end of the history card."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Corner Decorative Images"
            description="Decorative images in the corners of the history card."
          >
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
          </SettingsSection>
        </div>

        <!-- ── Worship Activities ───────────────────────────────────────── -->
        <div
          v-else-if="activeTab === 'worship'"
          key="worship"
          class="flex max-w-3xl flex-col gap-5"
        >
          <SettingsSection
            title="Section Header"
            description="Eyebrow, heading and subtitle for the worship activities section on the About page."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Activities"
            description="Each act of worship listed on the About page, with its scripture reference."
            density="sm"
          >
            <template #actions>
              <Button variant="secondary" size="sm" @click="addWorshipActivity">
                <template #icon-left><Icon icon="mdi:plus" /></template>
                Add Activity
              </Button>
            </template>
            <SettingsRepeater
              :items="draft.worshipActivities.items"
              :columns="['Name', 'Icon', 'Scripture']"
              grid-class="grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto]"
              empty="No worship activities added yet."
              noun="activity"
              @remove="removeWorshipActivity"
            >
              <template #default="{ item }">
                <Input
                  v-model="item.name"
                  label="Name"
                  label-class="sm:sr-only"
                  placeholder="Prayer"
                />
                <Input
                  v-model="item.icon"
                  label="Icon (Iconify name)"
                  label-class="sm:sr-only"
                  placeholder="mdi:hands-pray"
                />
                <Input
                  v-model="item.scripture"
                  label="Scripture"
                  label-class="sm:sr-only"
                  placeholder="1 Thessalonians 5:17"
                />
              </template>
            </SettingsRepeater>
          </SettingsSection>
        </div>

        <!-- ── Activity Calendar ────────────────────────────────────────── -->
        <div
          v-else-if="activeTab === 'calendar'"
          key="calendar"
          class="flex max-w-3xl flex-col gap-5"
        >
          <SettingsSection
            title="Section Header"
            description="Eyebrow, heading and subtitle for the activity calendar on the About page."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Calendar Rows"
            description="One row per recurring activity in the calendar table on the About page."
            density="sm"
          >
            <template #actions>
              <Button variant="secondary" size="sm" @click="addCalendarRow">
                <template #icon-left><Icon icon="mdi:plus" /></template>
                Add Row
              </Button>
            </template>
            <SettingsRepeater
              :items="draft.activityCalendar.rows"
              :columns="['Day', 'Activity', 'Time']"
              grid-class="grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto]"
              empty="No calendar rows added yet."
              noun="calendar row"
              @remove="removeCalendarRow"
            >
              <template #default="{ item: row }">
                <Input
                  v-model="row.day"
                  label="Day"
                  label-class="sm:sr-only"
                  placeholder="Every Sunday"
                />
                <Input
                  v-model="row.activity"
                  label="Activity"
                  label-class="sm:sr-only"
                  placeholder="Bible Class"
                />
                <Input
                  v-model="row.time"
                  label="Time"
                  label-class="sm:sr-only"
                  placeholder="7:30 AM"
                />
              </template>
            </SettingsRepeater>
          </SettingsSection>
        </div>

        <!-- ── Worship This Sunday ──────────────────────────────────────── -->
        <div v-else-if="activeTab === 'sunday'" key="sunday" class="flex max-w-3xl flex-col gap-5">
          <SettingsSection
            title="Section Header"
            description="Eyebrow, heading and subtitle for the “Worship This Sunday” section on the About page."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Service Card"
            description="The service card and map in the Worship This Sunday section."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Service Details"
            description="The rows of detail listed beside the map on the About page."
            density="sm"
          >
            <template #actions>
              <Button variant="secondary" size="sm" @click="addSundayDetail">
                <template #icon-left><Icon icon="mdi:plus" /></template>
                Add Detail
              </Button>
            </template>
            <SettingsRepeater
              :items="draft.worshipThisSunday.details"
              :columns="['Icon', 'Primary text', 'Secondary text']"
              grid-class="grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto]"
              empty="No service details added yet."
              noun="detail"
              @remove="removeSundayDetail"
            >
              <template #default="{ item: detail }">
                <Input
                  v-model="detail.icon"
                  label="Icon (Iconify name)"
                  label-class="sm:sr-only"
                  placeholder="mdi:calendar-outline"
                />
                <Input
                  v-model="detail.primary"
                  label="Primary text"
                  label-class="sm:sr-only"
                  placeholder="Every Sunday Morning"
                />
                <Input
                  v-model="detail.secondary"
                  label="Secondary text"
                  label-class="sm:sr-only"
                  placeholder="Weekly worship service"
                />
              </template>
            </SettingsRepeater>
          </SettingsSection>
        </div>

        <!-- ── Leaders ──────────────────────────────────────────────────── -->
        <div
          v-else-if="activeTab === 'leaders'"
          key="leaders"
          class="flex max-w-3xl flex-col gap-5"
        >
          <SettingsSection
            title="Church Leaders"
            description="The leaders grid on the About page."
            density="sm"
          >
            <template #actions>
              <Button variant="secondary" size="sm" @click="addLeader">
                <template #icon-left><Icon icon="mdi:plus" /></template>
                Add Leader
              </Button>
            </template>

            <div class="flex flex-col gap-3">
              <div
                v-for="(leader, i) in draft.leaders"
                :key="leader.id"
                class="relative grid grid-cols-[auto_1fr_1fr] items-start gap-3 rounded-lg border border-gray-200 p-3 pr-9"
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
          </SettingsSection>
        </div>

        <!-- ── Gallery ──────────────────────────────────────────────────── -->
        <div
          v-else-if="activeTab === 'gallery'"
          key="gallery"
          class="flex max-w-3xl flex-col gap-5"
        >
          <SettingsSection
            title="Photo Gallery"
            description="Photos in the gallery strip on the landing page."
            density="sm"
          >
            <template #actions>
              <Button variant="secondary" size="sm" @click="addPhoto">
                <template #icon-left><Icon icon="mdi:plus" /></template>
                Add Photo
              </Button>
            </template>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                v-for="(img, i) in draft.galleryPhotos"
                :key="img.id"
                class="relative flex flex-col gap-2 rounded-lg border border-gray-200 p-3 pr-9"
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
          </SettingsSection>
        </div>

        <!-- ── Congregations ────────────────────────────────────────────── -->
        <div
          v-else-if="activeTab === 'congregations'"
          key="congregations"
          class="flex max-w-3xl flex-col gap-5"
        >
          <SettingsSection
            title="Sister Congregations"
            description="Listed by the “Find a Congregation Near You” search on the landing page."
            density="sm"
          >
            <template #actions>
              <Button variant="secondary" size="sm" @click="addCongregation">
                <template #icon-left><Icon icon="mdi:plus" /></template>
                Add Congregation
              </Button>
            </template>

            <div class="flex flex-col gap-3">
              <div
                v-for="(cg, i) in draft.congregations"
                :key="cg.id"
                class="relative grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-3 pr-9 sm:grid-cols-2"
              >
                <Input v-model="cg.name" label="Name" placeholder="Church of Christ, Uyo Central" />
                <Input v-model="cg.city" label="City" placeholder="Uyo" />
                <Input v-model="cg.address" label="Address" placeholder="14 Oron Road, Uyo" />
                <Input v-model="cg.serviceTime" label="Service Time" placeholder="Sun 8:30 AM" />
                <button
                  class="absolute right-2 top-2 rounded bg-white/80 p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  :aria-label="`Remove congregation ${i + 1}`"
                  @click="removeCongregation(i)"
                >
                  <Icon icon="mdi:close" class="text-sm" />
                </button>
              </div>
            </div>
            <p v-if="!draft.congregations.length" class="py-4 text-center text-sm text-gray-400">
              No congregations added yet.
            </p>
          </SettingsSection>
        </div>

        <!-- ── Upcoming Events (landing page) ───────────────────────────── -->
        <div v-else-if="activeTab === 'events'" key="events" class="flex max-w-3xl flex-col gap-5">
          <SettingsSection
            title="Upcoming Events"
            description="The event strip on the landing page. Separate from the full Events page."
            density="sm"
          >
            <template #actions>
              <Button variant="secondary" size="sm" @click="addHomepageEvent">
                <template #icon-left><Icon icon="mdi:plus" /></template>
                Add Event
              </Button>
            </template>

            <div class="flex flex-col gap-3">
              <div
                v-for="(ev, i) in draft.homepageEvents"
                :key="ev.id"
                class="relative rounded-lg border border-gray-200 p-3"
              >
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input v-model="ev.title" label="Title" placeholder="Annual Youth Convention" />
                  <Input v-model="ev.location" label="Location" placeholder="Church Auditorium" />
                </div>
                <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Input v-model="ev.day" label="Day" placeholder="18" />
                  <Input v-model="ev.month" label="Month" placeholder="APR" />
                  <Input v-model="ev.time" label="Time" placeholder="9:00 AM – 5:00 PM" />
                  <EditField label="Accent Colour">
                    <select v-model="ev.colorClass">
                      <option v-for="c in EVENT_COLORS" :key="c.value" :value="c.value">
                        {{ c.label }}
                      </option>
                    </select>
                  </EditField>
                </div>
                <button
                  class="absolute right-2 top-2 rounded bg-white/80 p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  :aria-label="`Remove event ${i + 1}`"
                  @click="removeHomepageEvent(i)"
                >
                  <Icon icon="mdi:close" class="text-sm" />
                </button>
              </div>
            </div>
            <p v-if="!draft.homepageEvents.length" class="py-4 text-center text-sm text-gray-400">
              No events added yet.
            </p>
          </SettingsSection>
        </div>

        <!-- ── Public Navigation ────────────────────────────────────────── -->
        <div
          v-else-if="activeTab === 'navigation'"
          key="navigation"
          class="flex max-w-2xl flex-col gap-5"
        >
          <SettingsSection
            title="Public Nav Menu"
            description="Choose which links appear on the public site's navigation. Turning an item off also blocks its page directly — visiting the URL shows a 404, not just a hidden link."
          >
            <div class="flex flex-col divide-y divide-gray-100">
              <label
                v-for="item in NAV_VISIBILITY_ITEMS"
                :key="item.key"
                class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ item.label }}</p>
                  <p class="text-xs text-gray-500">
                    {{
                      item.key === 'home'
                        ? "Doesn't 404 — visiting / instead lands on the first other enabled page"
                        : item.path
                          ? `Blocks ${item.path} when off`
                          : 'Removes the link only — it points to a section on the home page'
                    }}
                  </p>
                </div>
                <input
                  v-model="draft.navVisibility[item.key]"
                  type="checkbox"
                  class="attendance-check shrink-0"
                  :aria-label="`Show ${item.label} in navigation`"
                />
              </label>
            </div>
          </SettingsSection>
        </div>

        <!-- ── Roles & audit (Super Admin only) ─────────────────────────
             Guarded on the role as well as the tab. The nav no longer offers these to anyone
             else, so this is unreachable — but these panels list other people's accounts and
             email addresses, and "unreachable" is a weaker promise than "cannot render". -->
        <div v-else-if="activeTab === 'roles' && authStore.isSuperAdmin" key="roles">
          <RolesPanel />
        </div>

        <div v-else-if="activeTab === 'audit' && authStore.isSuperAdmin" key="audit">
          <AuditLogPanel />
        </div>
      </Transition>

      <!-- One save affordance for every panel, shown only while there is something to save.
           Roles & Permissions writes directly and has its own controls, so it opts out. -->
      <SettingsSaveBar
        v-if="activeTab !== 'roles' && activeTab !== 'audit'"
        :dirty="isDirty"
        :saving="store.saving"
        @save="save"
        @discard="discardChanges"
      />
    </div>
  </div>
</template>
