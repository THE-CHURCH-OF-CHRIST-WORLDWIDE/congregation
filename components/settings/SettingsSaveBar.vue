<script setup lang="ts">
/**
 * One save affordance for the whole Settings page.
 *
 * Every panel used to carry its own "Save Settings" button — thirteen of them, all writing the
 * same shared draft. That made it possible to edit General, switch to Minister, and have no idea
 * anything was still unsaved. This bar sticks to the bottom of the scroll area and appears only
 * when the draft differs from what is stored, so the state of your work is always visible and
 * there is exactly one place to act on it.
 */
defineProps<{
  dirty: boolean
  saving?: boolean
}>()

defineEmits<{ save: []; discard: [] }>()
</script>

<template>
  <Transition name="save-bar">
    <div
      v-if="dirty"
      class="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-gray-200 bg-white/90 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Announced politely: the bar appearing is information, not an interruption. -->
        <p class="flex items-center gap-2 text-sm text-gray-600" role="status" aria-live="polite">
          <span class="h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-hidden="true"></span>
          Unsaved changes
        </p>
        <div class="flex gap-2">
          <Button variant="secondary" :disabled="saving" @click="$emit('discard')">Discard</Button>
          <Button :loading="saving" @click="$emit('save')">
            <template #icon-left><Icon icon="mdi:content-save-outline" /></template>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.save-bar-enter-active,
.save-bar-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.save-bar-enter-from,
.save-bar-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
</style>
