<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Events', description: 'Church events management.' })

const { setHeader } = usePageHeader()

onMounted(() => {
  setHeader('Events', 'Manage church events and programmes')
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-24 text-center text-gray-400">
    <div class="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
      <Icon icon="mdi:calendar-outline" class="text-4xl text-blue-400" />
    </div>
    <h2 class="text-xl font-semibold text-gray-600 mb-2">Events Coming Soon</h2>
    <p class="text-sm text-gray-400 max-w-xs">
      The Events module is under development. You'll be able to manage church programmes, schedule
      events, and send notifications.
    </p>
  </div>
</template>
