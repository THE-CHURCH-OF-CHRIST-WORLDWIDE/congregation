<script setup lang="ts">
/**
 * Host for `useConfirm()`. Mounted once in `app.vue`, alongside `ToastContainer`.
 *
 * Built on `Modal` so a confirmation looks like every other dialog in the app and inherits its
 * backdrop and Escape handling — both of which count as declining.
 */
import { useConfirmStore } from '~/stores/confirm'

const confirmStore = useConfirmStore()

const cancelButton = ref<HTMLButtonElement | null>(null)

/**
 * Focus lands on Cancel, not Confirm.
 *
 * Somebody who hits Return out of habit on a dialog they did not expect should decline it. For a
 * destructive action that is the difference between a wasted keystroke and a deleted record.
 */
watch(
  () => confirmStore.request,
  async (request) => {
    if (!request) return
    await nextTick()
    cancelButton.value?.focus()
  }
)
</script>

<template>
  <Modal
    :model-value="Boolean(confirmStore.request)"
    :title="confirmStore.request?.title ?? ''"
    size="sm"
    @update:model-value="confirmStore.settle(false)"
  >
    <p v-if="confirmStore.request?.message" class="text-sm text-gray-600">
      {{ confirmStore.request.message }}
    </p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button
          ref="cancelButton"
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none"
          @click="confirmStore.settle(false)"
        >
          {{ confirmStore.request?.cancelLabel }}
        </button>
        <button
          type="button"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none',
            confirmStore.request?.variant === 'danger'
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-[#0BA5EC] hover:bg-[#0992D2] focus:ring-[#0BA5EC]',
          ]"
          @click="confirmStore.settle(true)"
        >
          {{ confirmStore.request?.confirmLabel }}
        </button>
      </div>
    </template>
  </Modal>
</template>
