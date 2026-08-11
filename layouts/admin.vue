<script setup lang="ts">
const route = useRoute()
const uiStore = useUiStore()
const authStore = useAuthStore()
const membersStore = useMembersStore()
const settingsStore = useChurchSettingsStore()
const messagesStore = useMessagesStore()
const { title, subtitle } = usePageHeader()

// The nominal roll backs the dashboard, youth, attendance and roles screens, the church
// settings name the congregation in the sidebar, and unread messages drive the inbox badge.
// Loaded once here rather than in each page; `load()` is a no-op if already done.
//
// Attendance is deliberately NOT loaded here, and neither is the label refresh that needs it:
// `fetchRecords` reads the whole collection, which grows as members × services × dates. That
// belongs on the two screens that already pay for it — see `autoSyncWhenReady`.
onMounted(() => {
  membersStore.load()
  settingsStore.load()
  // Backs the unread badge on the Messages item, so it is loaded from every admin page.
  messagesStore.load()
})

const { visible } = useRouteVisibility()

const allNavItems = [
  { label: 'Dashboard', to: '/admin', icon: 'mdi:view-dashboard-outline', exact: true },
  { label: 'Nominal Roll', to: '/admin/nominal-roll', icon: 'mdi:account-group-outline' },
  { label: 'Youth', to: '/admin/youth', icon: 'mdi:account-star-outline' },
  { label: 'Attendance', to: '/admin/attendance', icon: 'mdi:calendar-check-outline' },
  { label: 'Teachings', to: '/admin/teachings', icon: 'mdi:book-open-page-variant-outline' },
  { label: 'Events', to: '/admin/events', icon: 'mdi:calendar-outline' },
  { label: 'Finance', to: '/admin/finance', icon: 'mdi:cash-multiple' },
  { label: 'Messages', to: '/admin/messages', icon: 'mdi:email-outline', badge: 'messages' },
  { label: 'Settings', to: '/admin/settings', icon: 'mdi:cog-outline' },
]

/** Staging-only areas drop out of the sidebar in production; see STAGING_ONLY_ROUTES. */
const navItems = computed(() => visible(allNavItems))

function isActive(item: { to: string; exact?: boolean }) {
  if (item.exact) return route.path === item.to
  return route.path.startsWith(item.to)
}

const signingOut = ref(false)

async function logout() {
  signingOut.value = true
  try {
    await authStore.logout()
    await navigateTo('/login')
  } finally {
    signingOut.value = false
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Mobile overlay -->
    <div
      v-if="uiStore.mobileSidebarOpen"
      class="fixed inset-0 bg-black/40 z-20 lg:hidden"
      @click="uiStore.closeMobileSidebar()"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 flex flex-col z-30 transition-transform duration-200',
        uiStore.mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div class="px-4 pt-5 pb-4 border-b border-gray-100">
        <div class="flex items-center gap-2.5">
          <div
            class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0"
          >
            <Icon icon="mdi:church" class="text-white text-lg" />
          </div>
          <div class="min-w-0">
            <p class="font-bold text-gray-900 text-sm leading-tight">
              {{ settingsStore.settings.name }}
            </p>
            <p class="text-xs text-blue-600">Admin Dashboard</p>
          </div>
        </div>
        <div class="mt-3">
          <p class="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Congregation</p>
          <p class="text-xs text-gray-600 mt-0.5">{{ settingsStore.settings.address }}</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-0.5 sidebar-scroll overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
            isActive(item)
              ? 'bg-blue-50 text-blue-600 border-l-[3px] border-blue-600 pl-[9px]'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          ]"
          @click="uiStore.closeMobileSidebar()"
        >
          <Icon :icon="item.icon" class="text-[18px] flex-shrink-0" />
          {{ item.label }}
          <!-- Unread enquiries, so a message left overnight is visible from any page. -->
          <span
            v-if="item.badge === 'messages' && messagesStore.unreadCount"
            class="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white"
            :aria-label="`${messagesStore.unreadCount} unread`"
          >
            {{ messagesStore.unreadCount }}
          </span>
        </NuxtLink>
      </nav>

      <!-- Bottom section -->
      <div class="border-t border-gray-100 px-3 py-4">
        <p class="text-[10px] font-medium text-gray-400 uppercase tracking-wide px-3 mb-2">
          Section Title
        </p>
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <Icon icon="mdi:home-outline" class="text-[18px]" />
          Go to Home
        </NuxtLink>
        <button
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-60"
          :disabled="signingOut"
          @click="logout"
        >
          <Icon
            :icon="signingOut ? 'mdi:loading' : 'mdi:logout'"
            :class="['text-[18px]', signingOut && 'animate-spin']"
          />
          {{ signingOut ? 'Signing out…' : 'Logout' }}
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex flex-col flex-1 min-w-0 lg:ml-60">
      <!-- Topbar -->
      <header class="sticky top-0 z-10 bg-white border-b border-gray-200">
        <!-- Renders only outside production, so nobody edits the live congregation
             thinking they are in staging. -->
        <EnvironmentBanner />

        <!-- Firestore rules authorise writes from the account's `users/{uid}` role. Without
             one, every save is refused by the backend — say so plainly rather than letting
             each action fail on its own. -->
        <div
          v-if="authStore.roleLoaded && authStore.isAuthenticated && !authStore.isStaff"
          class="flex items-start gap-2 bg-red-50 px-4 py-2 text-xs text-red-800"
          role="alert"
        >
          <Icon icon="mdi:shield-alert-outline" class="mt-0.5 shrink-0 text-sm" />
          <p>
            This account has no role assigned, so saving anything will be refused. Ask a Super Admin
            to grant it a role.
          </p>
        </div>
        <div class="px-4 lg:px-6 py-4 flex items-start gap-3">
          <button
            class="lg:hidden mt-1 p-1.5 rounded-md hover:bg-gray-100 text-gray-500 shrink-0"
            aria-label="Toggle sidebar"
            @click="uiStore.toggleSidebar()"
          >
            <Icon icon="mdi:menu" class="text-xl" />
          </button>
          <div class="min-w-0 flex-1">
            <h1 class="font-serif text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {{ title }}
            </h1>
            <p v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
          </div>
          <!-- Page-level action slot. Pages teleport their CTA(s) here so the
               header stays a single source of truth for title + actions. -->
          <div id="admin-header-actions" class="shrink-0 self-center"></div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <div class="p-4 lg:p-6">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>
