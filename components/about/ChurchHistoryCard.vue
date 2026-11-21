<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.aboutHistory)
</script>

<template>
  <section class="bg-canvas py-16 md:py-24">
    <div
      class="mx-auto grid max-w-6xl gap-8 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12 lg:px-8"
    >
      <!-- The letter: a single featured entry, so it carries the red margin -->
      <article
        class="rounded-lg border border-rule bg-surface px-5 py-8 shadow-xs sm:px-10 sm:py-12"
      >
        <div class="margin-rule">
          <!-- Heading -->
          <h2
            class="font-display text-[1.75rem] leading-[1.2] font-bold text-secondary md:text-[2.25rem]"
          >
            {{ cfg.heading }}
          </h2>

          <!-- Former eyebrow, now a citation line below the heading -->
          <p v-if="cfg.eyebrow" class="citation mt-3">
            {{ cfg.eyebrow }}
          </p>

          <div class="max-w-[68ch]">
            <!-- Opening paragraph -->
            <p class="mt-7 text-[17px] leading-relaxed text-ink">
              {{ cfg.openingParagraph }}
            </p>

            <!-- Founders list -->
            <p v-if="cfg.foundersHeading" class="mt-8 font-display text-lg font-semibold text-ink">
              {{ cfg.foundersHeading }}
            </p>
            <ol
              v-if="cfg.founders.length"
              class="mt-3 list-decimal divide-y divide-rule border-y border-rule pl-7 text-base text-ink marker:font-display marker:text-ink-subtle"
            >
              <li v-for="founder in cfg.founders" :key="founder.id" class="num py-2.5 pl-1">
                {{ founder.name }}
              </li>
            </ol>

            <!-- Growth paragraph -->
            <p class="mt-8 text-[17px] leading-relaxed text-ink">
              {{ cfg.growthParagraph }}
            </p>

            <!-- Services schedule: ruled rows, time in the left column -->
            <div v-if="cfg.schedule.length" class="mt-9">
              <p
                v-if="cfg.scheduleHeading"
                class="mb-3 font-display text-lg font-semibold text-ink"
              >
                {{ cfg.scheduleHeading }}
              </p>
              <div class="divide-y divide-rule border-y border-rule">
                <div
                  v-for="(row, i) in cfg.schedule"
                  :key="i"
                  :class="[
                    'grid grid-cols-[minmax(6.5rem,auto)_1fr] items-baseline gap-x-6 px-3 py-3 text-base',
                    i % 2 === 0 ? 'bg-surface' : 'bg-surface-muted/60',
                  ]"
                >
                  <span class="num font-display font-semibold whitespace-nowrap text-ink">{{
                    row.time
                  }}</span>
                  <span class="text-ink-muted">{{ row.label }}</span>
                </div>
              </div>
            </div>

            <!-- Closing paragraph -->
            <p class="mt-9 text-[17px] leading-relaxed text-ink">
              {{ cfg.closingParagraph }}
            </p>
          </div>

          <!-- Signature block -->
          <div class="mt-10 border-t border-rule pt-6">
            <p class="font-display text-lg font-semibold text-ink">{{ cfg.signatureName }}</p>
            <p class="stamp mt-1">
              {{ cfg.signatureRole }}
            </p>
          </div>
        </div>
      </article>

      <!-- Photographs from the congregation's history (desktop only) -->
      <div class="hidden content-start gap-3 md:grid md:grid-cols-4 lg:grid-cols-2">
        <img
          v-if="cfg.cornerImages[0]"
          :src="displayableImageUrl(cfg.cornerImages[0])"
          alt=""
          loading="lazy"
          decoding="async"
          class="aspect-square w-full rounded-md border border-rule object-cover"
        />
        <img
          v-if="cfg.cornerImages[1]"
          :src="displayableImageUrl(cfg.cornerImages[1])"
          alt=""
          loading="lazy"
          decoding="async"
          class="aspect-square w-full rounded-md border border-rule object-cover"
        />
        <img
          v-if="cfg.cornerImages[2]"
          :src="displayableImageUrl(cfg.cornerImages[2])"
          alt=""
          loading="lazy"
          decoding="async"
          class="aspect-square w-full rounded-md border border-rule object-cover"
        />
        <img
          v-if="cfg.cornerImages[3]"
          :src="displayableImageUrl(cfg.cornerImages[3])"
          alt=""
          loading="lazy"
          decoding="async"
          class="aspect-square w-full rounded-md border border-rule object-cover"
        />
      </div>
    </div>
  </section>
</template>
