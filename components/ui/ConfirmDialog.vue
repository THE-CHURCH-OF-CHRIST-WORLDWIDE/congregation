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
    <p v-if="confirmStore.request?.message" class="text-[15px] leading-relaxed text-ink-muted">
      {{ confirmStore.request.message }}
    </p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button
          ref="cancelButton"
          type="button"
          class="inline-flex min-h-10 items-center rounded-md border border-rule-strong bg-surface px-4 text-sm font-semibold text-ink shadow-xs transition-colors hover:bg-surface-muted"
          @click="confirmStore.settle(false)"
        >
          {{ confirmStore.request?.cancelLabel }}
        </button>
        <button
          type="button"
          :class="[
            'inline-flex min-h-10 items-center rounded-md px-4 text-sm font-semibold text-on-primary shadow-xs transition-[background-color,filter]',
            confirmStore.request?.variant === 'danger'
              ? 'bg-error hover:brightness-95'
              : 'bg-primary hover:bg-primary-hover',
          ]"
          @click="confirmStore.settle(true)"
        >
          {{ confirmStore.request?.confirmLabel }}
        </button>
      </div>
    </template>
  </Modal>
</template>
