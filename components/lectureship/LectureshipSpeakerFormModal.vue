<script setup lang="ts">
import type { LectureshipSpeaker, LectureshipSpeakerRole } from '~/types'
import { LECTURESHIP_ROLE_ORDER, LECTURESHIP_ROLES } from '~/constants'

interface Props {
  modelValue: boolean
  /** When provided, the modal opens in edit mode and prefills the form. */
  speaker?: LectureshipSpeaker | null
  /** Which role to default to when creating. Ignored if `speaker` is set. */
  defaultRole?: LectureshipSpeakerRole
  /** Next `order` value to default a new profile to. */
  nextOrder?: number
}

const props = withDefaults(defineProps<Props>(), {
  speaker: null,
  defaultRole: 'speaker',
  nextOrder: 0,
})

const emit = defineEmits<{ 'update:modelValue': [val: boolean] }>()

const ROLE_OPTIONS = LECTURESHIP_ROLE_ORDER.map((value) => ({
  label: LECTURESHIP_ROLES[value].label,
  value,
}))

const form = ref({
  name: '',
  role: props.defaultRole as LectureshipSpeakerRole,
  title: '',
  avatar: '',
  bio: '',
  order: props.nextOrder,
})

const errors = ref<Record<string, string>>({})

function reset() {
  errors.value = {}
  form.value = {
    name: '',
    role: props.defaultRole,
    title: '',
    avatar: '',
    bio: '',
    order: props.nextOrder,
  }
}

watch(
  () => [props.modelValue, props.speaker] as const,
  ([isOpen, speaker]) => {
    if (!isOpen) return
    if (speaker) {
      form.value = {
        name: speaker.name,
        role: speaker.role,
        title: speaker.title ?? '',
        avatar: speaker.avatar,
        bio: speaker.bio,
        order: speaker.order,
      }
    } else {
      reset()
    }
    errors.value = {}
  },
  { immediate: true }
)

const isEditing = computed(() => !!props.speaker)
const title = computed(() => (isEditing.value ? 'Edit Profile' : 'Add Speaker'))

function close() {
  emit('update:modelValue', false)
}

function validate(): boolean {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = 'Name is required'
  if (!form.value.bio.trim()) errors.value.bio = 'A short bio is required'
  return Object.keys(errors.value).length === 0
}

const lectureshipStore = useLectureshipStore()
const saving = ref(false)

async function handleSubmit() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      role: form.value.role,
      title: form.value.title.trim() || undefined,
      avatar: form.value.avatar.trim(),
      bio: form.value.bio.trim(),
      order: form.value.order,
    }
    if (isEditing.value && props.speaker) {
      await lectureshipStore.updateSpeaker(props.speaker.id, payload)
    } else {
      await lectureshipStore.addSpeaker(payload)
    }
    close()
  } catch {
    // Reported by the store via toast; keep the modal open with what was typed.
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Modal :model-value="modelValue" :title="title" size="lg" @update:model-value="close">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <div class="flex justify-center">
        <ImageUpload
          v-model="form.avatar"
          label="Photo"
          folder="congregation/lectureship"
          shape="circle"
        />
      </div>

      <Input
        v-model="form.name"
        label="Full Name"
        placeholder="Bro. James Ikpe"
        :error="errors.name"
        required
      />

      <div class="grid grid-cols-2 gap-3">
        <Select v-model="form.role" label="Role" :options="ROLE_OPTIONS" />
        <Input
          v-model="form.title"
          label="Title (optional)"
          placeholder="e.g. Guest Speaker, Presiding Minister"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">
          Bio<span class="ml-0.5 text-red-500">*</span>
        </label>
        <textarea
          v-model="form.bio"
          rows="4"
          placeholder="A short biography to introduce this person to visitors"
          class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        ></textarea>
        <p v-if="errors.bio" class="mt-1 text-xs text-red-600">{{ errors.bio }}</p>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="secondary" type="button" @click="close">Cancel</Button>
        <Button type="button" :loading="saving" @click="handleSubmit">
          {{ isEditing ? 'Save changes' : 'Add profile' }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
