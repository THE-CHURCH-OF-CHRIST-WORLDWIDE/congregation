<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.worshipActivities)
</script>

<template>
  <section class="bookcloth py-16 md:py-24">
    <div class="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-10 max-w-2xl md:mb-12">
        <h2
          class="font-display text-[1.875rem] leading-[1.15] font-bold text-white md:text-[2.5rem]"
        >
          {{ cfg.heading }}
        </h2>
        <p v-if="cfg.eyebrow" class="mt-3 text-[15px] font-medium text-white/80">
          {{ cfg.eyebrow }}
        </p>
        <p v-if="cfg.subtitle" class="mt-3 text-lg leading-relaxed text-white/80">
          {{ cfg.subtitle }}
        </p>
      </div>

      <div v-if="!cfg.items.length" class="rounded-lg bg-surface shadow-xs">
        <EmptyState
          icon="mdi:hands-pray"
          title="No worship activities listed"
          description="Details of how we worship will be shared here soon."
        />
      </div>

      <!-- Ruled register of the acts of worship -->
      <div
        v-else
        class="grid max-w-4xl divide-y divide-white/15 border-y border-white/15 md:grid-cols-2 md:gap-x-12 md:divide-y-0 md:[&>*]:border-b md:[&>*]:border-white/15"
      >
        <div
          v-for="activity in cfg.items"
          :key="activity.id"
          class="flex min-h-16 items-center gap-4 py-4"
        >
          <!-- Icon -->
          <Icon :icon="activity.icon" class="size-6 shrink-0 text-[#f2d593]" aria-hidden="true" />

          <!-- Name -->
          <span class="flex-1 font-display text-lg leading-snug font-semibold text-white">{{
            activity.name
          }}</span>

          <!-- Scripture ref -->
          <span class="num shrink-0 text-right text-[15px] text-white/80">{{
            activity.scripture
          }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
