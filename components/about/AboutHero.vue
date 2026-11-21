<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.aboutHero)

// Presentational only: if the photograph is missing or fails to load, the cover closes
// on the night field instead of showing a broken frame.
const imgFailed = ref(false)
watch(
  () => cfg.value.backgroundImage,
  () => (imgFailed.value = false)
)
const showImage = computed(() => !!cfg.value.backgroundImage && !imgFailed.value)
</script>

<template>
  <section class="relative" aria-labelledby="about-title">
    <!-- ── The cover: title set like a masthead on the night field ── -->
    <div
      :class="[
        'field-night relative isolate overflow-hidden pt-[calc(var(--nav-h)+4rem)] sm:pt-[calc(var(--nav-h)+6rem)]',
        showImage ? 'pb-16 sm:pb-24' : 'pb-20 sm:pb-28',
      ]"
    >
      <!-- A quiet initial behind the masthead -->
      <span
        aria-hidden="true"
        class="pointer-events-none absolute -top-[0.12em] right-[var(--site-gutter)] -z-10 font-display text-[clamp(16rem,38vw,34rem)] leading-none text-on-night/[0.04] italic select-none"
        >{{ (cfg.title || 'A').charAt(0) }}</span
      >

      <div class="site-container">
        <h1 id="about-title" class="t-display max-w-[14ch] text-on-night">
          <SplitReveal :text="cfg.title" immediate :delay="200" :stagger="70" />
        </h1>

        <div
          class="mt-12 grid gap-6 border-t border-on-night/20 pt-7 md:grid-cols-12 md:gap-8 lg:mt-16"
        >
          <p
            v-if="cfg.scriptureRef"
            class="hero-animate t-turn num text-2xl leading-tight text-champagne md:col-span-4"
            style="animation-delay: 650ms"
          >
            {{ cfg.scriptureRef }}
          </p>
          <p
            v-if="cfg.subtitle"
            class="hero-animate t-lede max-w-[46ch] text-on-night-muted md:col-span-7 md:col-start-6"
            style="animation-delay: 800ms"
          >
            {{ cfg.subtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── The congregation's photograph, set across the seam between night and page ── -->
    <div
      v-if="showImage"
      class="bg-[linear-gradient(to_bottom,var(--c-night)_0,var(--c-night)_45%,var(--c-surface)_45%)]"
    >
      <div class="site-container">
        <div
          v-reveal="{ type: 'unveil', delay: 300 }"
          class="relative aspect-[4/3] overflow-hidden bg-night-raised sm:aspect-[16/9] lg:aspect-[21/9]"
        >
          <div v-parallax="0.12" class="absolute inset-x-0 -inset-y-[8%]">
            <img
              :src="displayableImageUrl(cfg.backgroundImage)"
              alt="Congregation gathering"
              class="h-full w-full object-cover object-center"
              @error="imgFailed = true"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
