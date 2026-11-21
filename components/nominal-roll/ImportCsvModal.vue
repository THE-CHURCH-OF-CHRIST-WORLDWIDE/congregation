<script setup lang="ts">
import type { Member } from '~/types'
import type { ParsedRow } from '~/composables/useImportCsv'

interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  import: [members: Omit<Member, 'id' | 'absenceCount'>[]]
}>()

const { parse, readFile } = useImportCsv()
const membersStore = useMembersStore()

// ─── State ────────────────────────────────────────────────────────────────────
const step = ref<'upload' | 'preview'>('upload')
const fileName = ref('')
const parsedHeaders = ref<string[]>([])
const parsedRows = ref<ParsedRow[]>([])
const isDragging = ref(false)
const fileError = ref('')
const importOnlyValid = ref(true)

// ─── Computed ─────────────────────────────────────────────────────────────────
const validRows = computed(() => parsedRows.value.filter((r) => r.valid))
const invalidRows = computed(() => parsedRows.value.filter((r) => !r.valid))
const rowsToImport = computed(() => (importOnlyValid.value ? validRows.value : parsedRows.value))

const duplicateCount = computed(() => {
  return rowsToImport.value.filter((r) =>
    membersStore.members.some((m) => m.phone === r.phone || (r.email && m.email === r.email))
  ).length
})

// ─── File handling ────────────────────────────────────────────────────────────
async function handleFile(file: File) {
  fileError.value = ''
  if (!file.name.endsWith('.csv')) {
    fileError.value = 'Only .csv files are supported.'
    return
  }
  try {
    const text = await readFile(file)
    const { headers, rows } = parse(text)
    if (!rows.length) {
      fileError.value = 'The file appears to be empty or has no data rows.'
      return
    }
    parsedHeaders.value = headers
    parsedRows.value = rows
    fileName.value = file.name
    step.value = 'preview'
  } catch {
    fileError.value = 'Failed to read the file. Please try again.'
  }
}

function onFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

// ─── Import ───────────────────────────────────────────────────────────────────
function doImport() {
  const members = rowsToImport.value.map((r) => ({
    name: r.name,
    gender: r.gender as 'Male' | 'Female',
    phone: r.phone,
    email: r.email,
    dob: r.dob || undefined,
    status: r.status as Member['status'],
    maritalStatus: r.maritalStatus || undefined,
    dateOfBaptism: r.dateOfBaptism || undefined,
    dateJoined: r.dateJoined || undefined,
    country: r.country || undefined,
    state: r.state || undefined,
    localGovernment: r.localGovernment || undefined,
    village: r.village || undefined,
    address: r.address || undefined,
    occupation: r.occupation || undefined,
    school: r.school || undefined,
    department: r.department || undefined,
    courseOfStudy: r.courseOfStudy || undefined,
    program: r.program || undefined,
    level: r.level || undefined,
    hallOfResidence: r.hallOfResidence || undefined,
    yearOfEntry: r.yearOfEntry || undefined,
    yearOfExit: r.yearOfExit || undefined,
    comment: r.comment || undefined,
  }))
  emit('import', members)
  close()
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function back() {
  step.value = 'upload'
  parsedRows.value = []
  parsedHeaders.value = []
  fileName.value = ''
  fileError.value = ''
}

function close() {
  emit('update:modelValue', false)
  setTimeout(() => {
    back()
    importOnlyValid.value = true
  }, 300)
}

watch(
  () => props.modelValue,
  (v) => {
    if (!v) setTimeout(back, 300)
  }
)

// ─── Template helpers ─────────────────────────────────────────────────────────
// Columns to show in preview (subset of mapped fields)
const previewCols: Array<{ key: keyof ParsedRow; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'gender', label: 'Gender' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'dob', label: 'DOB' },
  { key: 'status', label: 'Status' },
]

function isDuplicate(row: ParsedRow) {
  return membersStore.members.some(
    (m) => m.phone === row.phone || (row.email && m.email === row.email)
  )
}

const fileInputRef = ref<HTMLInputElement | null>(null)
</script>

