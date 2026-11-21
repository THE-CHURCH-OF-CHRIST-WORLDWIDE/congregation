<script setup lang="ts">
/**
 * A clean, printable copy of the minutes — for signing, filing, or "Save as PDF" from the
 * browser's print dialog. No admin chrome, so what prints is only the document.
 */
import { formatMeetingDate } from '~/utils/businessMeetings'

definePageMeta({ layout: false, middleware: ['auth'] })

const route = useRoute()
const store = useBusinessMeetingsStore()
const settingsStore = useChurchSettingsStore()

const meeting = computed(() => store.byId(String(route.params.id)))
const ready = ref(false)

useSeoMeta({
  title: () =>
    meeting.value
      ? `Minutes — ${meeting.value.title} — ${formatMeetingDate(meeting.value.date)}`
      : 'Minutes',
})

function printNow() {
  window.print()
}

onMounted(async () => {
  await Promise.all([store.load(), settingsStore.load()])
  ready.value = true
  if (meeting.value) {
    // Give fonts a moment so the first print preview is not in a fallback face.
    await document.fonts?.ready
    printNow()
  }
})
</script>

<template>
  <div class="min-h-screen bg-surface-muted print:bg-white">
    <div
      class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-rule bg-surface px-4 py-2.5 print:hidden"
    >
      <NuxtLink
        :to="`/admin/business-meetings/${route.params.id}`"
        class="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <Icon icon="mdi:arrow-left" />
        Back to minutes
      </NuxtLink>
      <Button v-if="meeting" size="sm" @click="printNow">
        <template #icon-left><Icon icon="mdi:printer-outline" /></template>
        Print / Save as PDF
      </Button>
    </div>

    <LoadingState v-if="!ready" title="Preparing minutes…" />
    <EmptyState
      v-else-if="!meeting"
      icon="mdi:file-question-outline"
      title="Meeting not found"
      description="It may have been deleted, or you do not have access to it."
    />
    <div
      v-else
      class="mx-auto my-8 max-w-[60rem] bg-surface px-8 py-12 shadow-sm sm:px-14 print:m-0 print:max-w-none print:p-0 print:shadow-none"
    >
      <MinutesDocument :meeting="meeting" :church-name="settingsStore.settings.name" />
    </div>
  </div>
</template>

<style>
@media print {
  @page {
    margin: 18mm 16mm;
  }
}
</style>
