<script setup lang="ts">
const s = useChurchSettingsStore()
onMounted(() => s.load())
const cfg = computed(() => s.settings)

// Presentation only: the typographic portrait drops a leading honorific ("Min.", "Bro.") so it
// sets the name itself, and only photographs that exist get a frame.
const portraitName = computed(() =>
  (cfg.value.ministerName || '').replace(/^(\S+\.\s+)+/, '').trim()
)
const photos = computed(() => (cfg.value.congregationPhotos || []).slice(0, 2).filter(Boolean))
const p1 = computed(() => cfg.value.ministerLetterP1 || '')
</script>

<template>
  <section
    id="welcome"
    class="section scroll-mt-20 bg-surface"
    aria-label="Welcome letter from our minister"
  >
    <div class="site-container grid gap-14 lg:grid-cols-12 lg:gap-8">
      <!-- ── Left: portrait, with two congregation photographs set off its edge ── -->
      <div aria-hidden="true" class="relative lg:col-span-5">
        <div class="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
          <div v-reveal="'unveil'" class="aspect-[4/5] overflow-hidden bg-primary">
            <img
              v-if="cfg.ministerPhoto"
              :src="displayableImageUrl(cfg.ministerPhoto)"
              alt="Minister headshot"
              loading="eager"
              class="h-full w-full object-cover"
            />
            <!-- No portrait uploaded: the name itself becomes the portrait -->
            <div v-else class="flex h-full w-full flex-col justify-end p-8 sm:p-10">
              <p
                class="font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.02em] text-on-night italic"
              >
                {{ portraitName }}
              </p>
            </div>
          </div>
          <div v-if="photos.length" class="mt-3 grid grid-cols-2 gap-3">
            <div
              v-for="(photo, i) in photos"
              :key="photo"
              v-reveal="{ type: 'unveil', delay: 150 + i * 150 }"
              class="aspect-[4/3] overflow-hidden bg-surface-sunken"
              :class="i === 1 ? 'translate-y-8' : ''"
            >
              <img
                :src="displayableImageUrl(photo)"
                :alt="`Congregation gathering ${i + 1}`"
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Right: the letter ───────────────────────────────────────── -->
      <div class="lg:col-span-6 lg:col-start-7 lg:pt-6">
        <h2 class="t-h1 text-secondary">
          <SplitReveal :text="cfg.ministerLetterHeading" />
        </h2>

        <div v-reveal.150 class="mt-12 max-w-[60ch] space-y-6 text-lg leading-[1.8] text-ink">
          <p class="font-display text-[1.75rem] leading-tight text-ink italic">
            {{ cfg.ministerLetterGreeting || 'Dear Friend,' }}
          </p>
          <p class="first-paragraph">
            <span class="sr-only">{{ p1 }}</span>
            <span aria-hidden="true"
              ><span class="drop-cap">{{ p1.charAt(0) }}</span
              >{{ p1.slice(1) }}</span
            >
          </p>
          <p>{{ cfg.ministerLetterP2 }}</p>
          <p>{{ cfg.ministerLetterP3 }}</p>
          <p>{{ cfg.ministerLetterP4 }}</p>
        </div>

        <div v-reveal.250 class="mt-14 flex items-end gap-6">
          <span class="mb-3 h-px w-16 bg-accent" aria-hidden="true"></span>
          <div>
            <p class="font-display text-[2.25rem] leading-none text-ink italic">
              {{ cfg.ministerName }}
            </p>
            <p class="t-label mt-3 text-ink-subtle">{{ cfg.ministerTitle }}</p>
          </div>
        </div>
      </div>
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
