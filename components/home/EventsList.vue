<script setup lang="ts">
const { EVENTS } = usePublicMockData()

const { el: sectionRef, isVisible } = useScrollReveal()
</script>

<template>
  <section ref="sectionRef" id="events" class="bg-[#F8F9FA] py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div :class="['mb-10 flex items-end justify-between', 'reveal', isVisible && 'is-visible']">
        <SectionHeader title="Upcoming Events" subtitle="Stay connected with what's happening in the congregation." />
        <NuxtLink
          to="/events"
          class="hidden shrink-0 items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline sm:flex"
          aria-label="View all events"
        >
          View All Events
          <Icon icon="heroicons:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>

      <div class="flex flex-col gap-4">
        <div
          v-for="(event, i) in EVENTS"
          :key="event.id"
          :class="['reveal', isVisible && 'is-visible']"
          :style="{ transitionDelay: `${100 + i * 90}ms` }"
        >
        <div class="flex items-center gap-5 rounded-xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <!-- Color left border + date block -->
          <div :class="['flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white', event.colorClass]">
            <span class="text-xl font-bold leading-none">{{ event.day }}</span>
            <span class="text-xs font-semibold tracking-wider">{{ event.month }}</span>
          </div>

          <!-- Event info -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-[#1E3A5F] leading-snug">{{ event.title }}</h3>
            <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <Icon icon="heroicons:map-pin" class="h-3.5 w-3.5 shrink-0" />
                {{ event.location }}
              </span>
              <span class="flex items-center gap-1">
                <Icon icon="heroicons:clock" class="h-3.5 w-3.5 shrink-0" />
                {{ event.time }}
              </span>
            </div>
          </div>

          <!-- CTA -->
          <button
            class="shrink-0 rounded-full border border-[#2563EB] px-4 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 transition-colors"
            aria-label="View event details"
          >
            Details
          </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
