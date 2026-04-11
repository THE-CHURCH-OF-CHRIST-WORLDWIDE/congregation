<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Settings', description: 'Church admin settings.' })

const { setHeader } = usePageHeader()
const authStore = useAuthStore()

onMounted(() => {
  setHeader('Settings', 'Manage church configuration and preferences')
})

const activeTab = ref<'general' | 'roles'>('general')
const tabs = [
  { label: 'General', value: 'general' },
  { label: 'Roles & Permissions', value: 'roles' },
]

const churchName = ref('Church of Christ')
const address = ref('7b Esa Atan, Ext. Ikot Ekpene')
const saved = ref(false)

function save() {
  saved.value = true
  setTimeout(() => { saved.value = false }, 2500)
}
</script>

<template>
  <div class="flex flex-col gap-5">

    <!-- Tab switcher -->
    <Tabs :tabs="tabs" v-model="activeTab" />

    <Transition name="fade" mode="out-in">

      <!-- ── General tab ──────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'general'" key="general" class="max-w-2xl flex flex-col gap-5">
        <Transition name="fade">
          <div
            v-if="saved"
            class="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2 text-green-700 text-sm"
          >
            <Icon icon="mdi:check-circle-outline" />
            Settings saved successfully!
          </div>
        </Transition>

        <!-- Church info -->
        <Card>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Church Information</h3>
          <div class="flex flex-col gap-4">
            <Input v-model="churchName" label="Church Name" placeholder="Church name" />
            <Input v-model="address" label="Congregation Address" placeholder="Physical address" />
          </div>
        </Card>

        <!-- Account -->
        <Card>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Account</h3>
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Avatar :name="authStore.user?.email ?? 'Admin'" size="lg" />
            <div>
              <p class="text-sm font-medium text-gray-900">{{ authStore.user?.email ?? 'admin@church.org' }}</p>
              <p class="text-xs text-gray-500">Church Administrator</p>
            </div>
          </div>
        </Card>

        <div class="flex justify-end">
          <Button @click="save">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save Settings
          </Button>
        </div>
      </div>

      <!-- ── Roles & Permissions tab ────────────────────────────────────────── -->
      <div v-else key="roles">
        <RolesPanel />
      </div>

    </Transition>
  </div>
</template>
