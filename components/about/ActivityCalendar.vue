<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.activityCalendar)
</script>

<template>
  <section class="bg-[#F8F9FA] py-16">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-10 text-center">
        <p
          v-if="cfg.eyebrow"
          class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400"
        >
          {{ cfg.eyebrow }}
        </p>
        <h2 class="mt-2 font-serif text-3xl font-bold text-gray-900">{{ cfg.heading }}</h2>
        <p v-if="cfg.subtitle" class="mx-auto mt-3 max-w-md text-sm text-gray-500">
          {{ cfg.subtitle }}
        </p>
      </div>

      <!-- Table card -->
      <div class="mx-auto max-w-[680px] overflow-hidden rounded-xl bg-white shadow-sm">
        <table class="w-full text-sm">
          <!-- Header -->
          <thead>
            <tr class="bg-navy text-white">
              <th class="py-3.5 px-6 text-left font-medium tracking-wide">Day</th>
              <th class="py-3.5 px-6 text-left font-medium tracking-wide">Activity</th>
              <th class="py-3.5 px-6 text-left font-medium tracking-wide">Time</th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody>
            <tr
              v-for="(row, i) in cfg.rows"
              :key="row.id"
              :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
            >
              <td class="py-3 px-6 text-gray-600">{{ row.day }}</td>
              <td class="py-3 px-6 font-medium text-gray-900">{{ row.activity }}</td>
              <td class="py-3 px-6 text-gray-600">{{ row.time }}</td>
            </tr>

            <!-- Footer row -->
            <tr class="border-t border-gray-100 bg-white">
              <td colspan="3" class="py-3.5 px-6 text-center">
                <NuxtLink
                  to="/about-us"
                  class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Get more information &rarr;
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
