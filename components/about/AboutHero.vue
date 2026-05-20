<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings.aboutHero)
</script>

<template>
  <div class="relative h-[200px] w-full overflow-hidden md:h-[280px]">
    <!-- Background image -->
    <img
      :src="cfg.backgroundImage"
      alt="Congregation gathering"
      class="absolute inset-0 h-full w-full object-cover object-center"
    />

    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-black/65"></div>

    <!-- Centered text -->
    <div class="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
      <p
        v-if="cfg.scriptureRef"
        class="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-300"
      >
        {{ cfg.scriptureRef }}
      </p>
      <h1 class="font-serif text-4xl font-bold text-white md:text-5xl">{{ cfg.title }}</h1>
      <p v-if="cfg.subtitle" class="mt-3 text-base font-light text-white/80 md:text-lg">
        {{ cfg.subtitle }}
      </p>
    </div>
  </div>
</template>
