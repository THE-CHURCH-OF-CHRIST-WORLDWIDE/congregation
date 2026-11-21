<script setup lang="ts">
const settingsStore = useChurchSettingsStore()
onMounted(() => settingsStore.load())

const events = computed(() => settingsStore.settings.homepageEvents)
</script>

<template>
  <section id="events" class="section field-stone scroll-mt-20">
    <div class="site-container">
      <div class="grid gap-6 md:grid-cols-12 md:items-end">
        <SectionHeader
          class="mb-0! md:col-span-8 md:mb-0!"
          title="Upcoming Events"
          subtitle="Stay connected with what's happening in the congregation."
        />
        <div class="md:col-span-4 md:text-right">
          <NuxtLink
            v-reveal.200
            to="/events"
            class="link-line text-base text-ink"
            aria-label="View all events"
          >
            <span class="link-text">View All Events</span>
            <Icon icon="mdi:arrow-right" class="link-arrow h-5 w-5" />
          </NuxtLink>
        </div>
      </div>

      <div class="mt-14 md:mt-20">
        <LoadingState v-if="settingsStore.loading" title="Loading events…" />
        <EditorialNote
          v-else-if="!events.length"
          title="No upcoming events"
          description="New gatherings are announced here. Please check back soon."
        />

        <!-- A programme: one ruled entry per event, the date set large in the margin -->
        <ol v-else class="border-t border-ink/80">
          <li
            v-for="(event, i) in events"
            :key="event.id"
            v-reveal="{ delay: 80 + i * 90 }"
            class="border-b border-rule-strong"
          >
            <!-- Homepage events have no detail page of their own, so each entry
                 goes to the full events listing. -->
            <NuxtLink
              to="/events"
              class="event-row group grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-5 gap-y-3 py-7 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-x-8 md:py-9"
              :aria-label="`View details for ${event.title}`"
            >
              <!-- Date: numeral and month, with the event's colour as a small key mark -->
              <div class="flex flex-col">
                <span
                  class="num font-display text-[3.5rem] leading-[0.85] text-ink sm:text-[5rem]"
                  >{{ event.day }}</span
                >
                <span class="stamp mt-2 flex items-center gap-1.5">
                  <span
                    :class="['inline-block size-1.5 shrink-0 rounded-full', event.colorClass]"
                    aria-hidden="true"
                  ></span>
                  {{ event.month }}
                </span>
              </div>

              <div class="min-w-0">
                <h3
                  class="font-display text-[1.75rem] leading-[1.1] text-ink transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5 group-hover:text-primary-ink md:text-[2.25rem]"
                >
                  {{ event.title }}
                </h3>
                <div
                  class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[0.9375rem] text-ink-muted"
                >
                  <span class="flex items-center gap-1.5">
                    <Icon icon="mdi:map-marker-outline" class="h-4 w-4 shrink-0 text-accent" />
                    {{ event.location }}
                  </span>
                  <span class="num flex items-center gap-1.5">
                    <Icon icon="mdi:clock-outline" class="h-4 w-4 shrink-0 text-accent" />
                    {{ event.time }}
                  </span>
                </div>
              </div>

              <span
                class="col-start-2 inline-flex items-center gap-2 text-sm font-semibold text-ink sm:col-start-3"
              >
                Details
                <span
                  class="flex size-11 items-center justify-center rounded-full border border-rule-strong transition-[background-color,border-color,color] duration-500 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary"
                  aria-hidden="true"
                >
                  <Icon icon="mdi:arrow-right" class="h-4 w-4" />
                </span>
              </span>
            </NuxtLink>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
