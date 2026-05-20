<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.worshipActivities)
</script>

<template>
  <section class="bg-navy py-16">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <p
          v-if="cfg.eyebrow"
          class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300"
        >
          {{ cfg.eyebrow }}
        </p>
        <h2 class="mt-2 font-serif text-3xl font-bold text-white">{{ cfg.heading }}</h2>
        <p v-if="cfg.subtitle" class="mx-auto mt-3 max-w-xl text-sm text-white/60">
          {{ cfg.subtitle }}
        </p>
      </div>

      <!-- Cards row -->
      <div class="flex flex-wrap justify-center gap-4">
        <div
          v-for="activity in cfg.items"
          :key="activity.id"
          class="flex min-w-[130px] flex-1 basis-[130px] flex-col items-center rounded-xl bg-white px-5 py-7 shadow-sm transition-shadow hover:shadow-md sm:basis-[150px]"
        >
          <!-- Icon -->
          <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Icon :icon="activity.icon" class="h-7 w-7 text-blue-600" />
          </div>

          <!-- Name -->
          <span class="text-[14px] font-semibold text-gray-900">{{ activity.name }}</span>

          <!-- Scripture ref -->
          <span class="mt-1 text-[11px] text-gray-400">{{ activity.scripture }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
