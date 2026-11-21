<script setup lang="ts">
import type { BusinessMeeting, MinuteItem } from '~/types/businessMeetings'
import {
  formatMeetingDate,
  formatMeetingTime,
  itemHasContent,
  meetingTypeLabel,
  outcomeLabel,
} from '~/utils/businessMeetings'

/**
 * The minutes as a finished document: the read view for locked minutes and the printed copy.
 * Empty sections are left out, so a short meeting prints as a short page.
 */
const props = defineProps<{ meeting: BusinessMeeting; churchName: string }>()

const m = computed(() => props.meeting)

interface Block {
  key: string
  heading: string
  items: MinuteItem[]
}

const blocks = computed<Block[]>(() =>
  [
    { key: 'ma', heading: 'Matters arising', items: m.value.mattersArising },
    { key: 'rp', heading: 'Reports', items: m.value.reports },
    { key: 'ag', heading: 'New business', items: m.value.agendaItems },
    { key: 'ob', heading: 'Any other business', items: m.value.otherBusiness },
  ]
    .map((b) => ({ ...b, items: b.items.filter(itemHasContent) }))
    .filter((b) => b.items.length)
)

const actionPoints = computed(() => m.value.actionPoints.filter((a) => a.task.trim()))
const pm = computed(() => m.value.previousMinutes)
const hasPrevious = computed(
  () => !!(pm.value.readBy || pm.value.corrections || pm.value.movedBy || pm.value.adopted)
)
const hasNext = computed(
  () => !!(m.value.nextMeeting.date || m.value.nextMeeting.time || m.value.nextMeeting.venue)
)

const attendance = computed(() =>
  [
    { label: 'Present', names: m.value.present },
    { label: 'Apologies', names: m.value.apologies },
    { label: 'Absent', names: m.value.absent },
    { label: 'In attendance', names: m.value.inAttendance },
  ].filter((g) => g.names.length)
)

const hasOpening = computed(
  () => !!(m.value.openingPrayerBy || m.value.openingRemarks || m.value.startTime)
)
const hasClosing = computed(() => !!(m.value.closingPrayerBy || m.value.adjournedAt))

/** Section numbers follow only the sections that are actually printed, in printed order. */
const order = computed(() =>
  [
    attendance.value.length && 'attendance',
    hasOpening.value && 'opening',
    hasPrevious.value && 'previous',
    ...blocks.value.map((b) => b.key),
    actionPoints.value.length && 'actions',
    m.value.announcements && 'announcements',
    hasNext.value && 'next',
    hasClosing.value && 'closing',
  ].filter(Boolean)
)
const num = (key: string) => `${order.value.indexOf(key) + 1}.`
</script>

