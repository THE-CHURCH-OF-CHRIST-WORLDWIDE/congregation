<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const store = usePublicTeachingsStore()

const sermon = computed(() => store.getSermonBySlug(route.params.slug as string))
const related = computed(() =>
  sermon.value
    ? sermon.value.relatedIds.map((id) => store.sermons.find((s) => s.id === id)).filter(Boolean)
    : []
)

watchEffect(() => {
  if (sermon.value) {
    useSeoMeta({
      title: `${sermon.value.title} — Sermons`,
      description: sermon.value.description,
      ogTitle: sermon.value.title,
      ogDescription: sermon.value.description,
      ogImage: displayableImageUrl(sermon.value.thumbnailSrc),
    })
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: sermon.value.title,
            description: sermon.value.description,
            thumbnailUrl: displayableImageUrl(sermon.value.thumbnailSrc),
            uploadDate: sermon.value.date,
            author: { '@type': 'Person', name: sermon.value.preacher },
          }),
        },
      ],
    })
  }
})

const viewCount = ref(Math.floor(Math.random() * 3000) + 500)

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
  <div class="pb-24 md:pb-32">
    <!-- Not found -->
    <div v-if="!sermon" class="site-container flex min-h-[60vh] flex-col justify-center py-20">
      <div class="max-w-2xl border-t border-rule-strong pt-10">
        <h1 class="t-h1 text-ink">Sermon <span class="t-turn">Not Found</span></h1>
        <p class="t-lede mt-6 max-w-md">
          The sermon you're looking for doesn't exist or has been removed.
        </p>
        <NuxtLink
          to="/teachings/sermons"
          class="link-line mt-8 text-base text-ink"
          aria-label="Back to sermons"
        >
          <Icon icon="mdi:arrow-left" class="size-4" aria-hidden="true" />
          <span class="link-text">Back to Sermons</span>
        </NuxtLink>
      </div>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <div class="site-container pt-8 md:pt-12">
        <nav
          class="t-label flex min-w-0 items-center gap-2 text-ink-subtle"
          aria-label="Breadcrumb"
        >
          <NuxtLink to="/" class="py-2 transition-colors duration-300 hover:text-ink"
            >Home</NuxtLink
          >
          <span aria-hidden="true">/</span>
          <NuxtLink
            to="/teachings/sermons"
            class="py-2 transition-colors duration-300 hover:text-ink"
            >Sermons</NuxtLink
          >
          <span aria-hidden="true">/</span>
          <span class="line-clamp-1 text-ink-muted">{{ sermon.title }}</span>
        </nav>
      </div>

      <article>
        <!-- Title + meta -->
        <header class="site-container pt-10 md:pt-16">
          <h1 class="t-h1 max-w-[18ch] text-ink">
            <SplitReveal :text="sermon.title" immediate :delay="100" />
          </h1>

          <div class="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            <CategoryBadge v-for="tag in sermon.tags" :key="tag" :label="tag" />
            <CategoryBadge label="Faith" />
            <CategoryBadge label="Growth" />
            <CategoryBadge label="Discipline" />
          </div>

          <!-- Ruled metadata row -->
          <dl
            v-reveal.300
            class="mt-12 grid grid-cols-2 border-t border-rule-strong sm:grid-cols-3 md:mt-16 lg:w-2/3"
          >
            <div class="col-span-2 border-b border-rule py-4 pr-6 sm:col-span-1 sm:border-b-0">
              <dt class="t-label text-ink-subtle">Preacher</dt>
              <dd class="mt-2 text-base font-medium text-ink">{{ sermon.preacher }}</dd>
            </div>
            <div class="py-4 pr-6 sm:border-l sm:border-rule sm:pl-6">
              <dt class="t-label text-ink-subtle">Date</dt>
              <dd class="num mt-2 text-base font-medium text-ink">{{ sermon.date }}</dd>
            </div>
            <div class="border-l border-rule py-4 pl-6">
              <dt class="t-label text-ink-subtle">Views</dt>
              <dd class="num mt-2 text-base font-medium text-ink">
                {{ viewCount.toLocaleString() }} views
              </dd>
            </div>
          </dl>
        </header>

        <!-- Video: the hero frame -->
        <div class="site-container mt-10 md:mt-14">
          <div v-reveal="{ type: 'unveil', delay: 150 }">
            <VideoPlayer
              :src="sermon.videoSrc"
              :thumbnail="sermon.thumbnailSrc"
              :title="sermon.title"
            />
          </div>
        </div>

        <!-- Lesson Content -->
        <section class="site-container mt-16 md:mt-24">
          <div class="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <!-- Marginalia -->
            <aside class="lg:col-span-3">
              <div
                class="border-t border-rule-strong pt-5 lg:sticky lg:top-[calc(var(--nav-h)+2rem)]"
              >
                <h2 class="t-h3 text-ink">Lesson Content</h2>
                <!-- Only offered when a handout has actually been attached. -->
                <a
                  v-if="sermon.documentUrl"
                  :href="sermon.documentUrl"
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-line mt-4 text-sm text-ink"
                  :aria-label="`Download the handout for ${sermon.title}`"
                >
                  <Icon icon="mdi:tray-arrow-down" class="size-4" aria-hidden="true" />
                  <span class="link-text">Download handout</span>
                </a>
              </div>
            </aside>

            <div class="lg:col-span-8 lg:col-start-5">
              <p class="prose-register drop-cap">{{ sermon.description }}</p>

              <!-- Why this lesson -->
              <div class="mt-16">
                <h3 class="t-h3 text-ink">Key Lesson Points</h3>
                <ol class="prose-register mt-6 border-t border-rule">
                  <li
                    v-for="(point, i) in sermon.lessonPoints"
                    :key="i"
                    class="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-5"
                  >
                    <span class="num font-display text-2xl leading-none text-accent italic">{{
                      String(i + 1).padStart(2, '0')
                    }}</span>
                    <span>{{ point }}</span>
                  </li>
                </ol>
              </div>

              <!-- Divider + scripture -->
              <div class="mt-16">
                <h3 class="t-h3 text-ink">Why Be a Soul Winner?</h3>
                <ol class="prose-register mt-6 border-t border-rule">
                  <li
                    v-for="(point, i) in sermon.soulWinnerPoints"
                    :key="i"
                    class="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-5"
                  >
                    <span class="num font-display text-2xl leading-none text-accent italic">{{
                      String(i + 1).padStart(2, '0')
                    }}</span>
                    <span>{{ point }}</span>
                  </li>
                </ol>
              </div>

              <!-- Share -->
              <section
                class="mt-16 flex flex-col gap-5 border-y border-rule-strong py-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <h3 class="t-label text-ink-subtle">Share This Message</h3>
                <div class="flex flex-wrap items-center gap-x-7 gap-y-3">
                  <button
                    class="btn btn-primary min-h-12"
                    aria-label="Share sermon link"
                    @click="share"
                  >
                    <Icon
                      :icon="copied ? 'mdi:check' : 'mdi:share-variant-outline'"
                      class="size-4"
                      aria-hidden="true"
                    />
                    {{ copied ? 'Link Copied!' : 'Share Sermon' }}
                  </button>
                  <a href="#" aria-label="Share on Facebook" class="link-line text-sm text-ink">
                    <Icon icon="mdi:facebook" class="size-4" aria-hidden="true" />
                    <span class="link-text">Facebook</span>
                  </a>
                  <a href="#" aria-label="Share on WhatsApp" class="link-line text-sm text-ink">
                    <Icon icon="mdi:whatsapp" class="size-4" aria-hidden="true" />
                    <span class="link-text">WhatsApp</span>
                  </a>
                </div>
              </section>
            </div>
          </div>
        </section>

        <!-- Related messages -->
        <section class="site-container mt-24 md:mt-32">
          <div class="grid gap-8 lg:grid-cols-12">
            <h3 class="t-h2 text-ink lg:col-span-3">
              <SplitReveal text="Related Messages" />
            </h3>
            <ol class="border-t border-rule-strong lg:col-span-8 lg:col-start-5">
              <li
                v-for="(rel, i) in related.slice(0, 3)"
                :key="rel!.id"
                v-reveal="{ delay: i * 90 }"
                class="border-b border-rule"
              >
                <NuxtLink
                  :to="`/teachings/sermons/${rel!.slug}`"
                  class="group grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-5 py-6 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:gap-8"
                >
                  <div class="img-zoom aspect-[4/3] bg-surface-sunken">
                    <img
                      v-if="rel!.thumbnailSrc"
                      :src="displayableImageUrl(rel!.thumbnailSrc)"
                      :alt="rel!.title"
                      loading="lazy"
                      decoding="async"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-end bg-primary p-3 font-display text-lg leading-none text-on-night/30 italic"
                      aria-hidden="true"
                    >
                      {{ rel!.title.charAt(0) }}
                    </div>
                  </div>
                  <div class="min-w-0">
                    <p
                      class="line-clamp-2 font-display text-2xl leading-[1.12] text-ink transition-colors duration-300 group-hover:text-primary-ink"
                    >
                      {{ rel!.title }}
                    </p>
                    <div class="mt-2 flex flex-wrap gap-x-4">
                      <CategoryBadge v-for="tag in rel!.tags.slice(0, 1)" :key="tag" :label="tag" />
                    </div>
                    <p class="link-line mt-1 min-h-0 text-sm text-ink-muted sm:hidden">
                      <span class="link-text">Read more</span>
                    </p>
                  </div>
                  <span class="link-line hidden text-sm text-ink sm:inline-flex">
                    <span class="link-text">Read more</span>
                    <Icon icon="mdi:arrow-right" class="link-arrow size-4" aria-hidden="true" />
                  </span>
                </NuxtLink>
              </li>
            </ol>
          </div>
        </section>
      </article>
    </template>
  </div>
</template>

<style scoped>
/* A serif drop cap opens the message */
.drop-cap::first-letter {
  float: left;
  font-family: var(--font-display);
  font-size: 4.6em;
  line-height: 0.82;
  padding: 0.06em 0.12em 0 0;
  color: var(--c-primary-ink);
}
</style>
