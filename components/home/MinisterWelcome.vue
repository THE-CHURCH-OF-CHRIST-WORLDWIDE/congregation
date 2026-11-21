<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings)

const { el: sectionRef, isVisible } = useScrollReveal()
</script>

<template>
  <section
    id="welcome"
    ref="sectionRef"
    class="scroll-mt-20 bg-canvas py-16 md:py-24"
    aria-label="Welcome letter from our minister"
  >
    <div
      class="mx-auto grid max-w-6xl items-start gap-12 px-5 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:px-8"
    >
      <!-- ── Left: minister's portrait above two congregation photographs ── -->
      <div aria-hidden="true" :class="['reveal-left', isVisible && 'is-visible']">
        <div class="mx-auto grid max-w-sm grid-cols-2 gap-3 md:max-w-none">
          <div
            class="col-span-2 aspect-[4/5] overflow-hidden rounded-lg border border-rule bg-surface-sunken shadow-xs"
          >
            <img
              :src="displayableImageUrl(cfg.ministerPhoto)"
              alt="Minister headshot"
              loading="eager"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="aspect-[4/3] overflow-hidden rounded-lg border border-rule bg-surface-sunken">
            <img
              :src="displayableImageUrl(cfg.congregationPhotos[0])"
              alt="Congregation gathering 1"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="aspect-[4/3] overflow-hidden rounded-lg border border-rule bg-surface-sunken">
            <img
              :src="displayableImageUrl(cfg.congregationPhotos[1])"
              alt="Congregation gathering 2"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <!-- ── Right: letter ─────────────────────────────────────────── -->
      <div
        :class="[
          'reveal-right delay-200 rounded-lg border border-rule bg-surface px-5 py-8 shadow-xs sm:px-10 sm:py-10',
          isVisible && 'is-visible',
        ]"
      >
        <div>
          <h2
            class="font-display text-[1.875rem] leading-[1.15] font-bold text-secondary md:text-[2.5rem]"
          >
            {{ cfg.ministerLetterHeading }}
          </h2>
        </div>

        <div class="mt-8 max-w-[65ch] space-y-5 text-lg leading-relaxed text-ink">
          <p class="first-paragraph">
            <span aria-hidden="true" class="drop-cap">{{
              (cfg.ministerLetterGreeting || 'D').charAt(0)
            }}</span
            >{{ (cfg.ministerLetterGreeting || 'Dear Friend,').slice(1) }}<br /><br />
            {{ cfg.ministerLetterP1 }}
          </p>
          <p>{{ cfg.ministerLetterP2 }}</p>
          <p>{{ cfg.ministerLetterP3 }}</p>
          <p>{{ cfg.ministerLetterP4 }}</p>
        </div>

        <div class="mt-10 border-t border-rule pt-5">
          <p class="font-display text-xl font-semibold text-ink">{{ cfg.ministerName }}</p>
          <p class="mt-1 text-base text-ink-muted italic">{{ cfg.ministerTitle }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.drop-cap {
  float: left;
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 700;
  line-height: 0.8;
  margin-right: 0.5rem;
  margin-top: 0.35rem;
  color: var(--c-primary);
}
.first-paragraph {
  overflow: hidden;
}
</style>
