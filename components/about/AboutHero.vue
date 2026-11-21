<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.aboutHero)
</script>

<template>
  <section class="bookcloth relative overflow-hidden">
    <div
      class="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12 md:py-16 lg:px-8 lg:py-20"
    >
      <!-- Page title -->
      <div class="hero-animate">
        <h1 class="font-display text-4xl leading-[1.1] font-bold text-white md:text-5xl">
          {{ cfg.title }}
        </h1>
        <p v-if="cfg.scriptureRef" class="mt-3 text-[15px] font-medium text-white/80">
          {{ cfg.scriptureRef }}
        </p>
        <p v-if="cfg.subtitle" class="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
          {{ cfg.subtitle }}
        </p>
      </div>

      <!-- The congregation's own photograph, framed rather than full-bleed -->
      <div class="overflow-hidden rounded-lg border border-white/15 bg-white/5 shadow-md">
        <img
          :src="displayableImageUrl(cfg.backgroundImage)"
          alt="Congregation gathering"
          class="aspect-[16/9] w-full object-cover object-center md:aspect-[4/3]"
        />
      </div>
    </div>
  </section>
</template>
