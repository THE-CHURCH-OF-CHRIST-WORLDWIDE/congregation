<script setup lang="ts">
import type { MinuteItem } from '~/types/businessMeetings'
import { MOTION_OUTCOMES, newMinuteItem } from '~/utils/businessMeetings'

/**
 * Edits one list of discussed items in place — matters arising, reports, new business or any
 * other business. Each item is numbered, may be reordered, and can carry a motion (moved,
 * seconded, outcome) for the decisions the meeting voted on.
 */
const items = defineModel<MinuteItem[]>('items', { required: true })

const props = defineProps<{
  /** Singular, used in labels: "Report 2", "Add report". */
  noun: string
  /** Prefix for item ids, unique per list. */
  idPrefix: string
  titlePlaceholder?: string
  presenterLabel?: string
  /** Show motion fields open by default (new business), rather than behind a toggle. */
  motionsOpen?: boolean
  /** Datalist id for name suggestions. */
  names?: string
}>()

const outcomeOptions = MOTION_OUTCOMES.map((o) => ({ label: o.label, value: o.value }))

// Which items show their motion fields. An item that already has a motion always does.
const motionShown = ref(new Set<string>())
function hasMotion(item: MinuteItem) {
  return (
    props.motionsOpen ||
    motionShown.value.has(item.id) ||
    !!(item.movedBy || item.secondedBy || item.outcome)
  )
}

function add() {
  items.value = [...items.value, newMinuteItem(props.idPrefix)]
}
function remove(i: number) {
  items.value = items.value.filter((_, j) => j !== i)
}
function move(i: number, delta: -1 | 1) {
  const j = i + delta
  if (j < 0 || j >= items.value.length) return
  const next = [...items.value]
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  items.value = next
}

const iconBtn =
  'inline-flex size-8 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-surface-sunken hover:text-ink disabled:pointer-events-none disabled:opacity-30'
</script>

<template>
  <div class="flex flex-col gap-3">
    <ol v-if="items.length" class="flex flex-col gap-3">
      <li
        v-for="(item, i) in items"
        :key="item.id"
        class="rounded-md border border-rule bg-surface-muted/50 p-4"
      >
        <div class="flex items-start gap-3">
          <span
            class="num mt-2 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-ink-muted ring-1 ring-rule-strong"
            aria-hidden="true"
            >{{ i + 1 }}</span
          >
          <div class="grid min-w-0 flex-1 gap-3 sm:grid-cols-[1fr_14rem]">
            <Input
              v-model="item.title"
              :label="`${noun} ${i + 1}`"
              label-class="sr-only"
              :placeholder="titlePlaceholder ?? 'Subject'"
            />
            <Input
              v-model="item.presentedBy"
              :label="presenterLabel ?? 'Raised by'"
              label-class="sr-only"
              :list="names"
              :placeholder="presenterLabel ?? 'Raised by'"
            />
          </div>
          <div class="flex shrink-0 items-center gap-0.5 pt-1">
            <button
              type="button"
              :class="iconBtn"
              :disabled="i === 0"
              :aria-label="`Move ${noun.toLowerCase()} ${i + 1} up`"
              @click="move(i, -1)"
            >
              <Icon icon="mdi:arrow-up" class="text-base" />
            </button>
            <button
              type="button"
              :class="iconBtn"
              :disabled="i === items.length - 1"
              :aria-label="`Move ${noun.toLowerCase()} ${i + 1} down`"
              @click="move(i, 1)"
            >
              <Icon icon="mdi:arrow-down" class="text-base" />
            </button>
            <button
              type="button"
              class="inline-flex size-8 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-error-soft hover:text-error"
              :aria-label="`Remove ${noun.toLowerCase()} ${i + 1}`"
              @click="remove(i)"
            >
              <Icon icon="mdi:close" class="text-base" />
            </button>
          </div>
        </div>

        <div class="mt-3 flex flex-col gap-3 sm:pl-10">
          <Textarea
            v-model="item.discussion"
            label="Discussion"
            :rows="3"
            placeholder="What was said, the points raised, and by whom."
          />
          <Textarea
            v-model="item.resolution"
            label="Resolution / decision"
            :rows="2"
            placeholder="What the meeting agreed. Leave empty if it was only noted."
          />

          <div v-if="hasMotion(item)" class="grid gap-3 sm:grid-cols-3">
            <Input v-model="item.movedBy" label="Moved by" :list="names" placeholder="Name" />
            <Input v-model="item.secondedBy" label="Seconded by" :list="names" placeholder="Name" />
            <Select v-model="item.outcome" label="Outcome" :options="outcomeOptions" />
          </div>
          <button
            v-else
            type="button"
            class="inline-flex min-h-9 items-center gap-1.5 self-start rounded-md px-2 text-sm font-medium text-primary-ink hover:bg-primary-soft"
            @click="motionShown.add(item.id)"
          >
            <Icon icon="mdi:gavel" class="text-sm" />
            Record a motion
          </button>
        </div>
      </li>
    </ol>
    <p
      v-else
      class="rounded-md border border-dashed border-rule-strong bg-surface-muted py-6 text-center text-sm text-ink-subtle"
    >
      None recorded.
    </p>
    <Button variant="secondary" size="sm" class="self-start" @click="add">
      <template #icon-left><Icon icon="mdi:plus" /></template>
      Add {{ noun.toLowerCase() }}
    </Button>
  </div>
</template>
