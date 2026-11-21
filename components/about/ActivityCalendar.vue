<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.activityCalendar)
</script>

<template>
  <section class="bg-canvas py-16 md:py-24">
    <div
      class="mx-auto grid max-w-7xl items-start gap-10 px-5 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16 lg:px-8"
    >
      <!-- Header -->
      <div class="margin-rule">
        <h2
          class="font-display text-[1.875rem] leading-[1.15] font-bold text-secondary md:text-[2.5rem]"
        >
          {{ cfg.heading }}
        </h2>
        <p v-if="cfg.eyebrow" class="citation mt-3">
          {{ cfg.eyebrow }}
        </p>
        <p v-if="cfg.subtitle" class="mt-3 max-w-md text-lg leading-relaxed text-ink-muted">
          {{ cfg.subtitle }}
        </p>
      </div>

      <!-- The weekly register -->
      <div class="overflow-x-auto rounded-lg border border-rule bg-surface shadow-xs">
        <table class="w-full text-base">
          <!-- Header -->
          <thead class="bg-surface-muted">
            <tr>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase sm:px-6"
              >
                Day
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase sm:px-6"
              >
                Activity
              </th>
              <th
                class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-ink-muted uppercase sm:px-6"
              >
                Time
              </th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody class="divide-y divide-rule">
            <tr
              v-for="(row, i) in cfg.rows"
              :key="row.id"
              :class="i % 2 === 0 ? 'bg-surface' : 'bg-surface-muted/50'"
            >
              <td class="num px-4 py-3.5 font-display font-semibold text-ink sm:px-6">
                {{ row.day }}
              </td>
              <td class="px-4 py-3.5 text-ink sm:px-6">{{ row.activity }}</td>
              <td class="num px-4 py-3.5 whitespace-nowrap text-ink-muted sm:px-6">
                {{ row.time }}
              </td>
            </tr>

            <tr v-if="!cfg.rows.length">
              <td colspan="3" class="px-6">
                <EmptyState
                  icon="mdi:calendar-blank-outline"
                  size="sm"
                  title="No activities scheduled"
                  description="Our weekly calendar will be published here soon."
                />
              </td>
            </tr>

            <!-- Footer row -->
            <tr class="bg-surface">
              <td colspan="3" class="px-4 py-3 sm:px-6">
                <NuxtLink
                  to="/about-us"
                  class="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-ink underline underline-offset-3 transition-colors duration-150 hover:text-primary-hover"
                >
                  Get more information
                  <Icon icon="mdi:arrow-right" aria-hidden="true" />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
