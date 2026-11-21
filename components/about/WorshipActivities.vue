<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.worshipActivities)
</script>

<template>
  <section class="section field-forest">
    <div class="site-container grid gap-12 lg:grid-cols-12 lg:gap-8">
      <!-- Header -->
      <div class="lg:col-span-5">
        <h2 class="t-h2 max-w-[14ch] text-on-night">
          <SplitReveal :text="cfg.heading" />
        </h2>
        <p v-if="cfg.eyebrow" v-reveal.150 class="t-label mt-6 text-champagne">
          {{ cfg.eyebrow }}
        </p>
        <p v-if="cfg.subtitle" v-reveal.200 class="t-lede mt-5 max-w-[40ch] text-on-night-muted">
          {{ cfg.subtitle }}
        </p>
      </div>

      <div class="lg:col-span-7">
        <div v-if="!cfg.items.length" class="bg-surface">
          <EmptyState
            icon="mdi:hands-pray"
            title="No worship activities listed"
            description="Details of how we worship will be shared here soon."
          />
        </div>

        <!-- The acts of worship, as a ruled register -->
        <ol v-else class="border-t border-on-night/40">
          <li
            v-for="(activity, i) in cfg.items"
            :key="activity.id"
            v-reveal="{ delay: 80 + Math.min(i, 6) * 80 }"
            class="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-on-night/15 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-x-6 md:py-7"
          >
            <!-- Icon -->
            <Icon :icon="activity.icon" class="size-6 text-champagne" aria-hidden="true" />

            <!-- Name -->
            <span
              class="font-display text-[1.875rem] leading-[1.05] text-on-night md:text-[2.5rem]"
              >{{ activity.name }}</span
            >

            <!-- Scripture ref -->
            <span class="num t-label text-right text-on-night-muted">{{ activity.scripture }}</span>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
