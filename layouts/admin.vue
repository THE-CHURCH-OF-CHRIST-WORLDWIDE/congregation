<script setup lang="ts">
const route = useRoute()
const uiStore = useUiStore()
const authStore = useAuthStore()
const { title, subtitle } = usePageHeader()

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: 'mdi:view-dashboard-outline', exact: true },
  { label: 'Nominal Roll', to: '/admin/nominal-roll', icon: 'mdi:account-group-outline' },
  { label: 'Youth', to: '/admin/youth', icon: 'mdi:account-star-outline' },
  { label: 'Attendance', to: '/admin/attendance', icon: 'mdi:calendar-check-outline' },
  { label: 'Teachings', to: '/admin/teachings', icon: 'mdi:book-open-page-variant-outline' },
  { label: 'Events', to: '/admin/events', icon: 'mdi:calendar-outline' },
  { label: 'Finance', to: '/admin/finance', icon: 'mdi:cash-multiple' },
  { label: 'Settings', to: '/admin/settings', icon: 'mdi:cog-outline' },
]

function isActive(item: { to: string; exact?: boolean }) {
  if (item.exact) return route.path === item.to
  return route.path.startsWith(item.to)
}

async function logout() {
  await authStore.logout()
  await navigateTo('/login')
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
          <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:church" class="text-white text-lg" />
          </div>
          <div>
            <p class="font-bold text-gray-900 text-sm leading-tight">Church of Christ</p>
            <p class="text-xs text-blue-600">Admin Dashboard</p>
          </div>
        </div>
        <div class="mt-3">
          <p class="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Congregation</p>
          <p class="text-xs text-gray-600 mt-0.5">7b Esa Atan, Ext. Ikot Ekpene</p>
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
        </NuxtLink>
      </nav>

      <!-- Bottom section -->
      <div class="border-t border-gray-100 px-3 py-4">
        <p class="text-[10px] font-medium text-gray-400 uppercase tracking-wide px-3 mb-2">Section Title</p>
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <Icon icon="mdi:home-outline" class="text-[18px]" />
          Go to Home
        </NuxtLink>
        <button
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
          @click="logout"
        >
          <Icon icon="mdi:logout" class="text-[18px]" />
          Logout
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex flex-col flex-1 min-w-0 lg:ml-60">
      <!-- Topbar -->
      <header class="sticky top-0 z-10 h-14 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-3">
        <button
          class="lg:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
          aria-label="Toggle sidebar"
          @click="uiStore.toggleSidebar()"
        >
          <Icon icon="mdi:menu" class="text-xl" />
        </button>
        <div class="min-w-0">
          <h1 class="text-base font-semibold text-gray-900 truncate leading-tight">{{ title }}</h1>
          <p v-if="subtitle" class="text-xs text-gray-500 truncate">{{ subtitle }}</p>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <div class="p-4 lg:p-6">
          <slot ></slot>
        </div>
      </main>
    </div>
  </div>
</template>
