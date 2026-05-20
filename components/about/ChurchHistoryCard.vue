<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.aboutHistory)
</script>

<template>
  <section class="bg-white py-20">
    <div class="mx-auto max-w-4xl px-4 sm:px-8 lg:px-8">
      <!-- Outer wrapper that gives room for overflowing corner images -->
      <div class="relative px-4 pt-10 pb-10 md:px-10">
        <!-- Corner decorative images (desktop only) -->
        <img
          v-if="cfg.cornerImages[0]"
          :src="cfg.cornerImages[0]"
          alt=""
          class="absolute -top-8 -left-8 z-10 hidden h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-lg md:block"
        />
        <img
          v-if="cfg.cornerImages[1]"
          :src="cfg.cornerImages[1]"
          alt=""
          class="absolute -top-8 -right-8 z-10 hidden h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-lg md:block"
        />
        <img
          v-if="cfg.cornerImages[2]"
          :src="cfg.cornerImages[2]"
          alt=""
          class="absolute -bottom-8 -left-8 z-10 hidden h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-lg md:block"
        />
        <img
          v-if="cfg.cornerImages[3]"
          :src="cfg.cornerImages[3]"
          alt=""
          class="absolute -bottom-8 -right-8 z-10 hidden h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-lg md:block"
        />

        <!-- Paper card -->
        <div
          class="rounded-xl border border-amber-100 bg-[#FDFCF8] px-6 py-10 shadow-md sm:px-10 sm:py-12"
        >
          <!-- Eyebrow -->
          <p
            v-if="cfg.eyebrow"
            class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400"
          >
            {{ cfg.eyebrow }}
          </p>

          <!-- Heading -->
          <h2 class="mt-2 text-lg font-bold leading-snug text-gray-900 md:text-xl">
            {{ cfg.heading }}
          </h2>

          <!-- Opening paragraph -->
          <p class="mt-6 text-sm leading-relaxed text-gray-700">
            {{ cfg.openingParagraph }}
          </p>

          <!-- Founders list -->
          <p v-if="cfg.foundersHeading" class="mt-7 font-semibold text-gray-800">
            {{ cfg.foundersHeading }}
          </p>
          <ol
            v-if="cfg.founders.length"
            class="mt-2 list-decimal space-y-1.5 pl-6 text-sm text-gray-700"
          >
            <li v-for="founder in cfg.founders" :key="founder.id">{{ founder.name }}</li>
          </ol>

          <!-- Growth paragraph -->
          <p class="mt-7 text-sm leading-relaxed text-gray-700">
            {{ cfg.growthParagraph }}
          </p>

          <!-- Services schedule mini-table -->
          <div v-if="cfg.schedule.length" class="mt-8">
            <p v-if="cfg.scheduleHeading" class="mb-3 text-sm font-semibold text-gray-800">
              {{ cfg.scheduleHeading }}
            </p>
            <div class="overflow-hidden rounded-lg border border-gray-100">
              <div
                v-for="(row, i) in cfg.schedule"
                :key="i"
                :class="[
                  'grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-2.5 text-sm',
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                ]"
              >
                <span class="text-gray-700">{{ row.label }}</span>
                <span class="font-semibold whitespace-nowrap text-gray-900">{{ row.time }}</span>
              </div>
            </div>
          </div>

          <!-- Closing paragraph -->
          <p class="mt-8 text-sm leading-relaxed text-gray-700">
            {{ cfg.closingParagraph }}
          </p>

          <!-- Signature block -->
          <div class="mt-8 border-t border-gray-200 pt-6">
            <p class="font-semibold text-gray-900">{{ cfg.signatureName }}</p>
            <p class="mt-0.5 text-xs text-gray-500">
              {{ cfg.signatureRole }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