<template>
  <article class="minutes mx-auto max-w-[52rem] text-ink">
    <!-- Heading -->
    <header class="border-b-2 border-ink pb-5 text-center">
      <p class="t-label text-ink-muted">{{ churchName }}</p>
      <h1 class="mt-2 font-display text-3xl leading-tight text-ink">
        Minutes of the {{ m.title || meetingTypeLabel(m.meetingType) }}
      </h1>
      <p class="mt-2 text-sm text-ink-muted">
        {{ meetingTypeLabel(m.meetingType) }}
        <template v-if="m.date"> · {{ formatMeetingDate(m.date) }}</template>
        <template v-if="m.startTime"> · {{ formatMeetingTime(m.startTime) }}</template>
        <template v-if="m.venue"> · {{ m.venue }}</template>
      </p>
      <p
        v-if="m.status === 'draft'"
        class="mt-3 inline-block rounded-sm bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning uppercase print:border print:border-ink"
      >
        Draft — not yet approved
      </p>
    </header>

    <dl class="minutes-meta mt-5 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
      <div v-if="m.chairperson" class="flex gap-2">
        <dt class="font-semibold">Chairperson:</dt>
        <dd>{{ m.chairperson }}</dd>
      </div>
      <div v-if="m.secretary" class="flex gap-2">
        <dt class="font-semibold">Minutes taken by:</dt>
        <dd>{{ m.secretary }}</dd>
      </div>
    </dl>

    <!-- Attendance -->
    <section v-if="attendance.length" class="minutes-section">
      <h2>{{ num('attendance') }} Attendance</h2>
      <div v-for="g in attendance" :key="g.label" class="mt-2 text-sm leading-relaxed">
        <span class="font-semibold">{{ g.label }} ({{ g.names.length }}):</span>
        {{ g.names.join(', ') }}
      </div>
      <p class="mt-2 text-sm">
        {{ m.quorumPresent ? 'A quorum was present.' : 'A quorum was not present.' }}
      </p>
    </section>

    <!-- Opening -->
    <section v-if="hasOpening" class="minutes-section">
      <h2>{{ num('opening') }} Opening</h2>
      <p v-if="m.startTime || m.chairperson" class="text-sm leading-relaxed">
        The meeting was called to order
        <template v-if="m.startTime">at {{ formatMeetingTime(m.startTime) }}</template>
        <template v-if="m.chairperson"> by {{ m.chairperson }}</template
        >.
      </p>
      <p v-if="m.openingPrayerBy" class="text-sm leading-relaxed">
        Opening prayer was offered by {{ m.openingPrayerBy }}.
      </p>
      <p v-if="m.openingRemarks" class="mt-2 text-sm leading-relaxed whitespace-pre-line">
        {{ m.openingRemarks }}
      </p>
    </section>

    <!-- Previous minutes -->
    <section v-if="hasPrevious" class="minutes-section">
      <h2>{{ num('previous') }} Minutes of the previous meeting</h2>
      <p v-if="pm.readBy" class="text-sm leading-relaxed">
        The minutes of the previous meeting were read by {{ pm.readBy }}.
      </p>
      <p v-if="pm.corrections" class="mt-2 text-sm leading-relaxed whitespace-pre-line">
        <span class="font-semibold">Corrections:</span> {{ pm.corrections }}
      </p>
      <p class="mt-2 text-sm leading-relaxed">
        <template v-if="pm.adopted">
          The minutes were adopted as a true record<template v-if="pm.movedBy">
            on a motion by {{ pm.movedBy }}</template
          ><template v-if="pm.secondedBy">, seconded by {{ pm.secondedBy }}</template
          >.
        </template>
        <template v-else>The minutes were not adopted at this meeting.</template>
      </p>
    </section>

    <!-- Matters arising, reports, new business, AOB -->
    <section v-for="block in blocks" :key="block.key" class="minutes-section">
      <h2>{{ num(block.key) }} {{ block.heading }}</h2>
      <ol class="mt-2 flex flex-col gap-4">
        <li v-for="(item, i) in block.items" :key="item.id" class="minutes-item">
          <h3 class="text-[15px] font-semibold">
            {{ String.fromCharCode(97 + (i % 26)) }}. {{ item.title || 'Untitled' }}
            <span v-if="item.presentedBy" class="font-normal text-ink-muted">
              — {{ item.presentedBy }}
            </span>
          </h3>
          <p v-if="item.discussion" class="mt-1 text-sm leading-relaxed whitespace-pre-line">
            {{ item.discussion }}
          </p>
          <p v-if="item.resolution" class="mt-1.5 text-sm leading-relaxed whitespace-pre-line">
            <span class="font-semibold">Resolved:</span> {{ item.resolution }}
          </p>
          <p
            v-if="item.movedBy || item.secondedBy || item.outcome"
            class="mt-1 text-[13px] text-ink-muted"
          >
            <template v-if="item.movedBy">Moved by {{ item.movedBy }}</template>
            <template v-if="item.secondedBy">
              {{ item.movedBy ? '; seconded' : 'Seconded' }} by {{ item.secondedBy }}</template
            >
            <template v-if="item.outcome">
              {{ item.movedBy || item.secondedBy ? '— ' : ''
              }}<strong class="text-ink">{{ outcomeLabel(item.outcome) }}</strong></template
            >.
          </p>
        </li>
      </ol>
    </section>

    <!-- Action points -->
    <section v-if="actionPoints.length" class="minutes-section">
      <h2>{{ num('actions') }} Action points</h2>
      <table class="mt-2 w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-ink text-left">
            <th class="py-1.5 pr-3 font-semibold">Action</th>
            <th class="py-1.5 pr-3 font-semibold">Responsible</th>
            <th class="py-1.5 pr-3 font-semibold">Due</th>
            <th class="py-1.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in actionPoints" :key="a.id" class="border-b border-rule align-top">
            <td class="py-1.5 pr-3">{{ a.task }}</td>
            <td class="py-1.5 pr-3">{{ a.assignedTo || '—' }}</td>
            <td class="num py-1.5 pr-3 whitespace-nowrap">{{ a.dueDate || '—' }}</td>
            <td class="py-1.5">{{ a.done ? 'Done' : 'Open' }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Announcements -->
    <section v-if="m.announcements" class="minutes-section">
      <h2>{{ num('announcements') }} Announcements</h2>
      <p class="text-sm leading-relaxed whitespace-pre-line">{{ m.announcements }}</p>
    </section>

    <!-- Next meeting -->
    <section v-if="hasNext" class="minutes-section">
      <h2>{{ num('next') }} Next meeting</h2>
      <p class="text-sm leading-relaxed">
        The next meeting will hold
        <template v-if="m.nextMeeting.date"
          >on {{ formatMeetingDate(m.nextMeeting.date) }}</template
        >
        <template v-if="m.nextMeeting.time">
          at {{ formatMeetingTime(m.nextMeeting.time) }}</template
        >
        <template v-if="m.nextMeeting.venue">, {{ m.nextMeeting.venue }}</template
        >.
      </p>
    </section>

    <!-- Closing -->
    <section v-if="hasClosing" class="minutes-section">
      <h2>{{ num('closing') }} Closing</h2>
      <p class="text-sm leading-relaxed">
        <template v-if="m.adjournedAt"
          >The meeting was adjourned at {{ formatMeetingTime(m.adjournedAt) }}.
        </template>
        <template v-if="m.closingPrayerBy"
          >Closing prayer was offered by {{ m.closingPrayerBy }}.</template
        >
      </p>
    </section>

    <!-- Signatures -->
    <footer class="minutes-signatures mt-12 grid gap-10 text-sm sm:grid-cols-2">
      <div>
        <div class="h-10 border-b border-ink"></div>
        <p class="mt-1.5 font-semibold">{{ m.chairperson || 'Chairperson' }}</p>
        <p class="text-ink-muted">Chairperson</p>
      </div>
      <div>
        <div class="h-10 border-b border-ink"></div>
        <p class="mt-1.5 font-semibold">{{ m.secretary || 'Secretary' }}</p>
        <p class="text-ink-muted">Secretary</p>
      </div>
      <p v-if="m.status === 'approved'" class="text-ink-muted sm:col-span-2">
        Approved as a true record<template v-if="m.approvedOn">
          on {{ formatMeetingDate(m.approvedOn) }}</template
        >.
      </p>
    </footer>
  </article>
</template>

<style scoped>
.minutes-section {
  margin-top: 1.75rem;
  break-inside: avoid-page;
}
.minutes-section h2 {
  font-family: var(--font-display);
  font-size: 1.375rem;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}
.minutes-item {
  break-inside: avoid;
}
.minutes-signatures {
  break-inside: avoid;
}
</style>
