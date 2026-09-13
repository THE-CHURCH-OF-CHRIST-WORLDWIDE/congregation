<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const authStore = useAuthStore()

const form = reactive({ current: '', next: '', confirm: '' })
const errors = reactive({ current: '', next: '', confirm: '' })
const showCurrent = ref(false)
const showNext = ref(false)
const saving = ref(false)

// A stale form from a previous open (or a previous failed attempt) should never carry over —
// the current password especially should not linger in memory once the dialog is dismissed.
function reset() {
  Object.assign(form, { current: '', next: '', confirm: '' })
  Object.assign(errors, { current: '', next: '', confirm: '' })
  showCurrent.value = false
  showNext.value = false
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) reset()
  }
)

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  errors.current = form.current ? '' : 'Enter your current password'
  errors.next = form.next.length >= 6 ? '' : 'Use at least 6 characters'
  errors.confirm = form.confirm === form.next ? '' : 'Passwords do not match'
  if (errors.current || errors.next || errors.confirm) return

  saving.value = true
  try {
    await authStore.changePassword(form.current, form.next)
    useToast().success('Password updated')
    close()
  } catch {
    useToast().error(authStore.error ?? 'Failed to update password')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Modal :model-value="modelValue" title="Change Password" size="sm" @update:model-value="close">
    <div class="flex flex-col gap-4">
      <Input
        v-model="form.current"
        label="Current password"
        :type="showCurrent ? 'text' : 'password'"
        :error="errors.current"
      >
        <template #icon-right>
          <button
            type="button"
            :aria-label="showCurrent ? 'Hide password' : 'Show password'"
            class="pointer-events-auto"
            @click="showCurrent = !showCurrent"
          >
            <Icon :icon="showCurrent ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" />
          </button>
        </template>
      </Input>

      <Input
        v-model="form.next"
        label="New password"
        :type="showNext ? 'text' : 'password'"
        placeholder="At least 6 characters"
        :error="errors.next"
      >
        <template #icon-right>
          <button
            type="button"
            :aria-label="showNext ? 'Hide password' : 'Show password'"
            class="pointer-events-auto"
            @click="showNext = !showNext"
          >
            <Icon :icon="showNext ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" />
          </button>
        </template>
      </Input>

      <Input
        v-model="form.confirm"
        label="Confirm new password"
        :type="showNext ? 'text' : 'password'"
        :error="errors.confirm"
      />
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <Button variant="secondary" @click="close">Cancel</Button>
        <Button :loading="saving" @click="submit">
          <template #icon-left><Icon icon="mdi:lock-reset" /></template>
          Update Password
        </Button>
      </div>
    </template>
  </Modal>
</template>
