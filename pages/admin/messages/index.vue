<script setup lang="ts">
import type { ContactMessage } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
useSeoMeta({ title: 'Messages', description: 'Messages left through the public contact form.' })

const { setHeader } = usePageHeader()
const messagesStore = useMessagesStore()

onMounted(() => {
  messagesStore.load()
  setHeader('Messages', 'Enquiries left through the contact form on the website')
})

type Filter = 'all' | 'unread' | 'open' | 'handled'
const filters: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Open', value: 'open' },
  { label: 'Handled', value: 'handled' },
]
const activeFilter = ref<Filter>('all')
const search = ref('')

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  return messagesStore.messages.filter((m) => {
    if (activeFilter.value === 'unread' && m.read) return false
    if (activeFilter.value === 'open' && m.handled) return false
    if (activeFilter.value === 'handled' && !m.handled) return false
    if (!q) return true
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.message.toLowerCase().includes(q)
    )
  })
})

function countFor(filter: Filter) {
  if (filter === 'unread') return messagesStore.unreadCount
  if (filter === 'open') return messagesStore.openCount
  if (filter === 'handled') return messagesStore.messages.filter((m) => m.handled).length
  return messagesStore.messages.length
}

// ─── Reading one ─────────────────────────────────────────────────────────────
const openMessage = ref<ContactMessage | null>(null)

function open(message: ContactMessage) {
  openMessage.value = message
  // Opening it is what marks it read — a no-op if it already was.
  messagesStore.markRead(message.id).catch(() => {})
}

/** The dialog reads through the store so the flags it shows follow a save. */
const selected = computed(() =>
  openMessage.value
    ? (messagesStore.messages.find((m) => m.id === openMessage.value!.id) ?? null)
    : null
)

const busyId = ref<string | null>(null)

async function toggleHandled(message: ContactMessage) {
  busyId.value = message.id
  try {
    await messagesStore.setHandled(message.id, !message.handled)
  } catch {
    // Reported by the store; the flag stays as it was.
  } finally {
    busyId.value = null
  }
}

const { confirm } = useConfirm()

/**
 * Was a hand-rolled `<Modal>` plus a `confirmingDelete` ref in this page. Now the same shared
 * dialog every other delete uses — the wording it carried was worth keeping, the second copy of
 * the dialog was not.
 */
async function confirmDelete(message: ContactMessage) {
  const ok = await confirm({
    title: 'Delete this message?',
    message: `The message from ${message.name} will be removed permanently. There is no other copy of it.`,
    confirmLabel: 'Delete',
  })
  if (!ok) return
  busyId.value = message.id
  try {
    await messagesStore.remove(message.id)
    if (openMessage.value?.id === message.id) openMessage.value = null
  } catch {
    // Reported by the store; the message stays listed.
  } finally {
    busyId.value = null
  }
}

/** `mailto:`/`tel:` so a reply is one click away — there is no sending from inside the app. */
function replyLink(message: ContactMessage) {
  const subject = encodeURIComponent(`Re: your message to the church`)
  return `mailto:${message.email}?subject=${subject}`
}

