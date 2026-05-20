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

type Tab = 'general' | 'homepage' | 'minister' | 'leaders' | 'gallery' | 'roles'
const activeTab = ref<Tab>('general')
const tabs = [
  { label: 'General', value: 'general' },
  { label: 'Homepage', value: 'homepage' },
  { label: 'Minister', value: 'minister' },
  { label: 'Leaders', value: 'leaders' },
  { label: 'Gallery', value: 'gallery' },
  { label: 'Roles & Permissions', value: 'roles' },
]

// ── Local draft (deep-cloned from store so edits don't live-update public pages until saved) ──
const draft = ref({
  ...store.settings,
  activities: [...store.settings.activities],
  leaders: store.settings.leaders.map((l) => ({ ...l })),
  galleryPhotos: store.settings.galleryPhotos.map((p) => ({ ...p })),
  congregationPhotos: [...store.settings.congregationPhotos],
})
watch(
  () => store.settings,
  (s) => {
    draft.value = {
      ...s,
      activities: [...s.activities],
      leaders: s.leaders.map((l) => ({ ...l })),
      galleryPhotos: s.galleryPhotos.map((p) => ({ ...p })),
      congregationPhotos: [...s.congregationPhotos],
    }
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
          <ImageUpload
            v-model="draft.heroImageUrl"
            label="Building Photo"
            folder="congregation/hero"
            helper="Shown as the full-width background image in the hero card."
          />
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
            <div>
              <label for="letter-p1" class="mb-1.5 block text-sm font-medium text-gray-700"
                >Paragraph 1 (opening, with drop-cap "D")</label
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