<template>
  <Modal
    :model-value="modelValue"
    title="Import Members from CSV"
    size="xl"
    @update:model-value="close"
  >
    <!-- ── STEP 1: Upload ──────────────────────────────────────────────────── -->
    <div v-if="step === 'upload'" class="flex flex-col gap-5">
      <!-- Drop zone -->
      <div
        :class="[
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed p-10 transition-colors duration-150',
          isDragging
            ? 'border-primary bg-primary-soft'
            : 'border-rule-strong bg-surface-muted/50 hover:border-primary hover:bg-surface-muted',
        ]"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="onDrop"
        @click="fileInputRef?.click()"
      >
        <div
          :class="[
            'flex size-14 items-center justify-center rounded-md border transition-colors',
            isDragging
              ? 'border-primary/30 bg-surface text-primary-ink'
              : 'border-rule bg-surface text-primary-ink',
          ]"
        >
          <Icon icon="mdi:file-upload-outline" class="text-3xl" />
        </div>
        <div class="text-center">
          <p class="font-sans text-base font-semibold text-ink">Drop your CSV file here</p>
          <p class="mt-1 text-xs text-ink-subtle">or click to browse — .csv files only</p>
        </div>
        <input ref="fileInputRef" type="file" accept=".csv" class="hidden" @change="onFileInput" />
      </div>

      <p
        v-if="fileError"
        class="flex items-center gap-2 rounded-md border border-error/25 bg-error-soft px-4 py-3 text-sm text-error"
        role="alert"
      >
        <Icon icon="mdi:alert-circle-outline" class="shrink-0 text-base" />
        {{ fileError }}
      </p>

      <!-- Expected format guide -->
      <div class="rounded-md border border-rule bg-surface-muted p-4">
        <p class="mb-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Expected CSV columns
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="col in [
              'Name *',
              'Phone *',
              'Email',
              'Gender',
              'Date of Birth',
              'Status',
              'Marital Status',
              'Date of Baptism',
              'Date of Registration',
              'Country',
              'State',
              'LGA',
              'Village',
              'Address',
              'Occupation',
            ]"
            :key="col"
            :class="[
              'rounded-sm px-2 py-0.5 text-2xs font-semibold ring-1 ring-inset',
              col.endsWith('*')
                ? 'bg-primary-soft text-primary-ink ring-primary/25'
                : 'bg-surface text-ink-muted ring-rule-strong/60',
            ]"
            >{{ col }}</span
          >
        </div>
        <p class="mt-2.5 text-xs text-ink-subtle">
          * Required. Column order doesn't matter — headers are auto-detected.
        </p>
      </div>
    </div>

    <!-- ── STEP 2: Preview ─────────────────────────────────────────────────── -->
    <div v-else class="flex flex-col gap-4">
      <!-- Summary bar -->
      <div
        class="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-4"
      >
        <div class="bg-surface p-3">
          <p class="text-2xs font-semibold tracking-wide text-ink-muted uppercase">Total rows</p>
          <p class="num mt-1 font-display text-2xl leading-none text-ink">
            {{ parsedRows.length }}
          </p>
        </div>
        <div class="bg-success-soft p-3">
          <p class="text-2xs font-semibold tracking-wide text-ink-muted uppercase">Valid</p>
          <p class="num mt-1 font-display text-2xl leading-none text-success">
            {{ validRows.length }}
          </p>
        </div>
        <div class="p-3" :class="invalidRows.length ? 'bg-error-soft' : 'bg-surface'">
          <p class="text-2xs font-semibold tracking-wide text-ink-muted uppercase">Invalid</p>
          <p
            class="num mt-1 font-display text-2xl leading-none"
            :class="invalidRows.length ? 'text-error' : 'text-ink-subtle'"
          >
            {{ invalidRows.length }}
          </p>
        </div>
        <div class="p-3" :class="duplicateCount ? 'bg-warning-soft' : 'bg-surface'">
          <p class="text-2xs font-semibold tracking-wide text-ink-muted uppercase">Duplicates</p>
          <p
            class="num mt-1 font-display text-2xl leading-none"
            :class="duplicateCount ? 'text-warning' : 'text-ink-subtle'"
          >
            {{ duplicateCount }}
          </p>
        </div>
      </div>

      <!-- File name + toggle -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex min-w-0 items-center gap-2 text-sm text-ink-muted">
          <Icon icon="mdi:file-delimited-outline" class="shrink-0 text-base text-primary-ink" />
          <span class="truncate font-medium text-ink">{{ fileName }}</span>
        </div>
        <label
          class="flex min-h-9 cursor-pointer items-center gap-2 text-xs font-medium text-ink-muted select-none"
        >
          <span class="relative inline-block h-5 w-9">
            <input v-model="importOnlyValid" type="checkbox" class="peer sr-only" />
            <span
              class="absolute inset-0 rounded-full bg-rule-strong transition-colors peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
            ></span>
            <span
              class="absolute top-0.5 left-0.5 size-4 rounded-full bg-surface transition-transform peer-checked:translate-x-4"
            ></span>
          </span>
          Skip invalid rows (<span class="num">{{ invalidRows.length }}</span
          >)
        </label>
      </div>

      <!-- Preview table -->
      <div class="max-h-80 overflow-auto rounded-md border border-rule bg-surface">
        <table class="w-full text-xs">
          <thead class="sticky top-0 z-[1] bg-surface-muted">
            <tr>
              <th
                class="w-8 border-b border-rule px-3 py-2.5 text-right font-semibold tracking-wide text-ink-muted uppercase"
              >
                #
              </th>
              <th
                v-for="col in previewCols"
                :key="col.key"
                class="border-b border-rule px-3 py-2.5 text-left font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase"
              >
                {{ col.label }}
              </th>
              <th
                class="border-b border-rule px-3 py-2.5 text-left font-semibold tracking-wide text-ink-muted uppercase"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rule">
            <tr
              v-for="(row, i) in parsedRows"
              :key="i"
              :class="[
                'transition-colors',
                !row.valid
                  ? 'bg-error-soft/50'
                  : isDuplicate(row)
                    ? 'bg-warning-soft/50'
                    : 'hover:bg-surface-muted/70',
                !importOnlyValid && !row.valid ? 'opacity-60' : '',
              ]"
            >
              <td class="num px-3 py-2 text-right text-ink-subtle">{{ i + 1 }}</td>
              <td
                v-for="col in previewCols"
                :key="col.key"
                class="max-w-[140px] truncate px-3 py-2 text-ink"
              >
                {{ row[col.key] || '—' }}
              </td>
              <td class="px-3 py-2">
                <span
                  v-if="!row.valid"
                  class="inline-flex items-center gap-1 font-semibold text-error"
                >
                  <Icon icon="mdi:close-circle-outline" class="shrink-0 text-sm" />
                  <span class="max-w-[120px] truncate" :title="row.errors.join(', ')">{{
                    row.errors[0]
                  }}</span>
                </span>
                <span
                  v-else-if="isDuplicate(row)"
                  class="inline-flex items-center gap-1 font-semibold text-warning"
                >
                  <Icon icon="mdi:alert-outline" class="shrink-0 text-sm" />
                  Duplicate
                </span>
                <span v-else class="inline-flex items-center gap-1 font-semibold text-success">
                  <Icon icon="mdi:check-circle-outline" class="shrink-0 text-sm" />
                  Ready
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-xs text-ink-muted">
        <span class="num font-semibold text-ink">{{ rowsToImport.length }}</span> row{{
          rowsToImport.length !== 1 ? 's' : ''
        }}
        will be imported. Duplicates will still be added — remove them from the CSV to skip.
      </p>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-2">
        <Button v-if="step === 'preview'" variant="secondary" @click="back">
          <template #icon-left><Icon icon="mdi:arrow-left" /></template>
          Back
        </Button>
        <div v-else></div>
        <div class="flex gap-2">
          <Button variant="secondary" @click="close">Cancel</Button>
          <Button
            v-if="step === 'preview'"
            :disabled="rowsToImport.length === 0"
            :loading="membersStore.saving"
            @click="doImport"
          >
            <template #icon-left><Icon icon="mdi:account-multiple-plus-outline" /></template>
            Import {{ rowsToImport.length }} Member{{ rowsToImport.length !== 1 ? 's' : '' }}
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
