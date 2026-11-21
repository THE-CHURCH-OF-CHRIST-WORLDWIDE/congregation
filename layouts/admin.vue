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
  { label: 'Lectureship', to: '/admin/lectureship', icon: 'mdi:book-open-page-variant-outline' },
  {
    label: 'Business Meetings',
    to: '/admin/business-meetings',
    icon: 'mdi:clipboard-text-clock-outline',
  },
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
  <div class="flex h-screen overflow-hidden bg-canvas text-ink">
    <!-- Mobile overlay -->
    <Transition name="fade">
      <div
        v-if="uiStore.mobileSidebarOpen"
        class="fixed inset-0 z-20 bg-overlay lg:hidden"
        @click="uiStore.closeMobileSidebar()"
      ></div>
    </Transition>

    <!-- Sidebar: a forest rail with ivory type; the active item carries a champagne hairline -->
    <aside
      :class="[
        'field-forest fixed top-0 left-0 z-30 flex h-full w-64 flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:w-60',
        uiStore.mobileSidebarOpen
          ? 'translate-x-0 shadow-xl'
          : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Church identity -->
      <div class="border-b border-on-night/12 px-5 pt-6 pb-5">
        <div class="flex items-center gap-3">
          <div
            v-if="settingsStore.settings.logoUrl"
            class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface ring-1 ring-champagne/40"
          >
            <img
              :src="settingsStore.settings.logoUrl"
              alt=""
              class="h-full w-full object-contain"
            />
          </div>
          <div
            v-else
            class="flex size-10 shrink-0 items-center justify-center rounded-full border border-champagne/40"
          >
            <Icon icon="mdi:church" class="text-lg text-champagne" />
          </div>
          <div class="min-w-0">
            <p class="line-clamp-2 font-display text-[1.3125rem] leading-tight text-on-night">
              {{ settingsStore.settings.name }}
            </p>
            <p class="mt-0.5 text-xs font-medium text-on-night-muted">Admin Dashboard</p>
          </div>
        </div>
        <div class="mt-5 border-t border-on-night/12 pt-3">
          <p class="t-label text-champagne">Congregation</p>
          <p class="mt-1 text-xs leading-snug text-on-night-muted">
            {{ settingsStore.settings.address }}
          </p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-scroll flex-1 space-y-px overflow-y-auto px-3 py-4" aria-label="Admin">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :aria-current="isActive(item) ? 'page' : undefined"
          :class="[
            'group relative flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm transition-colors duration-200 lg:min-h-10',
            isActive(item)
              ? 'bg-on-night/12 font-semibold text-on-night'
              : 'font-medium text-on-night-muted hover:bg-on-night/5 hover:text-on-night',
          ]"
          @click="uiStore.closeMobileSidebar()"
        >
          <Icon
            :icon="item.icon"
            :class="[
              'shrink-0 text-[19px] transition-colors',
              isActive(item)
                ? 'text-champagne'
                : 'text-on-night-muted/80 group-hover:text-on-night',
            ]"
          />
          {{ item.label }}
          <!-- Unread enquiries, so a message left overnight is visible from any page. -->
          <span
            v-if="item.badge === 'messages' && messagesStore.unreadCount"
            class="num ml-auto min-w-6 rounded-sm bg-champagne px-1.5 py-0.5 text-center text-[11px] font-bold text-night"
            :aria-label="`${messagesStore.unreadCount} unread`"
          >
            {{ messagesStore.unreadCount }}
          </span>
        </NuxtLink>
      </nav>

      <!-- Bottom section -->
      <div class="border-t border-on-night/12 px-3 py-3">
        <p class="t-label mb-1 px-3 text-on-night-muted">Site</p>
        <NuxtLink
          to="/"
          class="group flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm font-medium text-on-night-muted transition-colors hover:bg-on-night/5 hover:text-on-night lg:min-h-10"
        >
          <Icon
            icon="mdi:home-outline"
            class="text-[19px] text-on-night-muted/80 group-hover:text-on-night"
          />
          Go to Home
        </NuxtLink>
        <button
          class="group flex min-h-11 w-full items-center gap-3 rounded-sm px-3 text-sm font-medium text-on-night-muted transition-colors hover:bg-on-night/5 hover:text-on-night disabled:opacity-60 lg:min-h-10"
          :disabled="signingOut"
          @click="logout"
        >
          <Icon
            :icon="signingOut ? 'mdi:loading' : 'mdi:logout'"
            :class="[
              'text-[19px] text-on-night-muted/80 group-hover:text-on-night',
              signingOut && 'animate-spin',
            ]"
          />
          {{ signingOut ? 'Signing out…' : 'Logout' }}
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex min-w-0 flex-1 flex-col lg:ml-60">
      <!-- Topbar -->
      <header class="sticky top-0 z-10 border-b border-rule bg-surface">
        <!-- Renders only outside production, so nobody edits the live congregation
             thinking they are in staging. -->
        <EnvironmentBanner />

        <!-- Firestore rules authorise writes from the account's `users/{uid}` role. Without
             one, every save is refused by the backend — say so plainly rather than letting
             each action fail on its own. -->
        <div
          v-if="authStore.roleLoaded && authStore.isAuthenticated && !authStore.isStaff"
          class="flex items-start gap-2 border-b border-error/20 bg-error-soft px-4 py-2.5 text-[13px] text-error lg:px-6"
          role="alert"
        >
          <Icon icon="mdi:shield-alert-outline" class="mt-0.5 shrink-0 text-base" />
          <p>
            This account has no role assigned, so saving anything will be refused. Ask a Super Admin
            to grant it a role.
          </p>
        </div>
        <div class="flex items-center gap-3 px-4 py-3.5 lg:px-8 lg:py-4">
          <button
            class="-ml-1 inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink lg:hidden"
            aria-label="Toggle sidebar"
            @click="uiStore.toggleSidebar()"
          >
            <Icon icon="mdi:menu" class="text-[22px]" />
          </button>
          <div class="margin-rule min-w-0 flex-1">
            <h1 class="truncate font-display text-[1.625rem] leading-tight text-ink sm:text-[2rem]">
              {{ title }}
            </h1>
            <p v-if="subtitle" class="mt-0.5 truncate text-sm text-ink-muted">{{ subtitle }}</p>
          </div>
          <!-- Page-level action slot. Pages teleport their CTA(s) here so the
               header stays a single source of truth for title + actions. -->
          <div id="admin-header-actions" class="shrink-0 self-center"></div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <div class="mx-auto w-full max-w-[1440px] p-4 sm:p-5 lg:p-8">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>