function preview(text: string) {
  return text.length > 140 ? `${text.slice(0, 140)}…` : text
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Filters + search -->
    <div
      class="flex flex-col gap-3 rounded-sm border border-rule bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div
        class="inline-flex flex-wrap gap-0.5 self-start rounded-md border border-rule bg-surface-muted p-0.5"
      >
        <button
          v-for="f in filters"
          :key="f.value"
          class="inline-flex min-h-8 items-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors duration-150"
          :class="
            activeFilter === f.value
              ? 'bg-surface text-ink ring-1 ring-rule'
              : 'text-ink-muted hover:text-ink'
          "
          :aria-pressed="activeFilter === f.value"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <span
            class="num text-xs"
            :class="activeFilter === f.value ? 'text-primary-ink font-semibold' : 'text-ink-subtle'"
            >{{ countFor(f.value) }}</span
          >
        </button>
      </div>
      <div class="relative sm:w-72">
        <Icon
          icon="mdi:magnify"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-subtle"
          aria-hidden="true"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search name, email, phone or text"
          aria-label="Search messages"
          class="min-h-9 w-full rounded-md border border-rule-strong bg-surface py-1.5 pr-3 pl-9 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-subtle hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
        />
      </div>
    </div>

    <LoadingState v-if="messagesStore.loading && !messagesStore.loaded" title="Loading messages…" />

    <EmptyState
      v-else-if="!messagesStore.messages.length"
      icon="mdi:email-outline"
      title="No messages yet"
      description="Enquiries left through the contact form on the website will appear here."
    />

    <EmptyState
      v-else-if="!visible.length"
      icon="mdi:email-search-outline"
      title="No messages match"
      description="Try a different filter or search term."
      size="sm"
    />

    <!-- List -->
    <div
      v-else
      class="flex flex-col divide-y divide-rule overflow-hidden rounded-sm border border-rule bg-surface"
    >
      <button
        v-for="m in visible"
        :key="m.id"
        class="group relative flex w-full gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-surface-muted/70 sm:px-5"
        :class="m.read ? '' : 'bg-primary-soft/35'"
        @click="open(m)"
      >
        <span class="flex w-2 shrink-0 justify-center pt-1.5">
          <span
            v-if="!m.read"
            class="size-2 shrink-0 rounded-full bg-primary"
            aria-label="Unread"
          ></span>
        </span>
        <span class="flex min-w-0 flex-1 flex-col gap-1">
          <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              class="text-sm"
              :class="m.read ? 'font-medium text-ink-muted' : 'font-semibold text-ink'"
              >{{ m.name }}</span
            >
            <Badge v-if="m.handled" variant="success" size="sm">Handled</Badge>
            <span
              class="num ml-auto text-xs whitespace-nowrap"
              :class="m.read ? 'text-ink-subtle' : 'font-semibold text-primary-ink'"
              >{{ m.submittedAt ? formatRelative(m.submittedAt) : '—' }}</span
            >
          </span>
          <span class="truncate text-xs text-ink-subtle"
            >{{ m.email }} · {{ m.phone || 'No phone' }}</span
          >
          <span
            class="text-sm leading-relaxed"
            :class="m.read ? 'text-ink-subtle' : 'text-ink-muted'"
            >{{ preview(m.message) }}</span
          >
        </span>
      </button>
    </div>

    <!-- Reading a message -->
    <Modal
      :model-value="Boolean(selected)"
      :title="selected?.name ?? 'Message'"
      size="lg"
      @update:model-value="openMessage = null"
    >
      <div v-if="selected" class="flex flex-col gap-5">
        <div
          class="grid grid-cols-1 gap-3 rounded-md border border-rule bg-surface-muted p-3 sm:grid-cols-3"
        >
          <InfoField icon="mdi:email-outline" label="Email" :value="selected.email" />
          <InfoField icon="mdi:phone-outline" label="Phone" :value="selected.phone || '—'" />
          <InfoField
            icon="mdi:clock-outline"
            label="Received"
            :value="selected.submittedAt ? formatDate(selected.submittedAt, 'long') : '—'"
          />
        </div>

        <div>
          <p class="text-xs font-semibold tracking-wide text-ink-muted uppercase">Message</p>
          <p
            class="mt-2 max-w-[68ch] border-t border-rule pt-3 text-[15px] leading-relaxed whitespace-pre-wrap text-ink"
          >
            {{ selected.message }}
          </p>
        </div>
      </div>

      <template #footer>
        <div v-if="selected" class="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" @click="confirmDelete(selected)">Delete</Button>
          <Button
            variant="secondary"
            :loading="busyId === selected.id"
            @click="toggleHandled(selected)"
          >
            {{ selected.handled ? 'Mark as open' : 'Mark as handled' }}
          </Button>
          <!-- A real anchor, so it opens the staff member's own mail client. -->
          <a
            :href="replyLink(selected)"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-colors duration-150 hover:bg-primary-hover sm:min-h-10"
          >
            <Icon icon="mdi:reply" aria-hidden="true" />
            Reply by email
          </a>
        </div>
      </template>
    </Modal>

    <!-- Deleting is permanent, and the message is the only record of what was asked — the
         confirmation now comes from `useConfirm()`, rendered once in app.vue. -->
  </div>
</template>
