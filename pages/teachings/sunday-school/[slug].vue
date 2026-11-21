<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const store = usePublicTeachingsStore()

const lesson = computed(() => store.getLessonBySlug(route.params.slug as string))
const related = computed(() =>
  lesson.value
    ? lesson.value.relatedIds
        .map((id) => store.sundaySchool.find((l) => l.id === id))
        .filter(Boolean)
    : []
)

watchEffect(() => {
  if (lesson.value) {
    useSeoMeta({
      title: `${lesson.value.title} — Sunday School`,
      description: lesson.value.overviewGoals[0] ?? '',
      ogTitle: lesson.value.title,
      ogDescription: lesson.value.overviewGoals[0] ?? '',
      ogImage: displayableImageUrl(lesson.value.thumbnailSrc),
    })
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: lesson.value.title,
            description: lesson.value.overviewGoals[0] ?? '',
            thumbnailUrl: displayableImageUrl(lesson.value.thumbnailSrc),
            uploadDate: lesson.value.date,
            author: { '@type': 'Person', name: lesson.value.preacher },
          }),
        },
      ],
    })
  }
})

const copied = ref(false)
function share() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
}
</script>

<template>
  <div class="pb-20">
    <!-- Not found -->
    <div
      v-if="!lesson"
      class="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center"
    >
      <Icon
        icon="mdi:alert-circle-outline"
        class="mb-4 size-14 text-ink-subtle"
        aria-hidden="true"
      />
      <h1 class="mb-3 font-display text-3xl font-bold text-secondary">Lesson Not Found</h1>
      <p class="mb-6 max-w-md text-base leading-relaxed text-ink-muted">
        The lesson you're looking for doesn't exist or has been removed.
      </p>
      <NuxtLink
        to="/teachings/sunday-school"
        class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-on-primary shadow-xs transition-colors duration-150 hover:bg-primary-hover"
        aria-label="Back to Sunday School"
      >
        Back to Sunday School
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <div class="border-b border-rule bg-canvas">
        <div class="mx-auto max-w-3xl px-5 py-3 sm:px-6">
          <nav class="flex items-center gap-1.5 text-sm text-ink-subtle" aria-label="Breadcrumb">
            <NuxtLink
              to="/"
              class="rounded-sm py-1 transition-colors duration-150 hover:text-primary-ink"
              >Home</NuxtLink
            >
            <Icon icon="mdi:chevron-right" class="size-4 shrink-0" aria-hidden="true" />
            <NuxtLink
              to="/teachings/sunday-school"
              class="rounded-sm py-1 transition-colors duration-150 hover:text-primary-ink"
              >Sunday School</NuxtLink
            >
            <Icon icon="mdi:chevron-right" class="size-4 shrink-0" aria-hidden="true" />
            <span class="line-clamp-1 text-ink-muted">{{ lesson.title }}</span>
          </nav>
        </div>
      </div>

      <article class="mx-auto max-w-3xl px-5 pt-8 sm:px-6 md:pt-10">
        <!-- Lesson thumbnail -->
        <div
          class="relative overflow-hidden rounded-lg border border-rule shadow-xs"
          style="aspect-ratio: 16/9"
        >
          <img
            :src="displayableImageUrl(lesson.thumbnailSrc)"
            :alt="lesson.title"
            loading="lazy"
            class="h-full w-full object-cover"
          />
          <div class="absolute inset-0 flex items-center justify-center bg-secondary/40">
            <span class="stamp rounded-sm bg-surface px-3 py-1.5 shadow-xs"> Sunday School </span>
          </div>
        </div>

        <!-- Title + meta -->
        <header class="mt-8 margin-rule">
          <!-- Tags -->
          <div class="flex flex-wrap gap-2">
            <CategoryBadge v-for="tag in lesson.tags" :key="tag" :label="tag" />
          </div>

          <h1
            class="mt-4 font-display text-[2rem] leading-[1.15] font-bold text-secondary md:text-[2.5rem]"
          >
            {{ lesson.title }}
          </h1>

          <div class="stamp mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span class="flex items-center gap-1.5">
              <Icon icon="mdi:account-outline" class="size-4" aria-hidden="true" />
              {{ lesson.preacher }}
            </span>
            <span class="num flex items-center gap-1.5">
              <Icon icon="mdi:calendar-outline" class="size-4" aria-hidden="true" />
              {{ lesson.date }}
            </span>
          </div>
        </header>

        <!-- Lesson Overview -->
        <section class="mt-10 border-t border-rule pt-8">
          <h2 class="mb-6 font-display text-2xl font-bold text-secondary">Lesson Overview</h2>

          <!-- Overview Goals -->
          <div class="mb-10">
            <h3 class="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-ink">
              <Icon
                icon="mdi:bookmark-outline"
                class="size-5 text-primary-ink"
                aria-hidden="true"
              />
              Why This Lesson?
            </h3>
            <ul class="prose-register divide-y divide-rule border-y border-rule">
              <li
                v-for="(goal, i) in lesson.overviewGoals"
                :key="i"
                class="flex items-start gap-3 py-3"
              >
                <Icon
                  icon="mdi:check-circle-outline"
                  class="mt-1 size-5 shrink-0 text-primary-ink"
                  aria-hidden="true"
                />
                {{ goal }}
              </li>
            </ul>
          </div>

          <!-- Scripture pull-quote -->
          <blockquote
            class="mb-10 max-w-[68ch] border-y border-rule py-6 font-display text-lg leading-relaxed text-secondary italic md:text-xl"
          >
            {{ lesson.scripture }}
          </blockquote>

          <!-- Church Duties section -->
          <div>
            <h3 class="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-ink">
              <Icon icon="mdi:bank-outline" class="size-5 text-primary-ink" aria-hidden="true" />
              Duty of the Church
            </h3>
            <ul class="prose-register divide-y divide-rule border-y border-rule">
              <li
                v-for="(duty, i) in lesson.churchDuties"
                :key="i"
                class="flex items-start gap-3 py-3"
              >
                <Icon
                  icon="mdi:check-circle-outline"
                  class="mt-1 size-5 shrink-0 text-success"
                  aria-hidden="true"
                />
                {{ duty }}
              </li>
            </ul>
          </div>
        </section>

        <!-- Share -->
        <section class="mt-12 rounded-lg border border-rule bg-canvas p-5 sm:p-6">
          <h3 class="mb-4 font-display text-lg font-semibold text-ink">Share This Message</h3>
          <div class="flex flex-col gap-3 sm:flex-row">
            <button
              class="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-on-primary shadow-xs transition-colors duration-150 hover:bg-primary-hover"
              aria-label="Share lesson link"
              @click="share"
            >
              <Icon
                :icon="copied ? 'mdi:check' : 'mdi:share-variant-outline'"
                class="size-4"
                aria-hidden="true"
              />
              {{ copied ? 'Link Copied!' : 'Share Lesson' }}
            </button>
            <div class="flex flex-1 gap-3">
              <a
                href="#"
                aria-label="Share on Facebook"
                class="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-rule-strong bg-surface px-3 text-sm font-medium text-ink shadow-xs transition-colors duration-150 hover:bg-surface-sunken"
              >
                <Icon icon="mdi:facebook" class="size-5 text-[#1877F2]" aria-hidden="true" />
                Facebook
              </a>
              <a
                href="#"
                aria-label="Share on WhatsApp"
                class="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-rule-strong bg-surface px-3 text-sm font-medium text-ink shadow-xs transition-colors duration-150 hover:bg-surface-sunken"
              >
                <Icon icon="mdi:whatsapp" class="size-5 text-[#1DA851]" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>
        </section>

        <!-- Related lessons -->
        <section class="mt-12">
          <h3 class="mb-4 font-display text-xl font-bold text-secondary">Related Lessons</h3>
          <div class="divide-y divide-rule border-y border-rule">
            <div v-for="rel in related.slice(0, 3)" :key="rel!.id" class="group">
              <NuxtLink
                :to="`/teachings/sunday-school/${rel!.slug}`"
                class="-mx-2 flex gap-4 rounded-md px-2 py-4 transition-colors duration-150 hover:bg-surface-muted"
              >
                <img
                  :src="displayableImageUrl(rel!.thumbnailSrc)"
                  :alt="rel!.title"
                  loading="lazy"
                  decoding="async"
                  class="h-18 w-28 shrink-0 rounded-md border border-rule object-cover sm:h-20 sm:w-32"
                />
                <div class="min-w-0 flex-1">
                  <div class="mb-1 flex flex-wrap gap-1">
                    <CategoryBadge v-for="tag in rel!.tags.slice(0, 1)" :key="tag" :label="tag" />
                  </div>
                  <p
                    class="line-clamp-2 font-display text-base leading-snug font-semibold text-ink transition-colors duration-150 group-hover:text-primary-ink"
                  >
                    {{ rel!.title }}
                  </p>
                  <p class="mt-1 flex items-center gap-1 text-sm font-medium text-primary-ink">
                    Read more <Icon icon="mdi:arrow-right" class="size-4" aria-hidden="true" />
                  </p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </section>
      </article>
    </template>
  </div>
</template>
