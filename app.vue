<!--
  Congregation - Open Source Church Management System
  Copyright (c) 2025 Mfonido Mark

  This file is part of Congregation.

  Congregation is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Congregation is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with Congregation.  If not, see https://www.gnu.org/licenses/.
-->

<script setup lang="ts">
const authStore = useAuthStore()
authStore.init()

// The browser tab icon follows the logo uploaded in Settings → Branding & Socials. The navbar and
// admin layout load settings, so this picks it up as soon as either has run.
const settingsStore = useChurchSettingsStore()
useHead(() => {
  const logo = settingsStore.settings.logoUrl
  return logo ? { link: [{ rel: 'icon', href: logo, key: 'favicon' }] } : {}
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ToastContainer />
  <!-- Host for `useConfirm()`. One instance for the whole app, like the toasts. -->
  <ConfirmDialog />
</template>
