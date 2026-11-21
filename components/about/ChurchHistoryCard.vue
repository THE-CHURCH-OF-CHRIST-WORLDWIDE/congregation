<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.aboutHistory)

// Presentational only: the pull quote repeats the first sentence of the growth paragraph,
// as a printed long-read would. It is aria-hidden, so screen readers hear the text once.
const pullQuote = computed(() => {
  const text = (cfg.value.growthParagraph || '').trim()
  const match = text.match(/^.+?[.!?](?=\s|$)/)
  return (match ? match[0] : text).trim()
})
const cornerImages = computed(() => cfg.value.cornerImages.slice(0, 4).filter(Boolean))
</script>

<template>
  <section class="section bg-surface">
    <div class="site-container grid gap-12 lg:grid-cols-12 lg:gap-8">
      <!-- ── Left: the title of the piece, and photographs from the congregation's history ── -->
      <header class="lg:col-span-4">
        <div class="lg:sticky lg:top-[calc(var(--nav-h)+2.5rem)]">
          <h2 class="t-h2 text-secondary">
            <SplitReveal :text="cfg.heading" />
          </h2>
          <p v-if="cfg.eyebrow" v-reveal.150 class="t-label mt-6 text-ink-subtle">
            {{ cfg.eyebrow }}
          </p>

          <div
            v-if="cornerImages.length"
            class="mt-10 hidden grid-cols-4 gap-3 sm:grid lg:mt-14 lg:grid-cols-2"
          >
            <div
              v-for="(img, i) in cornerImages"
              :key="i"
              v-reveal="{ type: 'unveil', delay: 150 + i * 120 }"
              :class="[
                'img-zoom aspect-[4/5] overflow-hidden bg-surface-sunken',
                i % 2 === 1 ? 'lg:translate-y-8' : '',
              ]"
            >
              <img
                :src="displayableImageUrl(img)"
                alt=""
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <!-- ── Right: the history, told as a long-read ── -->
      <article class="lg:col-span-7 lg:col-start-6">
        <div v-reveal class="max-w-[64ch] text-lg leading-[1.8] text-ink">
          <p class="first-paragraph">
            <span class="sr-only">{{ cfg.openingParagraph }}</span>
            <span aria-hidden="true"
              ><span class="drop-cap">{{ (cfg.openingParagraph || '').charAt(0) }}</span
              >{{ (cfg.openingParagraph || '').slice(1) }}</span
            >
          </p>
        </div>

        <!-- Founders: a numbered register -->
        <div v-if="cfg.founders.length || cfg.foundersHeading" v-reveal class="mt-14 max-w-[64ch]">
          <p v-if="cfg.foundersHeading" class="t-label text-ink-subtle">
            {{ cfg.foundersHeading }}
          </p>
          <ol v-if="cfg.founders.length" class="mt-5 border-t border-ink/80">
            <li
              v-for="(founder, i) in cfg.founders"
              :key="founder.id"
              class="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline border-b border-rule py-4"
            >
              <span class="num font-display text-2xl leading-none text-accent">{{
                String(i + 1).padStart(2, '0')
              }}</span>
              <span class="text-[1.0625rem] text-ink">{{ founder.name }}</span>
            </li>
          </ol>
        </div>

        <!-- Pull quote -->
        <figure
          v-if="pullQuote"
          v-reveal
          aria-hidden="true"
          class="my-16 border-y border-rule py-10 md:-ml-[8%] md:py-12"
        >
          <span class="mb-5 block h-px w-14 bg-accent"></span>
          <blockquote
            class="font-display text-[clamp(1.875rem,3.2vw,2.75rem)] leading-[1.14] text-secondary italic"
          >
            &ldquo;{{ pullQuote }}&rdquo;
          </blockquote>
        </figure>

        <div class="max-w-[64ch] text-lg leading-[1.8] text-ink">
          <p v-reveal>{{ cfg.growthParagraph }}</p>
        </div>

        <!-- Services schedule: ruled rows, the time set large in the margin -->
        <div v-if="cfg.schedule.length" v-reveal class="mt-14 max-w-[64ch]">
          <p v-if="cfg.scheduleHeading" class="t-label text-ink-subtle">
            {{ cfg.scheduleHeading }}
          </p>
          <div class="mt-5 border-t border-ink/80">
            <div
              v-for="(row, i) in cfg.schedule"
              :key="i"
              class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-x-6 border-b border-rule py-4 sm:grid-cols-[9rem_minmax(0,1fr)]"
            >
              <span class="num font-display text-2xl leading-none whitespace-nowrap text-ink">{{
                row.time
              }}</span>
              <span class="text-base text-ink-muted">{{ row.label }}</span>
            </div>
          </div>
        </div>

        <div class="mt-14 max-w-[64ch] text-lg leading-[1.8] text-ink">
          <p v-reveal>{{ cfg.closingParagraph }}</p>
        </div>

        <!-- Signature -->
        <div v-reveal class="mt-14 flex items-end gap-6">
          <span class="mb-3 h-px w-16 bg-accent" aria-hidden="true"></span>
          <div>
            <p class="font-display text-[2rem] leading-none text-ink italic">
              {{ cfg.signatureName }}
            </p>
            <p class="t-label mt-3 text-ink-subtle">{{ cfg.signatureRole }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.drop-cap {
  float: left;
  font-family: var(--font-display);
  font-size: 5.25rem;
  line-height: 0.78;
  margin-right: 0.625rem;
  margin-top: 0.45rem;
  color: var(--c-accent);
}
.first-paragraph {
  overflow: hidden;
}
</style>
