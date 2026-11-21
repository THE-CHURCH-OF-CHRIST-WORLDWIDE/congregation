<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.activityCalendar)
</script>

<template>
  <section class="section field-stone">
    <div class="site-container grid items-start gap-12 lg:grid-cols-12 lg:gap-8">
      <!-- Header -->
      <div class="lg:col-span-4">
        <h2 class="t-h2 max-w-[12ch] text-secondary">
          <SplitReveal :text="cfg.heading" />
        </h2>
        <p v-if="cfg.eyebrow" v-reveal.150 class="t-label mt-6 text-ink-subtle">
          {{ cfg.eyebrow }}
        </p>
        <p v-if="cfg.subtitle" v-reveal.200 class="t-lede mt-5 max-w-[36ch]">
          {{ cfg.subtitle }}
        </p>
      </div>

      <!-- The weekly timetable -->
      <div
        v-reveal.150
        class="-mx-[var(--site-gutter)] overflow-x-auto px-[var(--site-gutter)] lg:col-span-7 lg:col-start-6 lg:mx-0 lg:px-0"
      >
        <table class="w-full min-w-[22rem] text-left">
          <thead>
            <tr class="border-b border-ink/80">
              <th class="t-label pr-4 pb-3 font-semibold whitespace-nowrap text-ink-subtle">Day</th>
              <th class="t-label pr-4 pb-3 font-semibold whitespace-nowrap text-ink-subtle">
                Activity
              </th>
              <th class="t-label pb-3 text-right font-semibold whitespace-nowrap text-ink-subtle">
                Time
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in cfg.rows" :key="row.id" class="border-b border-rule-strong">
              <td class="num py-5 pr-4 align-baseline text-[0.9375rem] text-ink-muted">
                {{ row.day }}
              </td>
              <td
                class="py-5 pr-4 align-baseline font-display text-[1.375rem] leading-tight text-ink md:text-[1.625rem]"
              >
                {{ row.activity }}
              </td>
              <td
                class="num py-5 text-right align-baseline font-display text-[1.375rem] leading-tight whitespace-nowrap text-ink md:text-[1.625rem]"
              >
                {{ row.time }}
              </td>
            </tr>

            <tr v-if="!cfg.rows.length" class="border-b border-rule-strong">
              <td colspan="3">
                <EmptyState
                  icon="mdi:calendar-blank-outline"
                  size="sm"
                  title="No activities scheduled"
                  description="Our weekly calendar will be published here soon."
                />
              </td>
            </tr>

            <!-- Footer row -->
            <tr>
              <td colspan="3" class="pt-6">
                <NuxtLink to="/about-us" class="link-line text-sm text-ink">
                  <span class="link-text">Get more information</span>
                  <Icon icon="mdi:arrow-right" class="link-arrow h-4 w-4" aria-hidden="true" />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
