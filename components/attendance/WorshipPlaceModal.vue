<script setup lang="ts">
import type { WorshipDetails, WorshipPlace } from '~/types'

/**
 * Asked whenever somebody is marked present: here, or with another congregation?
 *
 * A member who travels and worships elsewhere has kept the Lord's day, and brings back a
 * certificate of worship as evidence. Both are attendance — but only the register knows which,
 * and once the tick is saved as a plain "present" the distinction is gone for good.
 *
 * Defaults to the local congregation and puts focus on Confirm, because that is the answer almost
 * every time: marking a full register should be a tick and a Return, not a form.
 */
interface Props {
  modelValue: boolean
  /** Who and what is being marked, e.g. "Grace Etim · Sunday, 9 August 2026". */
  subject?: string
  /** Wording for a bulk mark, where one answer covers several services. */
  scopeNote?: string
}
const props = withDefaults(defineProps<Props>(), { subject: '', scopeNote: '' })

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  confirm: [details: WorshipDetails]
  cancel: []
}>()

const place = ref<WorshipPlace>('local')
const congregation = ref('')
const certificate = ref(true)
const certificateRef = ref('')
const congregationError = ref('')

const confirmButton = ref<HTMLButtonElement | null>(null)
const congregationInput = ref<HTMLInputElement | null>(null)

/** Fresh every time it opens — the previous member's congregation must not carry over. */
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    place.value = 'local'
    congregation.value = ''
    certificate.value = true
    certificateRef.value = ''
    congregationError.value = ''
    await nextTick()
    confirmButton.value?.focus()
  }
)

// Choosing "elsewhere" moves focus to the field that then has to be filled in.
watch(place, async (value) => {
  congregationError.value = ''
  if (value !== 'elsewhere') return
  await nextTick()
  congregationInput.value?.focus()
})

function submit() {
  if (place.value === 'elsewhere' && !congregation.value.trim()) {
    // Required, because "worshipped elsewhere" without a where is not a record of anything.
    congregationError.value = 'Name the congregation they worshipped with.'
    congregationInput.value?.focus()
    return
  }

  emit(
    'confirm',
    place.value === 'local'
      ? { place: 'local' }
      : {
          place: 'elsewhere',
          congregation: congregation.value.trim(),
          certificate: certificate.value,
          certificateRef: certificateRef.value.trim() || undefined,
        }
  )
  emit('update:modelValue', false)
}

function cancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    title="Where did they worship?"
    size="lg"
    @update:model-value="cancel"
  >
    <div class="flex flex-col gap-4">
      <p v-if="subject" class="num text-sm font-medium text-ink">{{ subject }}</p>
      <p
        v-if="scopeNote"
        class="flex items-start gap-2 rounded-md border border-warning/25 bg-warning-soft px-4 py-3 text-sm text-warning"
      >
        <Icon icon="mdi:alert-circle-outline" class="mt-0.5 shrink-0 text-base" />
        <span>{{ scopeNote }}</span>
      </p>

      <div class="flex flex-col gap-2">
        <!-- Radios rather than a select: two options, both worth reading before choosing. -->
        <label
          class="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors"
          :class="
            place === 'local'
              ? 'border-primary bg-primary-soft ring-1 ring-primary ring-inset'
              : 'border-rule-strong hover:bg-surface-muted'
          "
        >
          <input v-model="place" type="radio" value="local" class="mt-0.5 size-4 shrink-0" />
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-ink">With this congregation</span>
            <span class="block text-xs text-ink-muted">They worshipped here.</span>
          </span>
        </label>

        <label
          class="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors"
          :class="
            place === 'elsewhere'
              ? 'border-primary bg-primary-soft ring-1 ring-primary ring-inset'
              : 'border-rule-strong hover:bg-surface-muted'
          "
        >
          <input v-model="place" type="radio" value="elsewhere" class="mt-0.5 size-4 shrink-0" />
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-ink"> With another congregation </span>
            <span class="block text-xs text-ink-muted">
              They travelled and brought a certificate of worship.
            </span>
          </span>
        </label>
      </div>

      <!-- Only the second answer needs anything else filling in. -->
      <div v-if="place === 'elsewhere'" class="flex flex-col gap-4 border-t border-rule pt-4">
        <EditField label="Congregation *" :error="congregationError">
          <input
            ref="congregationInput"
            v-model="congregation"
            type="text"
            placeholder="e.g. Church of Christ, Uyo"
            :aria-invalid="Boolean(congregationError)"
            @keyup.enter="submit"
          />
        </EditField>

        <label class="flex min-h-11 cursor-pointer items-start gap-2.5">
          <input v-model="certificate" type="checkbox" class="mt-0.5 size-4 shrink-0" />
          <span class="text-sm font-medium text-ink">
            Certificate of worship produced
            <span class="mt-0.5 block text-xs font-normal text-ink-subtle">
              Leave unticked if they reported it but have not brought the certificate in yet.
            </span>
          </span>
        </label>

        <EditField label="Certificate reference" hint="Optional — who signed it, or a number.">
          <input
            v-model="certificateRef"
            type="text"
            placeholder="e.g. signed by Bro. Udo Effiong"
            @keyup.enter="submit"
          />
        </EditField>
      </div>
    </div>

    <template #footer>
      <!-- Plain buttons, as in ConfirmDialog: a `ref` on the Button component would give an
           instance rather than an element, and this one has to be focusable. -->
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-rule-strong bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-ink-subtle hover:bg-surface-muted sm:min-h-10"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          ref="confirmButton"
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover sm:min-h-10"
          @click="submit"
        >
          <Icon icon="mdi:check" class="text-base" />
          Mark Present
        </button>
      </div>
    </template>
  </Modal>
</template>
