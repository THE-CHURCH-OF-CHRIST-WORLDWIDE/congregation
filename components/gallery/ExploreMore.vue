<script setup lang="ts">
const route = useRoute()
const { galleries } = useGalleryData('')

/**
 * Every category except the one being viewed. The tile art is the category's
 * first photo, so tiles show a real image or a neutral placeholder block —
 * never a stock image standing in for church content.
 */
const categories = computed(() =>
  Object.entries(galleries)
    .filter(([slug]) => slug !== route.params.category)
    .map(([slug, gallery]) => ({
      slug,
      label: gallery.title,
      src: gallery.images[0]?.src ?? '',
    }))
)
</script>

<template>
  <section class="section border-t border-rule bg-surface-muted">
    <div class="site-container">
      <h2 class="t-h1 max-w-3xl text-secondary">
        <SplitReveal text="Explore More Images" />
      </h2>

      <div class="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-3 md:mt-16 lg:gap-x-8">
        <NuxtLink
          v-for="(cat, i) in categories"
          :key="cat.slug"
          :to="`/gallery/${cat.slug}`"
          class="group block"
          :aria-label="`${cat.label} gallery`"
        >
          <div
            v-reveal="{ type: 'unveil', delay: Math.min(i, 4) * 90 }"
            class="img-zoom relative aspect-[16/10] bg-surface-sunken sm:aspect-[4/5]"
          >
            <img
              v-if="cat.src"
              :src="displayableImageUrl(cat.src)"
              :alt="cat.label"
              class="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <!-- No photograph yet: a forest panel carrying the category's initial -->
            <div
              v-else
              class="field-forest absolute inset-0 flex items-end p-6 transition-colors duration-500 group-hover:bg-primary-hover"
              aria-hidden="true"
            >
              <span
                class="font-display text-[clamp(5rem,12vw,9rem)] leading-[0.8] text-on-night/30 italic"
                >{{ cat.label.charAt(0) }}</span
              >
            </div>
          </div>
          <div class="mt-5 flex items-baseline justify-between gap-4 border-t border-rule pt-4">
            <span class="t-h3 text-ink">{{ cat.label }}</span>
            <Icon
              icon="mdi:arrow-right"
              class="h-5 w-5 shrink-0 text-ink-subtle transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-accent"
              aria-hidden="true"
            />
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
