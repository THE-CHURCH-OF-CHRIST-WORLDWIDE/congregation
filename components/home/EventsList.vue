<script setup lang="ts">
const settingsStore = useChurchSettingsStore()
onMounted(() => settingsStore.load())

const events = computed(() => settingsStore.settings.homepageEvents)

const { el: sectionRef, isVisible } = useScrollReveal()
</script>

<template>
  <section id="events" ref="sectionRef" class="scroll-mt-20 bg-canvas py-16 md:py-24">
    <div class="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <div
        :class="[
          'mb-10 flex items-end justify-between gap-6 md:mb-12',
          'reveal',
          isVisible && 'is-visible',
        ]"
      >
        <SectionHeader
          class="mb-0! md:mb-0!"
          title="Upcoming Events"
          subtitle="Stay connected with what's happening in the congregation."
        />
        <NuxtLink
          to="/events"
          class="hidden min-h-11 shrink-0 items-center gap-1.5 text-base font-semibold text-primary-ink underline-offset-3 hover:text-primary-hover hover:underline sm:flex"
          aria-label="View all events"
        >
          View All Events
          <Icon icon="mdi:arrow-right" class="h-5 w-5" />
        </NuxtLink>
      </div>

      <LoadingState v-if="settingsStore.loading" title="Loading events…" />
      <EmptyState
        v-else-if="!events.length"
        icon="mdi:calendar-blank-outline"
        title="No upcoming events"
        description="New gatherings are announced here. Please check back soon."
      />

      <!-- The visitors' book: one ruled entry per event, date in the left column -->
      <div v-else class="divide-y divide-rule border-y border-rule-strong">
        <div
          v-for="(event, i) in events"
          :key="event.id"
          :class="['reveal', isVisible && 'is-visible']"
          :style="{ transitionDelay: `${100 + i * 90}ms` }"
        >
          <div
            class="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-x-6 gap-y-4 py-6 sm:flex"
          >
            <!-- Date column, with the event's colour as a small key mark -->
            <div class="flex w-16 shrink-0 flex-col items-start sm:w-20">
              <span class="num font-display text-4xl leading-none font-bold text-secondary">{{
                event.day
              }}</span>
              <span class="stamp mt-1.5 flex items-center gap-1.5">
                <span
                  :class="['inline-block size-2 shrink-0 rounded-full', event.colorClass]"
                  aria-hidden="true"
                ></span>
                {{ event.month }}
              </span>
            </div>

            <!-- Event info -->
            <div class="min-w-0 flex-1">
              <h3 class="font-display text-lg leading-snug font-semibold text-ink md:text-xl">
                {{ event.title }}
              </h3>
              <div
                class="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-base text-ink-muted"
              >
                <span class="flex items-center gap-1.5">
                  <Icon icon="mdi:map-marker-outline" class="h-5 w-5 shrink-0 text-ink-subtle" />
                  {{ event.location }}
                </span>
                <span class="num flex items-center gap-1.5">
                  <Icon icon="mdi:clock-outline" class="h-5 w-5 shrink-0 text-ink-subtle" />
                  {{ event.time }}
                </span>
              </div>
            </div>

            <!-- CTA — homepage events have no detail page of their own, so this
                 goes to the full events listing. -->
            <NuxtLink
              to="/events"
              class="col-start-2 inline-flex min-h-11 justify-self-start shrink-0 items-center justify-center gap-1.5 rounded-md border border-rule-strong bg-surface px-4 text-base font-semibold text-ink shadow-xs transition-colors duration-150 hover:border-ink-subtle hover:bg-surface-muted"
              :aria-label="`View details for ${event.title}`"
            >
              Details
              <Icon icon="mdi:chevron-right" class="h-5 w-5 text-ink-subtle" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
