<script setup lang="ts">
const store = usePublicTeachingsStore()
onMounted(() => store.load())
const featured = computed(() => store.sermons.slice(0, 3))
const lead = computed(() => featured.value[0])
const rest = computed(() => featured.value.slice(1))
</script>

<template>
  <section class="section bg-surface">
    <div class="site-container">
      <!-- Header row -->
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          class="mb-0! md:mb-0!"
          title="Sermons & Teachings"
          subtitle="Biblical preaching for every season of life."
        />
        <NuxtLink
          v-reveal.200
          to="/teachings/sermons"
          class="link-line shrink-0 text-base text-ink"
          aria-label="View all sermons"
        >
          <span class="link-text">View All Sermons</span>
          <Icon icon="mdi:arrow-right" class="link-arrow h-5 w-5" />
        </NuxtLink>
      </div>

      <div class="mt-14 md:mt-20">
        <EditorialNote
          v-if="!featured.length"
          title="No sermons published yet"
          description="Recent sermons will be featured here once they are uploaded."
        />

        <!-- A lead story and two shorter entries, like a magazine's teaching pages -->
        <div v-else class="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div v-if="lead" v-reveal class="lg:col-span-7">
            <ContentCard
              :thumbnail="lead.thumbnailSrc"
              :tags="lead.tags"
              :title="lead.title"
              :author="lead.preacher"
              :date="lead.date"
              :slug="lead.slug"
              type="sermon"
            />
          </div>

          <ol v-if="rest.length" class="border-t border-rule lg:col-span-5 lg:col-start-8">
            <li
              v-for="(sermon, i) in rest"
              :key="sermon.id"
              v-reveal="{ delay: 150 + i * 120 }"
              class="border-b border-rule"
            >
              <NuxtLink
                :to="`/teachings/sermons/${sermon.slug}`"
                class="group grid grid-cols-[7rem_minmax(0,1fr)] gap-5 py-7 sm:grid-cols-[9rem_minmax(0,1fr)]"
              >
                <div class="img-zoom aspect-square bg-surface-sunken">
                  <img
                    v-if="sermon.thumbnailSrc"
                    :src="displayableImageUrl(sermon.thumbnailSrc)"
                    :alt="sermon.title"
                    loading="lazy"
                    decoding="async"
                    class="h-full w-full object-cover"
                  />
                </div>
                <div class="flex min-w-0 flex-col">
                  <div v-if="sermon.tags.length" class="mb-2 flex flex-wrap gap-x-4">
                    <CategoryBadge v-for="tag in sermon.tags.slice(0, 1)" :key="tag" :label="tag" />
                  </div>
                  <h3
                    class="line-clamp-3 font-display text-2xl leading-[1.12] text-ink transition-colors duration-300 group-hover:text-primary-ink"
                  >
                    {{ sermon.title }}
                  </h3>
                  <p class="mt-auto pt-3 text-sm text-ink-muted">
                    {{ sermon.preacher }}
                    <template v-if="sermon.date">
                      <span class="text-ink-subtle" aria-hidden="true"> / </span>
                      <span class="num">{{ sermon.date }}</span>
                    </template>
                  </p>
                </div>
              </NuxtLink>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </section>
</template>
