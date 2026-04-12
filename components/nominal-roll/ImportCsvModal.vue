<script setup lang="ts">
import type { Member } from '~/types'
import type { ParsedRow } from '~/composables/useImportCsv'

interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  'import': [members: Omit<Member, 'id' | 'absenceCount'>[]]
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
const rowsToImport = computed(() => importOnlyValid.value ? validRows.value : parsedRows.value)

const duplicateCount = computed(() => {
  return rowsToImport.value.filter((r) =>
    membersStore.members.some(
      (m) => m.phone === r.phone || (r.email && m.email === r.email)
    )
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

watch(() => props.modelValue, (v) => { if (!v) setTimeout(back, 300) })

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
  <Modal :model-value="modelValue" title="Import Members from CSV" size="xl" @update:model-value="close">

    <!-- ── STEP 1: Upload ──────────────────────────────────────────────────── -->
    <div v-if="step === 'upload'" class="flex flex-col gap-5">

      <!-- Drop zone -->
      <div
        :class="[
          'border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50',
        ]"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="onDrop"
        @click="fileInputRef?.click()"
      >
        <div class="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Icon icon="mdi:file-upload-outline" class="text-3xl text-blue-500" />
        </div>
        <div class="text-center">
          <p class="text-sm font-semibold text-gray-800">Drop your CSV file here</p>
          <p class="text-xs text-gray-400 mt-1">or click to browse — .csv files only</p>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept=".csv"
          class="hidden"
          @change="onFileInput"
        />
      </div>

      <p v-if="fileError" class="text-sm text-red-500 flex items-center gap-1.5">
        <Icon icon="mdi:alert-circle-outline" />
        {{ fileError }}
      </p>

      <!-- Expected format guide -->
      <div class="rounded-xl bg-gray-50 border border-gray-100 p-4">
        <p class="text-xs font-semibold text-gray-600 mb-2">Expected CSV columns</p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="col in ['Name *', 'Phone *', 'Email', 'Gender', 'Date of Birth', 'Status', 'Marital Status', 'Date of Baptism', 'Date of Registration', 'Country', 'State', 'LGA', 'Village', 'Address', 'Occupation']"
            :key="col"
            :class="[
              'px-2 py-0.5 rounded-md text-[11px] font-medium',
              col.endsWith('*') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600',
            ]"
          >{{ col }}</span>
        </div>
        <p class="text-[11px] text-gray-400 mt-2">* Required. Column order doesn't matter — headers are auto-detected.</p>
      </div>

    </div>

    <!-- ── STEP 2: Preview ─────────────────────────────────────────────────── -->
    <div v-else class="flex flex-col gap-4">

      <!-- Summary bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="rounded-xl bg-gray-50 p-3 text-center">
          <p class="text-xl font-bold text-gray-900">{{ parsedRows.length }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Total rows</p>
        </div>
        <div class="rounded-xl bg-green-50 p-3 text-center">
          <p class="text-xl font-bold text-green-600">{{ validRows.length }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Valid</p>
        </div>
        <div class="rounded-xl p-3 text-center" :class="invalidRows.length ? 'bg-red-50' : 'bg-gray-50'">
          <p class="text-xl font-bold" :class="invalidRows.length ? 'text-red-500' : 'text-gray-400'">{{ invalidRows.length }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Invalid</p>
        </div>
        <div class="rounded-xl p-3 text-center" :class="duplicateCount ? 'bg-amber-50' : 'bg-gray-50'">
          <p class="text-xl font-bold" :class="duplicateCount ? 'text-[#F3A218]' : 'text-gray-400'">{{ duplicateCount }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Duplicates</p>
        </div>
      </div>

      <!-- File name + toggle -->
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <Icon icon="mdi:file-delimited-outline" class="text-blue-500" />
          <span class="font-medium text-gray-700">{{ fileName }}</span>
        </div>
        <label class="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
          <span class="relative inline-block w-8 h-4">
            <input v-model="importOnlyValid" type="checkbox" class="sr-only peer" />
            <span class="absolute inset-0 rounded-full bg-gray-300 peer-checked:bg-blue-600 transition-colors" ></span>
            <span class="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" ></span>
          </span>
          Skip invalid rows ({{ invalidRows.length }})
        </label>
      </div>

      <!-- Preview table -->
      <div class="overflow-auto rounded-xl border border-gray-200 max-h-80">
        <table class="w-full text-xs">
          <thead class="sticky top-0 bg-gray-50 z-10">
            <tr class="border-b border-gray-200">
              <th class="px-3 py-2.5 text-left font-medium text-gray-500 w-8">#</th>
              <th
                v-for="col in previewCols"
                :key="col.key"
                class="px-3 py-2.5 text-left font-medium text-gray-500 whitespace-nowrap"
              >{{ col.label }}</th>
              <th class="px-3 py-2.5 text-left font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in parsedRows"
              :key="i"
              :class="[
                'border-b border-gray-50 transition-colors',
                !row.valid ? 'bg-red-50/60' : isDuplicate(row) ? 'bg-amber-50/60' : 'hover:bg-gray-50',
                !importOnlyValid && !row.valid ? 'opacity-60' : '',
              ]"
            >
              <td class="px-3 py-2 text-gray-400">{{ i + 1 }}</td>
              <td
                v-for="col in previewCols"
                :key="col.key"
                class="px-3 py-2 text-gray-700 max-w-[140px] truncate"
              >{{ row[col.key] || '—' }}</td>
              <td class="px-3 py-2">
                <span v-if="!row.valid" class="inline-flex items-center gap-1 text-red-600 font-medium">
                  <Icon icon="mdi:close-circle-outline" class="text-sm" />
                  <span class="truncate max-w-[120px]" :title="row.errors.join(', ')">{{ row.errors[0] }}</span>
                </span>
                <span v-else-if="isDuplicate(row)" class="inline-flex items-center gap-1 font-medium" style="color: #F3A218">
                  <Icon icon="mdi:alert-outline" class="text-sm" />
                  Duplicate
                </span>
                <span v-else class="inline-flex items-center gap-1 text-green-600 font-medium">
                  <Icon icon="mdi:check-circle-outline" class="text-sm" />
                  Ready
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-xs text-gray-400">
        {{ rowsToImport.length }} row{{ rowsToImport.length !== 1 ? 's' : '' }} will be imported.
        Duplicates will still be added — remove them from the CSV to skip.
      </p>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-2">
        <Button v-if="step === 'preview'" variant="secondary" @click="back">
          <template #icon-left><Icon icon="mdi:arrow-left" /></template>
          Back
        </Button>
        <div v-else ></div>
        <div class="flex gap-2">
          <Button variant="secondary" @click="close">Cancel</Button>
          <Button
            v-if="step === 'preview'"
            :disabled="rowsToImport.length === 0"
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
